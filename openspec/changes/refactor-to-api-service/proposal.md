## Why

The service currently backs up a single pre-configured database on a fixed cron schedule. As infrastructure grows, multiple services need to trigger backups of their own databases on demand. The current architecture cannot handle multi-database backup requests or decouple dump creation from remote storage. A shift to an API-driven model with a persistent queue makes the service a shared backup utility for the entire infrastructure.

## What Changes

- **BREAKING**: Remove all preset cron schedule env vars (`BACKUP_EVERY_2H`, `BACKUP_EVERY_8H`, etc.) and the associated scheduler
- **BREAKING**: Remove the startup backup — the service no longer backs up anything on its own
- Add Prisma ORM connected to a separate PostgreSQL database (via `DATABASE_URL`) for storing backup request metadata
- Add `POST /backups` endpoint accepting `{ host, port, user, password, database }` — creates a backup request record with status `pending`
- Add `GET /backups` endpoint to list backup requests and their statuses
- Add `GET /backups/:id` endpoint to get a specific backup request status
- Replace preset cron jobs with two internal cron jobs:
  - **Dump processor**: polls for `pending` requests, runs `pg_dump`, updates status to `dumped`
  - **Upload processor**: polls for `dumped` requests, uploads to S3, updates status to `uploaded`
- Add Swagger/OpenAPI docs served at `/api-docs`
- Add `swagger-ui-express` and `swagger-jsdoc` dependencies
- Add `@prisma/client` and `prisma` dependencies

## Capabilities

### New Capabilities
- `backup-api`: REST API for creating, listing, and querying backup requests
- `backup-queue`: Database-backed queue with dump and upload processor cron jobs
- `api-docs`: Swagger/OpenAPI documentation

### Modified Capabilities
- `backup-execution`: Now triggered by queue processor instead of startup/schedule, accepts per-request connection details
- `s3-upload`: Now triggered by upload processor instead of inline after dump, reads file path from database record
- `http-server`: Adds JSON body parsing, swagger route, backup API routes; removes old health-only server
- `scheduling`: Replaced — preset schedules removed, two fixed internal processors added

### Removed Capabilities
- `preset-schedules`: No longer relevant — backups are triggered via API, not preset env vars

## Impact

- `package.json` — add `@prisma/client`, `prisma`, `swagger-ui-express`, `swagger-jsdoc`; remove `cron` preset env vars
- `prisma/schema.prisma` — new file defining BackupRequest model
- `src/index.js` — rewrite: add JSON middleware, API routes, swagger, start processors
- `src/backup.js` — rewrite: accept connection details as parameters, return output path
- `src/s3.js` — minor: accept file path + metadata as parameters
- `src/cron/` — replace preset jobs with dump-processor and upload-processor
- `.env.example`, `compose-example.yaml` — add `DATABASE_URL`, remove preset env vars
- `Dockerfile` — add prisma generate step
- **BREAKING**: Existing users must migrate to the API model — no more automatic backups on startup
