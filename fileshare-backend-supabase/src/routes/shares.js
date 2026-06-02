import { Router } from 'express'
import archiver from 'archiver'
import { upload } from '../middleware/upload.js'
import { uploadLimiter, readLimiter } from '../middleware/rateLimit.js'
import { createShare, getShare } from '../services/shares.js'
import { uploadFile, getFileStream, deleteFile } from '../services/storage.js'
import { parseMime } from '../utils/mime.js'
import { query } from '../config/db.js'

const router = Router()

// ── POST /api/shares ────────────────────────────────────
// Upload files and create a share. Returns { shareId }.
router.post(
  '/',
  uploadLimiter,
  upload.array('files'),
  async (req, res, next) => {
    try {
      if (!req.files?.length) {
        return res.status(400).json({ error: 'No files provided' })
      }

      let options = {}
      try {
        options = JSON.parse(req.body.options ?? '{}')
      } catch {
        return res.status(400).json({ error: 'Invalid options JSON' })
      }

      if (options.password !== undefined && (typeof options.password !== 'string' || options.password.length > 128)) {
        return res.status(400).json({ error: 'Invalid password' })
      }
      const VALID_EXPIRY = new Set(['1h', '24h', '1d', '7d', '30d', 'never', ''])
      if (options.expiry !== undefined && !VALID_EXPIRY.has(String(options.expiry ?? ''))) {
        return res.status(400).json({ error: 'Invalid expiry value' })
      }
      if (options.allowDownload !== undefined && typeof options.allowDownload !== 'boolean') {
        options.allowDownload = Boolean(options.allowDownload)
      }

      const result = await createShare({ files: req.files, options })
      res.status(201).json(result)
    } catch (err) {
      next(err)
    }
  }
)

// ── POST /api/shares/:shareId/files ─────────────────────
// Add files to an existing share (requires allowEdits).
router.post('/:shareId/files', uploadLimiter, upload.array('files'), async (req, res, next) => {
  try {
    const { shareId } = req.params
    const password = req.headers['x-share-password'] ?? req.query.p ?? null
    const share = await getShare(shareId, password)
    if (!share || share.locked) return res.status(share?.locked ? 401 : 404).json({ error: 'Not found' })
    if (!share.allowEdits) return res.status(403).json({ error: 'Editing not allowed for this share' })
    if (!req.files?.length) return res.status(400).json({ error: 'No files provided' })

    await Promise.all(req.files.map(async (file) => {
      const relativePath = file.originalname.replace(/\\/g, '/').replace(/\0/g, '').trim()
      const fileName = relativePath.split('/').pop()
      const storageKey = `shares/${shareId}/${relativePath}`
      const mimeType = parseMime(fileName)
      await uploadFile(storageKey, file.buffer, mimeType)
      await query(
        `INSERT INTO share_files (share_id, path, name, size, mime_type, storage_key)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT DO NOTHING`,
        [shareId, relativePath, fileName, file.size, mimeType, storageKey]
      )
    }))
    res.status(201).json({ ok: true })
  } catch (err) { next(err) }
})

// ── DELETE /api/shares/:shareId/files ────────────────────
// Remove ALL files from a share (requires allowEdits).
router.delete('/:shareId/files', async (req, res, next) => {
  try {
    const { shareId } = req.params
    const password = req.headers['x-share-password'] ?? req.query.p ?? null
    const share = await getShare(shareId, password)
    if (!share || share.locked) return res.status(share?.locked ? 401 : 404).json({ error: 'Not found' })
    if (!share.allowEdits) return res.status(403).json({ error: 'Editing not allowed for this share' })

    const { rows } = await query(`SELECT storage_key FROM share_files WHERE share_id = $1`, [shareId])
    await Promise.all(rows.map((r) => deleteFile(r.storage_key).catch(() => {})))
    await query(`DELETE FROM share_files WHERE share_id = $1`, [shareId])
    res.json({ ok: true })
  } catch (err) { next(err) }
})

// ── DELETE /api/shares/:shareId/files/:fileId ────────────
// Remove a file from a share (requires allowEdits).
router.delete('/:shareId/files/:fileId', async (req, res, next) => {
  try {
    const { shareId, fileId } = req.params
    const password = req.headers['x-share-password'] ?? req.query.p ?? null
    const share = await getShare(shareId, password)
    if (!share || share.locked) return res.status(share?.locked ? 401 : 404).json({ error: 'Not found' })
    if (!share.allowEdits) return res.status(403).json({ error: 'Editing not allowed for this share' })

    const { rows } = await query(`SELECT storage_key FROM share_files WHERE id = $1 AND share_id = $2`, [fileId, shareId])
    if (!rows.length) return res.status(404).json({ error: 'File not found' })

    await deleteFile(rows[0].storage_key)
    await query(`DELETE FROM share_files WHERE id = $1`, [fileId])
    res.json({ ok: true })
  } catch (err) { next(err) }
})

// ── GET /api/shares/:shareId ─────────────────────────────
// Returns share metadata + file list.
// Locked shares return { locked: true } unless X-Share-Password header is set.
router.get('/:shareId', readLimiter, async (req, res, next) => {
  try {
    const password = req.headers['x-share-password'] ?? null
    const share    = await getShare(req.params.shareId, password)

    if (!share)             return res.status(404).json({ error: 'Share not found or expired' })
    if (share.locked)       return res.status(200).json({ locked: true })

    // Don't send storageKey to the client — it's internal
    const safeShare = {
      ...share,
      files: share.files.map(({ storageKey, ...f }) => f),
    }

    res.json(safeShare)
  } catch (err) {
    if (err.message === 'Wrong password') {
      return res.status(401).json({ error: 'Wrong password' })
    }
    next(err)
  }
})

// ── GET /api/shares/:shareId/files/:filePath ─────────────
// Stream a single file from Supabase Storage back to the browser.
// filePath is URL-encoded, e.g. "src%2Findex.js" → "src/index.js"
router.get('/:shareId/files/:filePath(*)', readLimiter, async (req, res, next) => {
  try {
    const { shareId, filePath } = req.params
    const password = req.headers['x-share-password'] ?? req.query.p ?? null

    // Verify share exists + not locked (reuse getShare auth logic)
    const share = await getShare(shareId, password)
    if (!share || share.locked) {
      return res.status(share?.locked ? 401 : 404).json({ error: 'Not found' })
    }

    // Look up the specific file's storage key
    const { rows } = await query(
      `SELECT storage_key, mime_type, name FROM share_files
       WHERE share_id = $1 AND path = $2`,
      [shareId, filePath]
    )

    if (!rows.length) return res.status(404).json({ error: 'File not found' })

    const { storage_key, mime_type, name } = rows[0]
    const stream = await getFileStream(storage_key)

    const safeName = name.replace(/[\r\n"\\]/g, '_')
    const inlineTypes = /^(image\/|text\/|application\/pdf$)/
    const disposition = inlineTypes.test(mime_type) ? 'inline' : 'attachment'
    res.setHeader('Content-Type', mime_type)
    res.setHeader('Content-Disposition', `${disposition}; filename="${safeName}"`)
    res.setHeader('Cache-Control', 'public, max-age=3600')

    stream.pipe(res)
  } catch (err) {
    next(err)
  }
})

// ── GET /api/shares/:shareId/download ───────────────────
// Stream a zip of ALL files in the share.
router.get('/:shareId/download', readLimiter, async (req, res, next) => {
  try {
    const { shareId } = req.params
    const password = req.headers['x-share-password'] ?? req.query.p ?? null

    const share = await getShare(shareId, password)
    if (!share || share.locked) {
      return res.status(share?.locked ? 401 : 404).json({ error: 'Not found' })
    }
    if (!share.allowDownload) {
      return res.status(403).json({ error: 'Download disabled for this share' })
    }

    // Re-fetch with storage keys for zip building
    const { rows: files } = await query(
      `SELECT path, name, storage_key FROM share_files WHERE share_id = $1`,
      [shareId]
    )

    res.setHeader('Content-Type', 'application/zip')
    res.setHeader('Content-Disposition', `attachment; filename="${shareId}.zip"`)

    const archive = archiver('zip', { zlib: { level: 6 } })
    archive.on('error', (err) => next(err))
    archive.pipe(res)

    for (const file of files) {
      const stream = await getFileStream(file.storage_key)
      archive.append(stream, { name: file.path })
    }

    await archive.finalize()
  } catch (err) {
    next(err)
  }
})

export default router
