# Delta for http-server

## MODIFIED Requirements

### Requirement: Health check endpoint
The system SHALL expose a GET /health endpoint that reports S3 upload status.

#### Scenario: S3 configured and last upload succeeded
- **GIVEN** `S3_BUCKET` is set and the last upload succeeded
- **WHEN** a GET /health request is received
- **THEN** the response includes `lastS3Upload: "<ISO timestamp>"` and `s3Status: "ok"`

#### Scenario: S3 configured but last upload failed
- **GIVEN** `S3_BUCKET` is set and the last upload failed
- **WHEN** a GET /health request is received
- **THEN** the response includes `s3Status: "error"` and `s3Error: "<message>"`

#### Scenario: S3 not configured
- **GIVEN** `S3_BUCKET` is not set
- **WHEN** a GET /health request is received
- **THEN** the response does not include S3-related fields
