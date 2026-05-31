# HTTP Server Specification

## Purpose
Provide a lightweight HTTP server for health checks and container orchestration.

## Requirements

### Requirement: Express server startup
The system starts an Express server on the configured PORT.

#### Scenario: Server starts on configured port
- GIVEN PORT is set (e.g. 12500)
- WHEN `index.js` runs
- THEN an Express app is created
- AND it listens on the value of `process.env.PORT`
- AND a startup message "Server running on port <PORT>" is logged

### Requirement: Health check endpoint
The system SHALL expose a GET /health endpoint that reports backup state and S3 upload status.

#### Scenario: Healthy service
- GIVEN the server is running and at least one backup has succeeded
- WHEN a GET /health request is received
- THEN a 200 status is returned with JSON body including { status: "ok", lastBackup, backupCount }

#### Scenario: No backups yet
- GIVEN the server is running but no backup has completed
- WHEN a GET /health request is received
- THEN a 200 status is returned
- AND the body includes { status: "starting", lastBackup: null, backupCount: 0 }

#### Scenario: Last backup failed
- GIVEN the server is running and the last backup failed
- WHEN a GET /health request is received
- THEN a 503 status is returned
- AND the body includes { status: "degraded", lastBackup, lastError }

#### Scenario: S3 configured and last upload succeeded
- GIVEN `S3_BUCKET` is set and the last upload succeeded
- WHEN a GET /health request is received
- THEN the response includes `s3Status: "ok"`, `s3LastUpload`, and `s3RetryQueue: 0`

#### Scenario: S3 configured but last upload failed
- GIVEN `S3_BUCKET` is set and the last upload failed
- WHEN a GET /health request is received
- THEN the response includes `s3Status: "error"` and `s3Error`

#### Scenario: S3 not configured
- GIVEN `S3_BUCKET` is not set
- WHEN a GET /health request is received
- THEN the response does not include S3-related fields

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
- WHEN `index.js` executes
- THEN `createDatabaseDump()` is called first
- AND `startCronJobs()` is called
- AND `startRetryTimer()` is called
- AND `app.listen()` is called after (non-blocking)
