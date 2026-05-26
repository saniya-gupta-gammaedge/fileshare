import multer from 'multer'
import { env } from '../config/env.js'

/**
 * Store files in memory (buffer) — we stream straight to R2.
 * For very large uploads you'd swap this for disk storage,
 * but memory works great up to ~100 MB total.
 */
const storage = multer.memoryStorage()

export const upload = multer({
  storage,
  limits: {
    fileSize:  env.maxUploadBytes,
    files:     500,   // max files per share
  },
})
