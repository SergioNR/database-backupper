# Database Backupper

API-driven PostgreSQL backup service. Accepts backup requests via REST API, creates dumps using `pg_dump`, and optionally uploads to S3-compatible storage. Backup requests are persisted in a PostgreSQL database and processed asynchronously by internal processors.

## Quick Start

1. Copy the example compose file:

```bash
cp compose-example.yaml docker-compose.yaml
```

2. Edit the environment variables in `docker-compose.yaml`:

```yaml
environment:
  PORT: 12500
  DATABASE_URL: postgresql://user:password@metadata-db:5432/backupper_metadata
  # Optional S3 upload:
  # S3_BUCKET: my-backups
  # S3_ACCESS_KEY: your_access_key
  # S3_SECRET_KEY: your_secret_key
```

3. Run:

```bash
docker compose up -d
```

The compose file includes a `metadata-db` PostgreSQL service for storing backup request records. The service applies Prisma migrations automatically on startup.

## How It Works

1. A client sends a `POST /backups` request with database connection details
2. The request is stored with status `pending`
3. The **dump processor** (every 15 min) picks up pending requests, runs `pg_dump`, sets status to `dumped`
4. The **upload processor** (every 15 min) picks up dumped requests, uploads to S3, sets status to `uploaded`

```
Status lifecycle: pending → dumping → dumped → uploading → uploaded
                                                        ↘ failed (at any stage)
```

## API Endpoints

Interactive docs available at `/api-docs` once the server is running.

### Create a backup request

```
POST /backups
Content-Type: application/json

{
  "host": "db.example.com",
  "port": 5432,
  "user": "postgres",
  "password": "secret",
  "database": "myapp_production"
}
```

Response `201 Created` (password excluded):

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

### List all backup requests

```
GET /backups
```

Returns an array of all backup requests (newest first), passwords excluded.

### Get a specific backup request

```
GET /backups/<id>
```

Returns the request details or `404` if not found. Passwords are excluded from responses.

### Health check

```
GET /health
```

Returns database connectivity status.

### API documentation

```
GET /api-docs
```

Serves Swagger UI with the full OpenAPI specification.

## Environment Variables

### Required

| Variable | Description |
|----------|-------------|
| `PORT` | Express server port (default: `12500`) |
| `DATABASE_URL` | PostgreSQL connection string for the metadata database |

### Processor

| Variable | Description | Default |
|----------|-------------|---------|
| `PROCESSOR_INTERVAL` | Polling interval in seconds for both dump and upload processors | `900` (15 min) |

### S3 (optional)

All S3 variables are optional. If `S3_BUCKET` is not set, backups exist only in local `/tmp` storage and are marked as `uploaded` (skipped).

| Variable | Description | Default |
|----------|-------------|---------|
| `S3_BUCKET` | S3 bucket name | — |
| `S3_ACCESS_KEY` | Required if `S3_BUCKET` is set | — |
| `S3_SECRET_KEY` | Required if `S3_BUCKET` is set | — |
| `S3_REGION` | AWS region | `us-east-1` |
| `S3_ENDPOINT` | Custom endpoint for MinIO, DigitalOcean Spaces, etc. | AWS |
| `S3_PATH_PREFIX` | Folder prefix in the bucket | — |

## Docker Image

Pre-built images on [Docker Hub](https://hub.docker.com/repository/docker/sergion14/database-backup/general) for AMD64 and ARM64:

```bash
docker pull sergion14/database-backup:latest
```

## Local Development

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run start:local
```

Run tests:

```bash
npm test
```

## Architecture

- **Express 5** — HTTP server with JSON body parsing
- **Prisma ORM** — metadata database for backup request tracking
- **`pg_dump`** — PostgreSQL client tool for creating dumps
- **`@aws-sdk/client-s3`** — S3-compatible uploads (AWS, MinIO, DO Spaces, etc.)
- **Swagger UI** — auto-generated API docs from JSDoc annotations
- **Internal processors** — poll-based queue consumers (not cron-based)

## License

ISC License — [Sergio Navarro](https://github.com/SergioNR)
