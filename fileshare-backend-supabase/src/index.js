import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import { env } from './config/env.js'
import { migrate, pool } from './config/db.js'
import { errorHandler } from './middleware/errorHandler.js'
import { startCleanup } from './utils/cleanup.js'
import sharesRouter from './routes/shares.js'
import healthRouter from './routes/health.js'

const app = express()

// ── Security headers ─────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))
app.disable('x-powered-by')

// ── CORS ────────────────────────────────────────────────
app.use(
  cors({
    origin: [env.frontendUrl],
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-Share-Password'],
    credentials: true,
  })
)

// ── Compression ──────────────────────────────────────────
app.use(compression())

// ── HTTP logging ─────────────────────────────────────────
app.use(morgan(env.isDev ? 'dev' : 'combined'))

// ── Body parsing ────────────────────────────────────────
app.use(express.json({ limit: '1mb' }))

// ── Routes ──────────────────────────────────────────────
app.use('/api/health', healthRouter)
app.use('/api/shares', sharesRouter)

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` })
})

// ── Global error handler ────────────────────────────────
app.use(errorHandler)

// ── Boot ────────────────────────────────────────────────
async function start() {
  try {
    await migrate()
    startCleanup()

    const server = app.listen(env.port, () => {
      console.log(`✓ FileShare backend running on http://localhost:${env.port}`)
      console.log(`  ENV:    ${env.nodeEnv}`)
      console.log(`  BUCKET: ${env.supabaseBucket}`)
    })

    const shutdown = (signal) => {
      console.log(`${signal} received — shutting down gracefully`)
      server.close(async () => {
        await pool.end()
        process.exit(0)
      })
    }
    process.on('SIGTERM', () => shutdown('SIGTERM'))
    process.on('SIGINT',  () => shutdown('SIGINT'))
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

start()
