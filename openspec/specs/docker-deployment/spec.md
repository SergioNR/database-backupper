# Docker Deployment Specification

## Purpose
Define how the application is containerized, built, and deployed.

## Requirements

### Requirement: Multi-platform Docker image
The system provides Docker images for AMD64 and ARM64 via GitHub Actions.

#### Scenario: CI build and push
- GIVEN code is pushed to the "latest" or "next" branch
- WHEN the GitHub Actions workflow runs
- THEN the image is built for `linux/amd64` and `linux/arm64` using Docker Buildx and QEMU
- AND the image is pushed to Docker Hub as `sergion14/database-backup:<branch_name>`

### Requirement: Docker image contents
The Dockerfile produces an Alpine-based Node.js image with PostgreSQL client tools.

#### Scenario: Image build
- GIVEN the Dockerfile is used
- WHEN the image is built
- THEN it is based on `node:<version>-alpine` (currently Node 26)
- AND `postgresql-client` is installed via `apk`
- AND production dependencies are installed via `npm ci --omit-dev`
- AND the `src/` directory is copied into `/usr/src/app/src/`

### Requirement: Container runtime
The container runs the application with default settings.

#### Scenario: Container starts
- GIVEN the image is built
- WHEN the container starts
- THEN the command `npm run start:deploy` executes (which runs `node src/index.mjs`)
- AND the process runs as root (USER node is commented out)
- AND port 12500 is exposed

### Requirement: Volume mount for backup persistence
The compose configuration mounts a host volume to persist backup files.

#### Scenario: Backups persisted to host
- GIVEN compose.yaml is used with volume `./backups:/tmp`
- WHEN a backup is created inside the container at `/tmp/`
- THEN the backup file is accessible on the host at `./backups/`
- AND files survive container restarts

### Requirement: Environment variable configuration
All runtime behavior is configured via environment variables.

#### Scenario: Configuration via compose environment block
- GIVEN compose.yaml defines environment variables (PORT, DB_PORT, DATABASE, DB_HOST, DB_USER, DB_PASSWORD, BACKUP_FREQUENCY)
- WHEN the container starts
- THEN those variables are available to the Node.js process
- AND no code changes are required for different deployments

### Requirement: Example configuration
An example compose file and env file are provided for reference.

#### Scenario: User sets up from example
- GIVEN the user copies `compose-example.yaml` to `compose.yaml`
- AND fills in the environment variables
- WHEN `docker-compose up` is run
- THEN the container starts with the user's configuration

## Known Issues
- `compose.yaml` is in `.gitignore` (prevents accidental commits of credentials) but `compose-example.yaml` has an empty DB_PASSWORD
- The Dockerfile comment references Node 22.14.0 but `ARG NODE_VERSION=26`
- `.dockerignore` excludes `README.MD` (uppercase) but the actual file is `README.md` (lowercase) — the file may still get copied
