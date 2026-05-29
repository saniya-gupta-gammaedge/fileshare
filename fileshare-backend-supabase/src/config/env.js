import 'dotenv/config'

function require(key) {
  const val = process.env[key]
  if (!val) throw new Error(`Missing required env var: ${key}`)
  return val
}

function optional(key, fallback = '') {
  return process.env[key] ?? fallback
}

export const env = {
  port:            Number(optional('PORT', '4000')),
  nodeEnv:         optional('NODE_ENV', 'development'),
  isDev:           optional('NODE_ENV', 'development') === 'development',

  databaseUrl:        optional('DATABASE_URL', 'postgresql://neondb_owner:npg_WB5eZGQEgX9V@ep-proud-math-ao9e5u95.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'),

  supabaseUrl:        optional('SUPABASE_URL', 'https://veniaiqjknnqbahavqac.supabase.co'),
  supabaseServiceKey: optional('SUPABASE_SERVICE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlbmlhaXFqa25ucWJhaGF2cWFjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTc3NjU5NiwiZXhwIjoyMDk1MzUyNTk2fQ.2GuvVTxn_KhcEJLDyf9U5PZakEuFpwejYnhDus5iMNs'),
  supabaseBucket:     optional('SUPABASE_BUCKET', 'fileshare'),

  frontendUrl:     optional('FRONTEND_URL', 'https://fileshare-lovat.vercel.app'),
  maxUploadBytes:  Number(optional('MAX_UPLOAD_BYTES', String(100 * 1024 * 1024))),
  appSecret:       optional('APP_SECRET', 'dev_secret'),
}

if (env.nodeEnv === 'production' && env.appSecret === 'dev_secret') {
  console.warn('[WARN] APP_SECRET is set to the default value in production — set a strong secret')
}
