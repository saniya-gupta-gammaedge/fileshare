import { query } from '../config/db.js'
import { deleteShareFiles } from '../services/storage.js'

const CLEANUP_INTERVAL_MS = 60 * 60 * 1000 // 1 hour

export async function cleanupExpiredShares() {
  const { rows } = await query(
    `DELETE FROM shares WHERE expires_at IS NOT NULL AND expires_at < NOW() RETURNING id`
  )
  for (const { id } of rows) {
    await deleteShareFiles(id).catch((err) =>
      console.error(`[cleanup] Failed to delete R2 files for share ${id}:`, err.message)
    )
  }
  if (rows.length) {
    console.log(`[cleanup] Removed ${rows.length} expired share(s)`)
  }
}

export function startCleanup() {
  cleanupExpiredShares().catch(console.error)
  setInterval(() => cleanupExpiredShares().catch(console.error), CLEANUP_INTERVAL_MS)
}
