# HTTP Server Specification

## Purpose
Provide a lightweight HTTP server for health checks and container orchestration.

## Requirements

### Requirement: Express server startup
The system starts an Express server on the configured PORT.

#### Scenario: Server starts on configured port
- GIVEN PORT is set (e.g. 12500)
- WHEN `index.mjs` runs
- THEN an Express app is created
- AND it listens on the value of `process.env.PORT`
- AND a startup message "Server running on port <PORT>" is logged

### Requirement: Health check endpoint
The system SHALL expose a GET /health endpoint for container orchestration probes.

#### Scenario: Healthy service
- GIVEN the server is running and at least one backup has succeeded
- WHEN a GET /health request is received
- THEN a 200 status is returned with JSON body
- AND the body includes { status: "ok", lastBackup: "<ISO timestamp>", backupCount: <number> }

#### Scenario: No backups yet
- GIVEN the server is running but no backup has completed
- WHEN a GET /health request is received
- THEN a 200 status is returned
- AND the body includes { status: "starting", lastBackup: null, backupCount: 0 }

#### Scenario: Last backup failed
- GIVEN the server is running and the last backup failed
- WHEN a GET /health request is received
- THEN a 503 status is returned
- AND the body includes { status: "degraded", lastBackup: "<ISO timestamp>", lastError: "<message>" }

### Requirement: Docker HEALTHCHECK
The Dockerfile includes a HEALTHCHECK instruction that probes the /health endpoint.

#### Scenario: Container health monitored
- GIVEN the container is running
- WHEN Docker performs a health check (every 30s)
- THEN a wget request is made to http://localhost:12500/health
- AND the container is marked unhealthy if the request fails

### Requirement: Server does not block startup
The server starts asynchronously and does not gate the initial backup.

#### Scenario: Server and backup ordering
- GIVEN the application starts
- WHEN `index.mjs` executes
- THEN `createDatabaseDump()` is called first
- AND `startCronJobs()` is called
- AND `app.listen()` is called after (non-blocking)
