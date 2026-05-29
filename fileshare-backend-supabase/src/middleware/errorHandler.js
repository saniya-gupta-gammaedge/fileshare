import { env } from '../config/env.js'

/**
 * Global Express error handler.
 * Must be registered LAST with app.use().
 */
export function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message)

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large' })
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(413).json({ error: 'Too many files (max 500)' })
  }

  const status = err.status ?? 500
  res.status(status).json({ error: err.message })
}
