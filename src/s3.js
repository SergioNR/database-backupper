import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import fs from 'node:fs'
import path from 'node:path'

let s3Client = null
const retryQueue = new Set()
let retryTimer = null

export const s3State = {
  lastUpload: null,
  lastError: null,
  status: null
}

export function isS3Configured() {
  if (!process.env.S3_BUCKET) return false

  if (!process.env.S3_ACCESS_KEY || !process.env.S3_SECRET_KEY) {
    console.warn('S3_BUCKET is set but S3_ACCESS_KEY or S3_SECRET_KEY is missing — S3 uploads disabled')
    return false
  }

  return true
}

function getS3Client() {
  if (s3Client) return s3Client

  const config = {
    region: process.env.S3_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_KEY,
    },
  }

  if (process.env.S3_ENDPOINT) {
    config.endpoint = process.env.S3_ENDPOINT
    config.forcePathStyle = true
  }

  s3Client = new S3Client(config)
  return s3Client
}

function getObjectKey(filePath) {
  const filename = path.basename(filePath)
  const prefix = process.env.S3_PATH_PREFIX
  return prefix ? `${prefix}/${filename}` : filename
}

export async function uploadToS3(filePath) {
  if (!isS3Configured()) return { uploaded: false, reason: 'not_configured' }

  try {
    const client = getS3Client()
    const fileContent = fs.readFileSync(filePath)
    const key = getObjectKey(filePath)

    await client.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: fileContent,
    }))

    s3State.lastUpload = new Date().toISOString()
    s3State.lastError = null
    s3State.status = 'ok'

    retryQueue.delete(filePath)

    console.log(`S3 upload successful: ${key}`)
    return { uploaded: true }
  } catch (error) {
    s3State.lastError = error.message
    s3State.status = 'error'

    retryQueue.add(filePath)
    ensureRetryTimer()

    console.error(`S3 upload failed for ${path.basename(filePath)}: ${error.message}`)
    return { uploaded: false, reason: error.message }
  }
}

function ensureRetryTimer() {
  if (retryTimer) return

  const interval = parseInt(process.env.S3_RETRY_INTERVAL, 10) || 300

  retryTimer = setInterval(async () => {
    if (retryQueue.size === 0) {
      clearInterval(retryTimer)
      retryTimer = null
      return
    }

    console.log(`S3 retry: attempting ${retryQueue.size} queued file(s)`)

    for (const filePath of [...retryQueue]) {
      if (!fs.existsSync(filePath)) {
        retryQueue.delete(filePath)
        continue
      }

      try {
        const client = getS3Client()
        const fileContent = fs.readFileSync(filePath)
        const key = getObjectKey(filePath)

        await client.send(new PutObjectCommand({
          Bucket: process.env.S3_BUCKET,
          Key: key,
          Body: fileContent,
        }))

        retryQueue.delete(filePath)
        s3State.lastUpload = new Date().toISOString()
        s3State.status = 'ok'
        s3State.lastError = null

        console.log(`S3 retry successful: ${key}`)
      } catch (error) {
        console.error(`S3 retry failed for ${path.basename(filePath)}: ${error.message}`)
      }
    }
  }, interval * 1000)
}

export function startRetryTimer() {
  if (!isS3Configured()) return
  if (retryQueue.size > 0) ensureRetryTimer()
}

export function getRetryQueueSize() {
  return retryQueue.size
}
