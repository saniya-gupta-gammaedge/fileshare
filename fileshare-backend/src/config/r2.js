import { S3Client } from '@aws-sdk/client-s3'
import { env } from './env.js'

/**
 * Cloudflare R2 is S3-compatible.
 * Endpoint format: https://<accountId>.r2.cloudflarestorage.com
 */
const isLocal = Boolean(env.r2Endpoint)

export const r2 = new S3Client({
  region: isLocal ? 'us-east-1' : 'auto',
  endpoint: env.r2Endpoint || `https://${env.r2AccountId}.r2.cloudflarestorage.com`,
  forcePathStyle: isLocal, // MinIO requires path-style; R2 doesn't support it
  credentials: {
    accessKeyId:     env.r2AccessKeyId,
    secretAccessKey: env.r2SecretKey,
  },
})

export const BUCKET = env.r2Bucket
