import { describe, it, expect, vi, beforeEach } from 'vitest'
import express from 'express'
import request from 'supertest'

vi.mock('../src/db.js', () => ({
  prisma: {
    backupRequest: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    $queryRaw: vi.fn(),
    $connect: vi.fn(),
  },
}))

const { prisma } = await import('../src/db.js')

const sampleRecord = {
  id: 'clx123',
  host: 'db.example.com',
  port: 5432,
  user: 'postgres',
  password: 'secret',
  database: 'myapp',
  status: 'pending',
  dumpPath: null,
  s3Key: null,
  error: null,
  createdAt: new Date('2026-06-01T06:00:00.000Z'),
  startedAt: null,
  completedAt: null,
}

function createApp() {
  const app = express()
  app.use(express.json())
  return app
}

describe('POST /backups', () => {
  it('creates a pending request and returns 201 without password', async () => {
    prisma.backupRequest.create.mockResolvedValue(sampleRecord)
    const { default: router } = await import('../src/routes/backups.js')
    const app = createApp()
    app.use(router)

    const res = await request(app)
      .post('/backups')
      .send({ host: 'db.example.com', port: 5432, user: 'postgres', password: 'secret', database: 'myapp' })

    expect(res.status).toBe(201)
    expect(res.body.status).toBe('pending')
    expect(res.body.password).toBeUndefined()
    expect(res.body.host).toBe('db.example.com')
  })

  it('returns 400 for missing fields', async () => {
    const { default: router } = await import('../src/routes/backups.js')
    const app = createApp()
    app.use(router)

    const res = await request(app)
      .post('/backups')
      .send({ host: 'db.example.com' })

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/Missing required fields/)
  })
})

describe('GET /backups', () => {
  it('returns list of requests', async () => {
    prisma.backupRequest.findMany.mockResolvedValue([sampleRecord])
    const { default: router } = await import('../src/routes/backups.js')
    const app = createApp()
    app.use(router)

    const res = await request(app).get('/backups')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].password).toBeUndefined()
  })
})

describe('GET /backups/:id', () => {
  it('returns 404 for non-existent request', async () => {
    prisma.backupRequest.findUnique.mockResolvedValue(null)
    const { default: router } = await import('../src/routes/backups.js')
    const app = createApp()
    app.use(router)

    const res = await request(app).get('/backups/nonexistent')
    expect(res.status).toBe(404)
  })

  it('returns request when found', async () => {
    prisma.backupRequest.findUnique.mockResolvedValue(sampleRecord)
    const { default: router } = await import('../src/routes/backups.js')
    const app = createApp()
    app.use(router)

    const res = await request(app).get('/backups/clx123')
    expect(res.status).toBe(200)
    expect(res.body.id).toBe('clx123')
    expect(res.body.password).toBeUndefined()
  })
})

describe('Dump processor', () => {
  it('exports startDumpProcessor as a function', async () => {
    const { startDumpProcessor } = await import('../src/processors/dumpProcessor.js')
    expect(typeof startDumpProcessor).toBe('function')
  })
})

describe('Upload processor', () => {
  it('exports startUploadProcessor as a function', async () => {
    const { startUploadProcessor } = await import('../src/processors/uploadProcessor.js')
    expect(typeof startUploadProcessor).toBe('function')
  })
})

describe('Swagger UI', () => {
  it('serves /api-docs', async () => {
    const app = createApp()
    const swaggerUi = (await import('swagger-ui-express')).default
    const swaggerJSDoc = (await import('swagger-jsdoc')).default

    const spec = swaggerJSDoc({
      definition: { openapi: '3.0.0', info: { title: 'Test', version: '1.0.0' } },
      apis: ['./src/routes/*.js'],
    })

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec))

    const res = await request(app).get('/api-docs/')
    expect(res.status).toBe(200)
    expect(res.text).toContain('swagger')
  })
})

describe('Health endpoint', () => {
  it('returns ok when database is connected', async () => {
    prisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }])
    const app = createApp()

    app.get('/health', async (req, res) => {
      try {
        await prisma.$queryRaw`SELECT 1`
        res.json({ status: 'ok', database: 'connected' })
      } catch (error) {
        res.status(503).json({ status: 'degraded', database: 'disconnected', error: error.message })
      }
    })

    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.database).toBe('connected')
  })
})
