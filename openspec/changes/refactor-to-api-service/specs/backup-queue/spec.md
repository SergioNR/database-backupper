# backup-queue spec

## ADDED Requirements

### Requirement: Dump processor
The system SHALL run a cron job that processes pending backup requests by creating database dumps.

#### Scenario: Process pending request
- **GIVEN** a BackupRequest with status `pending` exists
- **WHEN** the dump processor runs
- **THEN** the request status is set to `dumping`
- **AND** `pg_dump` is executed with the request's connection details
- **AND** on success, status is set to `dumped` and `dumpPath` is recorded
- **AND** `startedAt` is set to the current timestamp

#### Scenario: Dump fails
- **GIVEN** a BackupRequest with status `pending` exists
- **AND** `pg_dump` fails (connection error, auth error)
- **WHEN** the dump processor runs
- **THEN** the request status is set to `failed`
- **AND** `error` is recorded with the failure message

#### Scenario: No pending requests
- **GIVEN** no BackupRequest with status `pending` exists
- **WHEN** the dump processor runs
- **THEN** no action is taken

#### Scenario: Sequential processing
- **GIVEN** multiple BackupRequests with status `pending` exist
- **WHEN** the dump processor runs
- **THEN** only the oldest request (by createdAt) is processed

### Requirement: Upload processor
The system SHALL run a cron job that processes dumped backup requests by uploading to S3.

#### Scenario: Process dumped request
- **GIVEN** a BackupRequest with status `dumped` exists and S3 is configured
- **WHEN** the upload processor runs
- **THEN** the request status is set to `uploading`
- **AND** the dump file is uploaded to S3
- **AND** on success, status is set to `uploaded` and `s3Key` is recorded
- **AND** `completedAt` is set to the current timestamp

#### Scenario: Upload fails
- **GIVEN** a BackupRequest with status `dumped` exists
- **AND** the S3 upload fails
- **WHEN** the upload processor runs
- **THEN** the request status is set to `failed`
- **AND** `error` is recorded

#### Scenario: S3 not configured
- **GIVEN** a BackupRequest with status `dumped` exists and S3 is not configured
- **WHEN** the upload processor runs
- **THEN** the request status is set to `uploaded` (skipped)
- **AND** `completedAt` is set

#### Scenario: No dumped requests
- **GIVEN** no BackupRequest with status `dumped` exists
- **WHEN** the upload processor runs
- **THEN** no action is taken

### Requirement: Processor polling intervals
The dump processor SHALL poll every 10 seconds. The upload processor SHALL poll every 30 seconds.

#### Scenario: Dump processor interval
- **GIVEN** the application is running
- **WHEN** 10 seconds elapse
- **THEN** the dump processor runs one cycle

#### Scenario: Upload processor interval
- **GIVEN** the application is running
- **WHEN** 30 seconds elapse
- **THEN** the upload processor runs one cycle
