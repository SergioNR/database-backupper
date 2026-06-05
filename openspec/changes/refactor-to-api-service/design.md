## Context

The service currently runs as a standalone container that backs up a single database on fixed cron schedules. Multiple independent services now need to trigger backups of their own databases on demand. The architecture needs to shift from "cron-driven single-target" to "API-driven multi-target queue processor."

## Goals / Non-Goals

**Goals:**
- Accept backup requests via REST API with per-request database connection details
- Persist requests in a PostgreSQL database via Prisma ORM for durability and observability
- Process dumps and S3 uploads via separate cron-based processors for decoupling
- Provide Swagger/OpenAPI documentation for API consumers
- Each backup request tracks its full lifecycle: pending → dumping → dumped → uploading → uploaded (or failed at any stage)

**Non-Goals:**
- Authentication/authorization for the API (open for internal network use)
- Webhook/callback notifications when backups complete (can be added later)
- Restoring backups from S3 (manual process)
- Rate limiting or concurrency control (single processor for now)

## Decisions

### Decision 1: Prisma ORM for metadata database

Use Prisma with a separate PostgreSQL database (configured via `DATABASE_URL`) to store backup request records.

**Rationale**: Type-safe database access, schema migrations, and a clean data model. The metadata DB is separate from the databases being backed up — it belongs to the backup service itself.

**Schema**:
```prisma
model BackupRequest {
  id          String   @id @default(cuid())
  host        String
  port        Int
  user        String
  password    String
  database    String
  status      String   @default("pending")  // pending, dumping, dumped, uploading, uploaded, failed
  dumpPath    String?
  s3Key       String?
  error       String?
  createdAt   DateTime @default(now())
  startedAt   DateTime?
  completedAt DateTime?
}
```

### Decision 2: Two separate processors (dump + upload)

**Dump processor** (every 10s): Finds the oldest `pending` request, sets status to `dumping`, runs `pg_dump`, on success sets status to `dumped` and records `dumpPath`. On failure sets status to `failed` and records `error`.

**Upload processor** (every 30s): Finds the oldest `dumped` request, sets status to `uploading`, uploads to S3, on success sets status to `uploaded` and records `s3Key`. On failure sets status to `failed` and records `error`.

**Rationale**: Decoupling dump and upload means a database backup succeeds even if S3 is temporarily down. The upload processor will retry `failed` upload jobs on the next cycle.

**Alternative considered**: Single processor that does dump+upload sequentially. Rejected because it couples the two operations and makes retry logic harder.

### Decision 3: Sequential processing (one at a time)

Each processor handles one request per cycle. No concurrent dumps or uploads.

**Rationale**: Simple, predictable resource usage. Can be extended to parallel processing later.

### Decision 4: Swagger/OpenAPI via swagger-jsdoc + swagger-ui-express

JSDoc comments on route handlers generate the OpenAPI spec. Served at `/api-docs`.

**Rationale**: Spec lives next to the code, stays in sync, no separate YAML file to maintain.

### Decision 5: Express JSON body parsing

Add `app.use(express.json())` middleware for parsing POST request bodies.

### Decision 6: Remove preset cron schedules entirely

The `BACKUP_EVERY_*` env vars, `backupJobs.js`, and the old `cronJobScheduler.js` are all deleted. Replaced by the two fixed internal processors.

### Decision 7: Password stored in database

Backup request records include the database password in plain text.

**Rationale**: Needed to run `pg_dump` during processing. Acceptable for an internal service. Mitigation: metadata DB should be on an internal network, and access should be restricted.

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/backups` | Create a backup request |
| `GET` | `/backups` | List all backup requests |
| `GET` | `/backups/:id` | Get a specific backup request |
| `GET` | `/health` | Health check (kept from before) |
| `GET` | `/api-docs` | Swagger UI |

### POST /backups Request Body
```json
{
  "host": "db.example.com",
  "port": 5432,
  "user": "postgres",
  "password": "secret",
  "database": "myapp_production"
}
```

### POST /backups Response (201)
```json
{
  "id": "clx...",
  "status": "pending",
  "host": "db.example.com",
  "port": 5432,
  "user": "postgres",
  "database": "myapp_production",
  "createdAt": "2026-06-01T06:00:00.000Z"
}
```

### GET /backups Response (200)
```json
[
  {
    "id": "clx...",
    "status": "uploaded",
    "host": "db.example.com",
    "port": 5432,
    "user": "postgres",
    "database": "myapp_production",
    "dumpPath": "/tmp/backup_2026-06-01T06-00-05-000Z.sql",
    "s3Key": "backups/backup_2026-06-01T06-00-05-000Z.sql",
    "createdAt": "2026-06-01T06:00:00.000Z",
    "startedAt": "2026-06-01T06:00:10.000Z",
    "completedAt": "2026-06-01T06:00:15.000Z"
  }
]
```

## Risks / Trade-offs

- **Passwords stored in plain text in the metadata DB** → Acceptable for internal service. Can add encryption later.
- **Sequential processing limits throughput** → One backup at a time. Acceptable for now; can add parallel processing later.
- **No authentication on the API** → Internal service only. Can add API key auth later.
- **Processor polling interval** → 10s for dump, 30s for upload. Configurable via env vars if needed.
- **Breaking change for existing users** → Complete architecture change. Users must switch to API model.
