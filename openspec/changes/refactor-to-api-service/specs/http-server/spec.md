# Delta for http-server

## MODIFIED Requirements

### Requirement: Express server startup
The server starts with JSON body parsing middleware and mounts API routes.

#### Scenario: Server starts with middleware
- **GIVEN** PORT and DATABASE_URL are set
- **WHEN** the application starts
- **THEN** Prisma client connects to the metadata database
- **AND** Express starts with `express.json()` middleware
- **AND** backup API routes are mounted
- **AND** Swagger UI is available at `/api-docs`
- **AND** the health endpoint is available at `/health`

## ADDED Requirements

### Requirement: Prisma client initialization
The system SHALL initialize PrismaClient on startup and ensure database connectivity.

#### Scenario: Successful database connection
- **GIVEN** DATABASE_URL is set to a valid PostgreSQL connection string
- **WHEN** the application starts
- **THEN** PrismaClient connects to the metadata database
- **AND** migrations are applied (in deployment)

#### Scenario: DATABASE_URL not set
- **GIVEN** DATABASE_URL is not configured
- **WHEN** the application starts
- **THEN** an error is logged and the application exits
