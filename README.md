# Database Backupper

A Dockerized application for automated PostgreSQL database backups with configurable scheduling.

## Overview

This application provides an automated solution for backing up PostgreSQL databases on a scheduled basis. It uses `pg_dump` to create compressed database dumps and stores them in a specified location. The backup frequency can be configured using cron expressions.

## Features

- Automated PostgreSQL database backups
- Configurable backup schedule using cron expressions
- Dockerized for easy deployment
- Environment variable configuration
- Multi-platform Docker images (AMD64 and ARM64)

## Prerequisites

- Docker (recommended)
- PostgreSQL database to backup
- Access credentials for the PostgreSQL database

## Environment Variables

The following environment variables must be set for the application to work:

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Port for the internal Express server | `12500` |
| `DB_PORT` | PostgreSQL database port | `5432` |
| `DATABASE` | Name of the database to backup | `myapp_production` |
| `DB_HOST` | Hostname of the PostgreSQL server | `localhost` or `db` |
| `DB_USER` | PostgreSQL username | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | `securepassword123` |
| `BACKUP_FREQUENCY` | Cron expression for backup schedule | `0 2 * * *` (daily at 2 AM) |

## Backup Frequency (Cron Syntax)

The `BACKUP_FREQUENCY` environment variable accepts standard cron expressions:

```
* * * * * *
│ │ │ │ │ │
│ │ │ │ │ └── Day of Week (0 - 7) (0 or 7 is Sun)
│ │ │ │ └──── Month (1 - 12)
│ │ │ └────── Day of Month (1 - 31)
│ │ └──────── Hour (0 - 23)
│ └────────── Minute (0 - 59)
└──────────── Second (0 - 59, optional)
```

### Common Examples

- `* * * * *` - Every minute
- `*/5 * * * *` - Every 5 minutes
- `0 * * * *` - Every hour (at minute 0)
- `0 2 * * *` - Daily at 2:00 AM
- `0 2 * * 0` - Weekly at 2:00 AM on Sundays
- `0 2 1 * *` - Monthly at 2:00 AM on the 1st

## Output Location

The container will store database backups in the `/tmp` directory inside the container. To persist these backups, you should mount a volume to this directory:

```yaml
volumes:
  - ./backups:/tmp
```

Backup files are named with timestamps in the format: `backup_YYYY-MM-DDTHH-MM-SS.sssZ.sql`

## Quick Start with Docker

1. Create a `docker-compose.yaml` file based on the provided example:

```bash
cp compose-example.yaml docker-compose.yaml
```

2. Modify the environment variables in `docker-compose.yaml` to match your database configuration:

```yaml
environment:
  PORT: 12500
  DB_PORT: 5432
  DATABASE: your_database_name
  DB_HOST: your_database_host
  DB_USER: your_username
  DB_PASSWORD: your_password
  BACKUP_FREQUENCY: "0 2 * * *"  # Daily at 2 AM
```

3. Run the container:

```bash
docker-compose up -d
```


## How It Works

1. The application starts an Express server (primarily for health checks)
2. Immediately creates an initial database backup on startup
3. Schedules recurring backups based on the `BACKUP_FREQUENCY` cron expression
4. Uses `pg_dump` to create compressed database dumps
5. Stores backups in the `/tmp` directory with timestamped filenames

## Docker Image

Pre-built Docker images are [available on Docker Hub](https://hub.docker.com/repository/docker/sergion14/database-backup/general):

```bash
docker pull sergion14/database-backup:latest
```

Images are built for both AMD64 and ARM64 architectures.

## GitHub Actions

The project includes a GitHub Actions workflow that automatically builds and pushes Docker images to Docker Hub when changes are pushed to the `latest` or `next` branches.

## Project Structure

```
├── src/
│   ├── index.mjs                     # Main application entry point
│   ├── backup.js                     # Database backup functionality
│   └── cron/
│       ├── cronJobScheduler.js       # Cron job scheduler
│       └── jobs/
│           └── createDatabaseDumpJob.js  # Database dump cron job
├── openspec/
│   ├── config.yaml                   # Project context for AI agents
│   ├── specs/                        # Behavioral specifications
│   └── changes/                      # Proposed modifications
├── Dockerfile                        # Docker image definition
├── compose-example.yaml              # Example Docker Compose configuration
├── .env.example                      # Example environment variables
└── package.json                      # Node.js dependencies and scripts
```

## Security Considerations

- The application runs with minimal privileges
- Database passwords are passed via environment variables
- Consider using Docker secrets in production environments for sensitive data
- Ensure the backup storage location is secure and access-controlled

## Troubleshooting

- Check container logs: `docker logs <container_name>`
- Verify environment variables are correctly set
- Ensure the database is accessible from the container
- Confirm the database user has sufficient permissions for pg_dump

## License

ISC License

## Author

[Sergio Navarro](https://github.com/SergioNR)