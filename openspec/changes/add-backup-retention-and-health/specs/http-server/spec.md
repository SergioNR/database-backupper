# Delta for http-server

## ADDED Requirements

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
