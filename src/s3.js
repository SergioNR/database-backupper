import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import fs from 'node:fs'
import path from 'node:path'

let s3Client = null

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

function getObjectKey(filePath, s3KeyPrefix) {
  const filename = path.basename(filePath)
  return s3KeyPrefix ? `${s3KeyPrefix}/${filename}` : filename
}

export async function uploadToS3(filePath, s3KeyPrefix) {
  const client = getS3Client()
  const fileContent = fs.readFileSync(filePath)
  const key = getObjectKey(filePath, s3KeyPrefix)

  await client.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: fileContent,
  }))

  console.log(`S3 upload successful: ${key}`)
  return key
}
