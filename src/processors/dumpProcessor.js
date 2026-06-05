import { prisma } from '../db.js'
import { createDatabaseDump } from '../backup.js'

export function startDumpProcessor(intervalMs = 900_000) {
  console.log(`Dump processor started (interval: ${intervalMs}ms)`)

  return setInterval(async () => {
    try {
      const request = await prisma.backupRequest.findFirst({
        where: { status: 'pending' },
        orderBy: { createdAt: 'asc' },
      })

      if (!request) return

      await prisma.backupRequest.update({
        where: { id: request.id },
        data: { status: 'dumping', startedAt: new Date() },
      })

      const dumpPath = createDatabaseDump({
        host: request.host,
        port: request.port,
        user: request.user,
        password: request.password,
        database: request.database,
        requestId: request.id,
      })

      await prisma.backupRequest.update({
        where: { id: request.id },
        data: { status: 'dumped', dumpPath },
      })

      console.log(`Dump complete for request ${request.id}`)
    } catch (error) {
      console.error(`Dump processor error: ${error.message}`)

      const failed = await prisma.backupRequest.findFirst({
        where: { status: 'dumping' },
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
