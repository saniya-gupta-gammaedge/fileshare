import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'

function sanitizePath(rawPath) {
  const normalized = rawPath.replace(/\\/g, '/').replace(/\0/g, '').trim()
  const segments = normalized.split('/').filter((s) => s && s !== '.')
  if (segments.some((s) => s === '..')) throw new Error('Invalid file path')
  return segments.join('/')
}
import { query } from '../config/db.js'
import { uploadFile } from './storage.js'
import { parseMime } from '../utils/mime.js'
import { parseExpiry } from '../utils/expiry.js'

/**
 * Create a new share from uploaded files.
 *
 * @param {{
 *   files: Express.Multer.File[],
 *   options: { password: string, expiry: string, allowDownload: boolean },
 *   shareName?: string
 * }} params
 * @returns {{ shareId: string }}
 */
export async function createShare({ files, options }) {
  const shareId = nanoid(10)

  // Hash password if provided
  const passwordHash = options.password
    ? await bcrypt.hash(options.password, 10)
    : null

  const expiresAt = parseExpiry(options.expiry)

  // Insert share record
  await query(
    `INSERT INTO shares (id, password_hash, allow_download, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [shareId, passwordHash, options.allowDownload ?? true, expiresAt]
  )

  // Upload each file to Supabase Storage and record metadata
  await Promise.all(
    files.map(async (file) => {
      const relativePath = sanitizePath(file.originalname)
      const fileName     = relativePath.split('/').pop()
      const storageKey = `shares/${shareId}/${relativePath}`
      const mimeType   = parseMime(fileName)

      await uploadFile(storageKey, file.buffer, mimeType)

      await query(
        `INSERT INTO share_files (share_id, path, name, size, mime_type, storage_key)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [shareId, relativePath, fileName, file.size, mimeType, storageKey]
      )
    })
  )

  return { shareId }
}

/**
 * Fetch share metadata + file list.
 * Returns null if not found or expired.
 * Throws { locked: true } if password-protected and no password given.
 */
export async function getShare(shareId, password = null) {
  const { rows } = await query(
    `SELECT * FROM shares WHERE id = $1`,
    [shareId]
  )

  if (!rows.length) return null

  const share = rows[0]

  // Check expiry
  if (share.expires_at && new Date(share.expires_at) < new Date()) {
    return null   // treat as not found
  }

  // Check password
  if (share.password_hash) {
    if (!password) {
      return { locked: true }
    }
    const ok = await bcrypt.compare(password, share.password_hash)
    if (!ok) throw new Error('Wrong password')
  }

  // Increment view count (fire and forget)
  query(`UPDATE shares SET view_count = view_count + 1 WHERE id = $1`, [shareId]).catch(() => {})

  // Fetch files
  const filesResult = await query(
    `SELECT path, name, size, mime_type, storage_key
     FROM share_files WHERE share_id = $1
     ORDER BY path`,
    [shareId]
  )

  return {
    id:            share.id,
    allowDownload: share.allow_download,
    expiresAt:     share.expires_at,
    createdAt:     share.created_at,
    viewCount:     share.view_count,
    files:         filesResult.rows.map((f) => ({
      path:       f.path,
      name:       f.name,
      size:       Number(f.size),
      mimeType:   f.mime_type,
      storageKey: f.storage_key,
    })),
  }
}
