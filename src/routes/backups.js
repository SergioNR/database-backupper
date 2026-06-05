import { Router } from 'express'
import { prisma } from '../db.js'

const router = Router()

function sanitize(record) {
  const { password, ...rest } = record
  return rest
}

/**
 * @openapi
 * /backups:
 *   post:
 *     summary: Create a backup request
 *     tags: [Backups]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [host, port, user, password, database]
 *             properties:
 *               host:
 *                 type: string
 *               port:
 *                 type: integer
 *               user:
 *                 type: string
 *               password:
 *                 type: string
 *               database:
 *                 type: string
 *     responses:
 *       201:
 *         description: Backup request created
 *       400:
 *         description: Validation error
 */
router.post('/backups', async (req, res) => {
  const { host, port, user, password, database } = req.body

  if (!host || !port || !user || !password || !database) {
    return res.status(400).json({
      error: 'Missing required fields: host, port, user, password, database',
    })
  }

  const record = await prisma.backupRequest.create({
    data: { host, port: Number(port), user, password, database },
  })

  return res.status(201).json(sanitize(record))
})

/**
 * @openapi
 * /backups:
 *   get:
 *     summary: List all backup requests
 *     tags: [Backups]
 *     responses:
 *       200:
 *         description: List of backup requests
 */
router.get('/backups', async (req, res) => {
  const records = await prisma.backupRequest.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return res.json(records.map(sanitize))
})

/**
 * @openapi
 * /backups/{id}:
 *   get:
 *     summary: Get a specific backup request
 *     tags: [Backups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Backup request details
 *       404:
 *         description: Not found
 */
router.get('/backups/:id', async (req, res) => {
  const record = await prisma.backupRequest.findUnique({
    where: { id: req.params.id },
  })

  if (!record) {
    return res.status(404).json({ error: 'Not found' })
  }

  return res.json(sanitize(record))
})

export default router
