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

  databaseUrl:        require('DATABASE_URL'),

  supabaseUrl:        require('SUPABASE_URL'),
  supabaseServiceKey: require('SUPABASE_SERVICE_KEY'),
  supabaseBucket:     optional('SUPABASE_BUCKET', 'fileshare'),

  frontendUrl:     optional('FRONTEND_URL', 'http://localhost:5173'),
  maxUploadBytes:  Number(optional('MAX_UPLOAD_BYTES', String(100 * 1024 * 1024))),
  appSecret:       optional('APP_SECRET', 'dev_secret'),
}

if (env.nodeEnv === 'production' && env.appSecret === 'dev_secret') {
  console.warn('[WARN] APP_SECRET is set to the default value in production — set a strong secret')
}
