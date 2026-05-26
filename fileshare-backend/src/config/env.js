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

  databaseUrl:     require('DATABASE_URL'),

  r2AccountId:     require('R2_ACCOUNT_ID'),
  r2AccessKeyId:   require('R2_ACCESS_KEY_ID'),
  r2SecretKey:     require('R2_SECRET_ACCESS_KEY'),
  r2Bucket:        require('R2_BUCKET_NAME'),
  r2PublicUrl:     optional('R2_PUBLIC_URL'),
  r2Endpoint:      optional('R2_ENDPOINT'), // override for local MinIO dev

  frontendUrl:     optional('FRONTEND_URL', 'http://localhost:5173'),
  maxUploadBytes:  Number(optional('MAX_UPLOAD_BYTES', String(100 * 1024 * 1024))),
  appSecret:       optional('APP_SECRET', 'dev_secret'),
}

// Warn loudly if running in production with insecure defaults
if (env.nodeEnv === 'production' && env.appSecret === 'dev_secret') {
  console.warn('[WARN] APP_SECRET is set to the default value in production — set a strong secret')
}
