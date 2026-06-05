# Backup API Specification

## Purpose
REST API for creating, listing, and querying backup requests with per-request database connection details.

## Requirements

### Requirement: Create backup request
The system SHALL expose a `POST /backups` endpoint that creates a backup request with per-request database connection details.

#### Scenario: Valid request
- GIVEN the server is running
- WHEN a POST /backups request is received with body `{ host, port, user, password, database }`
- THEN a new BackupRequest record is created with status `pending`
- AND a 201 response is returned with the request details (excluding password)

#### Scenario: Missing required fields
- GIVEN the server is running
- WHEN a POST /backups request is received with missing fields
- THEN a 400 response is returned with validation error details

### Requirement: List backup requests
The system SHALL expose a `GET /backups` endpoint that returns all backup requests.

#### Scenario: List all requests
- GIVEN backup requests exist in the database
- WHEN a GET /backups request is received
- THEN a 200 response is returned with an array of all backup request records

#### Scenario: No requests
- GIVEN no backup requests exist
- WHEN a GET /backups request is received
- THEN a 200 response is returned with an empty array

### Requirement: Get specific backup request
The system SHALL expose a `GET /backups/:id` endpoint that returns a single backup request.

#### Scenario: Existing request
- GIVEN a backup request with the given ID exists
- WHEN a GET /backups/:id request is received
- THEN a 200 response is returned with the backup request details

#### Scenario: Non-existent request
- GIVEN no backup request with the given ID exists
- WHEN a GET /backups/:id request is received
- THEN a 404 response is returned

### Requirement: Password not returned in responses
The system SHALL NOT include the database password in any API response.

#### Scenario: POST response excludes password
- GIVEN a backup request is created
- WHEN the 201 response is returned
- THEN the response body does not contain the `password` field
