import pg from 'pg'
import { env } from './env.js'

const { Pool } = pg

export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: env.isDev ? false : { rejectUnauthorized: false },
  max: 10,
})

/**
 * Run a query. Always release the client.
 */
export async function query(sql, params = []) {
  const client = await pool.connect()
  try {
    return await client.query(sql, params)
  } finally {
    client.release()
  }
}

/**
 * Bootstrap — create tables if they don't exist.
 * Called once on server startup.
 */
export async function migrate() {
  await query(`
    CREATE TABLE IF NOT EXISTS shares (
      id            TEXT PRIMARY KEY,
      name          TEXT,
      password_hash TEXT,              -- null = no password
      allow_download BOOLEAN NOT NULL DEFAULT TRUE,
      expires_at    TIMESTAMPTZ,       -- null = never
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      view_count    INTEGER NOT NULL DEFAULT 0
    );
  `)

  await query(`
    CREATE TABLE IF NOT EXISTS share_files (
      id          SERIAL PRIMARY KEY,
      share_id    TEXT NOT NULL REFERENCES shares(id) ON DELETE CASCADE,
      path        TEXT NOT NULL,         -- relative path, e.g. "src/index.js"
      name        TEXT NOT NULL,         -- filename only
      size        BIGINT NOT NULL,
      mime_type   TEXT NOT NULL DEFAULT 'application/octet-stream',
      storage_key TEXT NOT NULL          -- path inside Supabase Storage bucket
    );
  `)

  await query(`
    CREATE INDEX IF NOT EXISTS share_files_share_id
      ON share_files(share_id);
  `)

  console.log('✓ DB migration complete')
}
