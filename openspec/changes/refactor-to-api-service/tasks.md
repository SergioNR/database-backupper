## 1. Prisma Setup

- [x] 1.1 Install `@prisma/client` and `prisma` dependencies
- [x] 1.2 Initialize Prisma with `npx prisma init`
- [x] 1.3 Define `BackupRequest` model in `prisma/schema.prisma`
- [x] 1.4 Run initial migration
- [x] 1.5 Create `src/db.js` with shared PrismaClient instance

## 2. Rewrite backup.js — Per-request Dumps

- [x] 2.1 Refactor `createDatabaseDump` to accept `{ host, port, user, password, database }` as parameters instead of reading env vars
- [x] 2.2 Include request ID in filename for uniqueness: `backup_<requestId>_<timestamp>.sql`
- [x] 2.3 Return `outputPath` on success instead of using in-memory state
- [x] 2.4 Remove `backupState` object and `rotateBackups` function
- [x] 2.5 Remove `isS3Configured` import and inline S3 upload call

## 3. Rewrite s3.js — Per-request Uploads

- [x] 3.1 Refactor `uploadToS3` to accept `filePath` and `s3KeyPrefix` parameters (no env-var coupling)
- [x] 3.2 Remove in-memory `retryQueue`, `s3State`, `startRetryTimer`, `getRetryQueueSize`
- [x] 3.3 Keep S3 client initialization and `forcePathStyle` logic
- [x] 3.4 Remove `isS3Configured` — processor handles the skip logic

## 4. Backup API Routes

- [x] 4.1 Install `swagger-ui-express` and `swagger-jsdoc` dependencies
- [x] 4.2 Create `src/routes/backups.js` with POST /backups (validate required fields, create record, return 201 without password)
- [x] 4.3 Add GET /backups route (list all records)
- [x] 4.4 Add GET /backups/:id route (single record, 404 if not found)
- [x] 4.5 Add JSDoc OpenAPI annotations to all three routes

## 5. Processors

- [x] 5.1 Create `src/processors/dumpProcessor.js` — queries oldest `pending` request, runs dump, updates record
- [x] 5.2 Create `src/processors/uploadProcessor.js` — queries oldest `dumped` request, uploads to S3, updates record
- [x] 5.3 Dump processor uses `setInterval` at 10s, processes one request per cycle
- [x] 5.4 Upload processor uses `setInterval` at 30s, processes one request per cycle
- [x] 5.5 Both processors handle errors by setting status to `failed` and recording error message

## 6. Rewrite index.js

- [x] 6.1 Add `express.json()` middleware
- [x] 6.2 Initialize PrismaClient and verify database connection on startup
- [x] 6.3 Mount backup API routes at `/backups`
- [x] 6.4 Mount Swagger UI at `/api-docs`
- [x] 6.5 Keep `/health` endpoint (simplified — checks DB connection + processor status)
- [x] 6.6 Remove startup backup call, old `startCronJobs()`, and `startRetryTimer()`
- [x] 6.7 Start both processors on startup

## 7. Clean Up Old Code

- [x] 7.1 Delete `src/cron/jobs/backupJobs.js`
- [x] 7.2 Delete `src/cron/cronJobScheduler.js`
- [x] 7.3 Remove preset env vars from `.env.example` (BACKUP_EVERY_*)
- [x] 7.4 Remove preset env vars from `compose-example.yaml`
- [x] 7.5 Add `DATABASE_URL` to `.env.example` and `compose-example.yaml`

## 8. Update Dockerfile

- [x] 8.1 Add `RUN npx prisma generate` after npm ci
- [x] 8.2 Copy `prisma/` directory into the image
- [x] 8.3 Add `CMD` that runs `npx prisma migrate deploy && npm run start:deploy`

## 9. Update Baseline Specs

- [x] 9.1 Create `openspec/specs/backup-api/spec.md` from delta
- [x] 9.2 Create `openspec/specs/backup-queue/spec.md` from delta
- [x] 9.3 Create `openspec/specs/api-docs/spec.md` from delta
- [x] 9.4 Update `openspec/specs/backup-execution/spec.md` to reflect per-request model
- [x] 9.5 Update `openspec/specs/s3-upload/spec.md` to reflect processor-driven model
- [x] 9.6 Update `openspec/specs/http-server/spec.md` to reflect new server setup
- [x] 9.7 Replace `openspec/specs/scheduling/spec.md` with processor-based scheduling
- [x] 9.8 Remove `openspec/specs/preset-schedules/spec.md`
- [x] 9.9 Update `openspec/config.yaml` to reflect new architecture

## 10. Testing

- [x] 10.1 Test POST /backups creates a pending request and returns 201 without password
- [x] 10.2 Test POST /backups returns 400 for missing fields
- [x] 10.3 Test GET /backups returns list of requests
- [x] 10.4 Test GET /backups/:id returns request or 404
- [x] 10.5 Test dump processor picks up pending request and updates status
- [x] 10.6 Test upload processor picks up dumped request and updates status
- [x] 10.7 Test processor handles failures and sets status to failed
- [x] 10.8 Test /api-docs returns Swagger UI page
- [x] 10.9 Test /health returns service status
