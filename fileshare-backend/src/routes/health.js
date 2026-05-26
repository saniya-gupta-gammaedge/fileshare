import { Router } from 'express'
import { pool } from '../config/db.js'

const router = Router()

// GET /api/health — used by Railway/Render health checks
router.get('/', async (req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ status: 'ok', db: 'connected', ts: new Date().toISOString() })
  } catch {
    res.status(500).json({ status: 'error', db: 'disconnected' })
  }
})

export default router
