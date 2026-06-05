# HTTP Server Specification

## Purpose
Provide an Express HTTP server with JSON body parsing, backup API routes, Swagger docs, and a health check endpoint.

## Requirements

### Requirement: Express server startup
The server starts with JSON body parsing middleware and mounts API routes.

#### Scenario: Server starts with middleware
- GIVEN PORT and DATABASE_URL are set
- WHEN the application starts
- THEN Prisma client connects to the metadata database
- AND Express starts with `express.json()` middleware
- AND backup API routes are mounted
- AND Swagger UI is available at `/api-docs`
- AND the health endpoint is available at `/health`

### Requirement: Prisma client initialization
The system SHALL initialize PrismaClient on startup and ensure database connectivity.

#### Scenario: Successful database connection
- GIVEN DATABASE_URL is set to a valid PostgreSQL connection string
- WHEN the application starts
- THEN PrismaClient connects to the metadata database
- AND migrations are applied (in deployment)

#### Scenario: DATABASE_URL not set
- GIVEN DATABASE_URL is not configured
- WHEN the application starts
- THEN an error is logged and the application exits

### Requirement: Health check endpoint
The system SHALL expose a GET /health endpoint that reports database connectivity.

#### Scenario: Database connected
- GIVEN the server is running and the database is accessible
- WHEN a GET /health request is received
- THEN a 200 status is returned with JSON body `{ status: "ok", database: "connected" }`

#### Scenario: Database disconnected
- GIVEN the server is running but the database is unreachable
- WHEN a GET /health request is received
- THEN a 503 status is returned with `{ status: "degraded", database: "disconnected" }`

### Requirement: Docker HEALTHCHECK
The Dockerfile includes a HEALTHCHECK instruction that probes the /health endpoint.

#### Scenario: Container health monitored
- GIVEN the container is running
- WHEN Docker performs a health check (every 30s)
- THEN a wget request is made to http://localhost:12500/health
- AND the container is marked unhealthy if the request fails

### Requirement: Processors start automatically
The dump and upload processors start on application startup.

#### Scenario: Application starts processors
- GIVEN the application starts and connects to the metadata database
- WHEN initialization completes
- THEN both processors start polling at the interval defined by `PROCESSOR_INTERVAL` (default: 15 minutes)
