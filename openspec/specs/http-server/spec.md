# HTTP Server Specification

## Purpose
Provide a lightweight HTTP server for container orchestration awareness.

## Requirements

### Requirement: Express server startup
The system starts an Express server on the configured PORT.

#### Scenario: Server starts on configured port
- GIVEN PORT is set (e.g. 12500)
- WHEN `index.mjs` runs
- THEN an Express app is created
- AND it listens on the value of `process.env.PORT`
- AND a startup message "Server running on port <PORT>" is logged

### Requirement: No routes defined
The Express server has no routes or middleware configured.

#### Scenario: Request to any path
- GIVEN the server is running
- WHEN any HTTP request is made to any path
- THEN Express returns its default response (404 for unrecognized methods/paths)

### Requirement: Server does not block startup
The server starts asynchronously and does not gate the initial backup.

#### Scenario: Server and backup ordering
- GIVEN the application starts
- WHEN `index.mjs` executes
- THEN `createDatabaseDump()` is called first (fire-and-forget)
- AND `app.listen()` is called after (non-blocking)
- AND both run concurrently — the server does not wait for the backup, and vice versa

## Known Issues
- No health check endpoint exists — containers have no way to probe service health
- The server serves no functional purpose beyond keeping the process alive
