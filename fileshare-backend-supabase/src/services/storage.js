import { Readable } from 'stream'
import { supabase, BUCKET } from '../config/supabase.js'

/**
 * Upload a buffer to Supabase Storage.
 * @param {string}  key      - Storage path, e.g. "shares/abc123/src/index.js"
 * @param {Buffer}  buffer
 * @param {string}  mimeType
 */
export async function uploadFile(key, buffer, mimeType) {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(key, buffer, {
      contentType: mimeType,
      upsert: false,
    })

  if (error) throw new Error(`Storage upload failed: ${error.message}`)
  return key
}

/**
 * Download a file from Supabase Storage and return a Node.js Readable stream.
 * Used when streaming a file to the browser or into a zip.
 */
export async function getFileStream(key) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .download(key)

  if (error) throw new Error(`Storage download failed: ${error.message}`)

  // Supabase returns a Blob — convert to Buffer then wrap in Readable
  const arrayBuffer = await data.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  return Readable.from(buffer)
}

/**
 * Get a short-lived signed URL (1 hour) for direct browser access.
 * Useful to avoid proxying large images or PDFs through the backend.
 */
export async function getSignedUrl(key, expiresIn = 3600) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(key, expiresIn)

  if (error) throw new Error(`Failed to sign URL: ${error.message}`)
  return data.signedUrl
}

/**
 * Delete all files belonging to a share.
 * Lists all objects under the shares/{shareId}/ prefix then bulk-deletes.
 */
export async function deleteShareFiles(shareId) {
  const prefix = `shares/${shareId}/`

  const { data: listed, error: listErr } = await supabase.storage
    .from(BUCKET)
    .list(`shares/${shareId}`, { limit: 1000, recursive: true })

  if (listErr) throw new Error(`Failed to list files: ${listErr.message}`)
  if (!listed?.length) return

  const paths = listed.map((f) => `${prefix}${f.name}`)

  const { error: delErr } = await supabase.storage
    .from(BUCKET)
    .remove(paths)

  if (delErr) throw new Error(`Failed to delete files: ${delErr.message}`)
}
