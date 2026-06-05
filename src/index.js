import express from 'express'
import swaggerUi from 'swagger-ui-express'
import swaggerJSDoc from 'swagger-jsdoc'
import { prisma } from './db.js'
import backupRoutes from './routes/backups.js'
import { startDumpProcessor } from './processors/dumpProcessor.js'
import { startUploadProcessor } from './processors/uploadProcessor.js'

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required')
  process.exit(1)
}

const app = express()
app.use(express.json())

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: { title: 'Database Backupper API', version: '1.0.0' },
  },
  apis: ['./src/routes/*.js'],
})

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use(backupRoutes)

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    return res.json({ status: 'ok', database: 'connected' })
  } catch (error) {
    return res.status(503).json({ status: 'degraded', database: 'disconnected', error: error.message })
  }
})

async function start() {
  await prisma.$connect()
  console.log('Connected to metadata database')

  const interval = (parseInt(process.env.PROCESSOR_INTERVAL, 10) || 900) * 1000

  startDumpProcessor(interval)
  startUploadProcessor(interval)

  app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`)
  })
}

start().catch((error) => {
  console.error(`Failed to start: ${error.message}`)
  process.exit(1)
})
