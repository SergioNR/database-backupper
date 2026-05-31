# Database Backupper

Automated PostgreSQL database backups with preset scheduling and optional S3 upload.

## Quick Start

1. Copy the example compose file:

```bash
cp compose-example.yaml docker-compose.yaml
```

2. Edit the environment variables in `docker-compose.yaml`:

```yaml
environment:
  PORT: 12500
  DB_HOST: your_database_host
  DB_PORT: 5432
  DB_USER: your_username
  DB_PASSWORD: your_password
  DATABASE: your_database_name
  BACKUP_EVERY_24H: "true"
  MAX_BACKUPS: 10
  # Optional S3 upload:
  # S3_BUCKET: my-backups
  # S3_ACCESS_KEY: your_access_key
  # S3_SECRET_KEY: your_secret_key
```

3. Run:

```bash
docker compose up -d
```

Backups are stored in `/tmp` inside the container. Mount a volume to persist them:

```yaml
volumes:
  - ./backups:/tmp
```

## Environment Variables

### Database & Server

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `PORT` | Yes | Express server port | — |
| `DB_HOST` | Yes | PostgreSQL hostname | — |
| `DB_PORT` | Yes | PostgreSQL port | — |
| `DB_USER` | Yes | PostgreSQL username | — |
| `DB_PASSWORD` | Yes | PostgreSQL password | — |
| `DATABASE` | Yes | Database name | — |

### Schedules

Set any combination to `"true"` to enable:

| Variable | Schedule |
|----------|----------|
| `BACKUP_EVERY_2H` | Every 2 hours |
| `BACKUP_EVERY_8H` | Every 8 hours |
| `BACKUP_EVERY_24H` | Daily at 2:00 AM |
| `BACKUP_WEEKLY` | Weekly on Sunday at 2:00 AM |

### Retention & S3

| Variable | Description | Default |
|----------|-------------|---------|
| `MAX_BACKUPS` | Max local backups to keep (oldest deleted first) | Unlimited |
| `S3_BUCKET` | S3 bucket name. Uploads are skipped if not set | — |
| `S3_ACCESS_KEY` | Required if `S3_BUCKET` is set | — |
| `S3_SECRET_KEY` | Required if `S3_BUCKET` is set | — |
| `S3_REGION` | AWS region | `us-east-1` |
| `S3_ENDPOINT` | Custom endpoint for MinIO, Spaces, etc. | AWS |
| `S3_PATH_PREFIX` | Folder prefix in the bucket | None |
| `S3_RETRY_INTERVAL` | Seconds between upload retries | `300` |

## Docker Image

Pre-built images on [Docker Hub](https://hub.docker.com/repository/docker/sergion14/database-backup/general) for AMD64 and ARM64:

```bash
docker pull sergion14/database-backup:latest
```

## License

ISC License — [Sergio Navarro](https://github.com/SergioNR)
