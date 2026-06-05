# Delta for s3-upload

## MODIFIED Requirements

### Requirement: S3-compatible upload
The upload processor SHALL upload dump files to S3 based on BackupRequest records, not triggered inline after backup creation.

#### Scenario: Upload from request record
- **GIVEN** a BackupRequest with status `dumped` exists and S3 is configured
- **WHEN** the upload processor runs
- **THEN** the file at `dumpPath` is uploaded to S3
- **AND** the s3Key is recorded on the request

## REMOVED Requirements

### Requirement: Retry queue for failed uploads (in-memory Set)
**Reason**: Replaced by database status tracking. Failed uploads set status to `failed` and are retried by the upload processor on the next cycle.
**Migration**: The upload processor picks up `dumped` and `failed` requests automatically.

### Requirement: S3 client lazy initialization
**Reason**: Still applies but no longer needs to be exported as a separate concern. Simplified to internal implementation detail.
