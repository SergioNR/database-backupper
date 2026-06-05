import { prisma } from '../db.js'
import { uploadToS3, isS3Configured } from '../s3.js'

export function startUploadProcessor(intervalMs = 900_000) {
  console.log(`Upload processor started (interval: ${intervalMs}ms)`)

  return setInterval(async () => {
    try {
      const request = await prisma.backupRequest.findFirst({
        where: { status: 'dumped' },
        orderBy: { createdAt: 'asc' },
      })

      if (!request) return

      if (!isS3Configured()) {
        await prisma.backupRequest.update({
          where: { id: request.id },
          data: { status: 'uploaded', completedAt: new Date() },
        })
        console.log(`S3 not configured, marking request ${request.id} as uploaded`)
        return
      }

      await prisma.backupRequest.update({
        where: { id: request.id },
        data: { status: 'uploading' },
      })

      const s3KeyPrefix = process.env.S3_PATH_PREFIX || undefined
      const s3Key = await uploadToS3(request.dumpPath, s3KeyPrefix)

      await prisma.backupRequest.update({
        where: { id: request.id },
        data: { status: 'uploaded', s3Key, completedAt: new Date() },
      })

      console.log(`Upload complete for request ${request.id}`)
    } catch (error) {
      console.error(`Upload processor error: ${error.message}`)

      const failed = await prisma.backupRequest.findFirst({
        where: { status: 'uploading' },
        orderBy: { createdAt: 'asc' },
      })

      if (failed) {
        await prisma.backupRequest.update({
          where: { id: failed.id },
          data: { status: 'failed', error: error.message },
        })
      }
    }
  }, intervalMs)
}
