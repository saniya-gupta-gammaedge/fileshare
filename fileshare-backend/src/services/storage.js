import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { r2, BUCKET } from '../config/r2.js'
import { env } from '../config/env.js'

/**
 * Upload a buffer/stream to R2.
 * @param {string} key      - Storage key, e.g. "shares/abc123/src/index.js"
 * @param {Buffer|Readable} body
 * @param {string} mimeType
 */
export async function uploadToR2(key, body, mimeType) {
  await r2.send(
    new PutObjectCommand({
      Bucket:      BUCKET,
      Key:         key,
      Body:        body,
      ContentType: mimeType,
    })
  )
  return key
}

/**
 * Get a readable stream for a stored file.
 */
export async function getR2Stream(key) {
  const res = await r2.send(
    new GetObjectCommand({ Bucket: BUCKET, Key: key })
  )
  return res.Body // Readable stream
}

/**
 * Generate a short-lived presigned URL for direct browser access.
 * Useful for images, PDFs — avoids proxying through the backend.
 */
export async function getPresignedUrl(key, expiresIn = 3600) {
  // If bucket is public, just return a direct URL
  if (env.r2PublicUrl) {
    return `${env.r2PublicUrl}/${key}`
  }

  return getSignedUrl(
    r2,
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn }
  )
}

/**
 * Delete all objects under a prefix (used when a share is deleted).
 */
export async function deleteShareFiles(shareId) {
  const prefix = `shares/${shareId}/`

  // List all keys under the prefix
  const list = await r2.send(
    new ListObjectsV2Command({ Bucket: BUCKET, Prefix: prefix })
  )

  if (!list.Contents?.length) return

  await r2.send(
    new DeleteObjectsCommand({
      Bucket: BUCKET,
      Delete: {
        Objects: list.Contents.map((o) => ({ Key: o.Key })),
        Quiet: true,
      },
    })
  )
}
