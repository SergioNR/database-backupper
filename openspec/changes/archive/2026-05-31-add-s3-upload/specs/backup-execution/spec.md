# Delta for backup-execution

## MODIFIED Requirements

### Requirement: Manual backup trigger
The system creates a database dump when `createDatabaseDump()` is called, tracks the result, and optionally uploads to S3 before running retention cleanup.

#### Scenario: Successful backup with S3 upload
- **GIVEN** all database env vars are set and `S3_BUCKET` is configured
- **WHEN** `createDatabaseDump()` is called
- **THEN** the dump file is created locally
- **AND** `backupState` is updated with success
- **AND** the file is uploaded to S3
- **AND** retention cleanup runs

#### Scenario: Successful backup without S3
- **GIVEN** all database env vars are set and `S3_BUCKET` is not set
- **WHEN** `createDatabaseDump()` is called
- **THEN** the dump file is created locally
- **AND** `backupState` is updated with success
- **AND** no upload is attempted
- **AND** retention cleanup runs
