# API Docs Specification

## Purpose
Interactive API documentation served via Swagger UI.

## Requirements

### Requirement: Swagger UI
The system SHALL serve interactive API documentation at `/api-docs`.

#### Scenario: Access Swagger UI
- GIVEN the server is running
- WHEN a GET /api-docs request is received
- THEN the Swagger UI page is rendered
- AND all backup API endpoints are documented

### Requirement: OpenAPI spec generation
The system SHALL generate the OpenAPI specification from JSDoc comments on route handlers.

#### Scenario: Spec includes POST /backups
- GIVEN the application is running
- WHEN the OpenAPI spec is generated
- THEN it includes the POST /backups endpoint with request body schema and response schemas

#### Scenario: Spec includes GET endpoints
- GIVEN the application is running
- WHEN the OpenAPI spec is generated
- THEN it includes GET /backups and GET /backups/:id endpoints with response schemas
