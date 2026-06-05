# Backup Queue Specification

## Purpose
Database-backed queue with dump and upload processors that process backup requests sequentially.

## Requirements

### Requirement: Dump processor
The system SHALL run a processor that processes pending backup requests by creating database dumps.

#### Scenario: Process pending request
- GIVEN a BackupRequest with status `pending` exists
- WHEN the dump processor runs
- THEN the request status is set to `dumping`
- AND `pg_dump` is executed with the request's connection details
- AND on success, status is set to `dumped` and `dumpPath` is recorded
- AND `startedAt` is set to the current timestamp

#### Scenario: Dump fails
- GIVEN a BackupRequest with status `pending` exists
- AND `pg_dump` fails (connection error, auth error)
- WHEN the dump processor runs
- THEN the request status is set to `failed`
- AND `error` is recorded with the failure message

#### Scenario: No pending requests
- GIVEN no BackupRequest with status `pending` exists
- WHEN the dump processor runs
- THEN no action is taken

#### Scenario: Sequential processing
- GIVEN multiple BackupRequests with status `pending` exist
- WHEN the dump processor runs
- THEN only the oldest request (by createdAt) is processed

### Requirement: Upload processor
The system SHALL run a processor that processes dumped backup requests by uploading to S3.

#### Scenario: Process dumped request
- GIVEN a BackupRequest with status `dumped` exists and S3 is configured
- WHEN the upload processor runs
- THEN the request status is set to `uploading`
- AND the dump file is uploaded to S3
- AND on success, status is set to `uploaded` and `s3Key` is recorded
- AND `completedAt` is set to the current timestamp

#### Scenario: Upload fails
- GIVEN a BackupRequest with status `dumped` exists
- AND the S3 upload fails
- WHEN the upload processor runs
- THEN the request status is set to `failed`
- AND `error` is recorded

#### Scenario: S3 not configured
- GIVEN a BackupRequest with status `dumped` exists and S3 is not configured
- WHEN the upload processor runs
- THEN the request status is set to `uploaded` (skipped)
- AND `completedAt` is set

#### Scenario: No dumped requests
- GIVEN no BackupRequest with status `dumped` exists
- WHEN the upload processor runs
- THEN no action is taken

### Requirement: Processor polling interval
Both processors SHALL poll at the same interval, configurable via `PROCESSOR_INTERVAL` (in seconds, default 900 = 15 minutes).

#### Scenario: Default interval
- GIVEN `PROCESSOR_INTERVAL` is not set
- WHEN the application starts
- THEN both processors poll every 15 minutes

#### Scenario: Custom interval
- GIVEN `PROCESSOR_INTERVAL` is set to `300`
- WHEN the application starts
- THEN both processors poll every 5 minutes
