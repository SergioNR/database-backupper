# S3 Upload Specification

## Purpose
Upload backup files to S3-compatible storage for durable off-site backup.

## Requirements

### Requirement: S3-compatible upload
The system SHALL upload backup files to S3-compatible storage after each successful backup.

#### Scenario: Upload after successful backup
- GIVEN `S3_BUCKET` is configured and all S3 credentials are set
- WHEN a backup file is created successfully
- THEN the file is uploaded to the configured S3 bucket using `PutObjectCommand`
- AND the S3 object key is `<S3_PATH_PREFIX/>backup_<timestamp>.sql` (prefix omitted if not set)

#### Scenario: S3 not configured
- GIVEN `S3_BUCKET` is not set
- WHEN a backup file is created successfully
- THEN no upload is attempted
- AND the backup exists only in local storage

#### Scenario: Custom S3-compatible endpoint
- GIVEN `S3_ENDPOINT` is set to a non-AWS URL (e.g. `http://minio:9000`)
- AND `S3_BUCKET` and credentials are set
- WHEN an upload is attempted
- THEN the SDK client uses the custom endpoint instead of AWS
- AND `forcePathStyle` is set to `true` for compatibility with MinIO and similar services

### Requirement: Graceful handling of missing credentials
The system SHALL NOT crash if S3 credentials are missing or invalid. Missing credentials SHALL be treated the same as S3 not being configured.

#### Scenario: S3_BUCKET set but credentials missing
- GIVEN `S3_BUCKET` is set but `S3_ACCESS_KEY` or `S3_SECRET_KEY` is not set
- WHEN the application starts or a backup completes
- THEN a warning is logged that S3 is partially configured and uploads are disabled
- AND no upload is attempted
- AND the server continues running normally

#### Scenario: S3_BUCKET set but credentials are invalid
- GIVEN `S3_BUCKET` is set and `S3_ACCESS_KEY` and `S3_SECRET_KEY` are set but incorrect
- WHEN an upload is attempted
- THEN the upload fails with an authentication error
- AND the error is logged
- AND the file is added to the retry queue
- AND the server continues running normally

### Requirement: Upload failure tolerance
The system SHALL NOT fail the backup if the S3 upload fails.

#### Scenario: Upload fails
- GIVEN a backup file is created successfully
- AND the S3 upload fails (network error, auth error, bucket not found)
- WHEN the upload error is caught
- THEN the error is logged with details
- AND the local backup file is preserved
- AND the backup is still counted as successful in `backupState`
- AND the file is added to the retry queue

### Requirement: Retry queue for failed uploads
The system SHALL maintain an in-memory queue of local backup files that failed to upload and retry them on a periodic schedule.

#### Scenario: Failed upload is queued for retry
- GIVEN a backup file exists locally and its S3 upload failed
- WHEN the upload failure is caught
- THEN the file path is added to the retry queue
- AND the queue is deduplicated (same file not added twice)

#### Scenario: Retry succeeds
- GIVEN the retry queue contains files from previous failed uploads
- AND S3 connectivity has been restored
- WHEN the retry timer fires
- THEN each queued file is uploaded to S3
- AND successfully uploaded files are removed from the queue
- AND a log message confirms each retried upload

#### Scenario: Retry also fails
- GIVEN the retry queue contains files
- AND S3 is still unavailable
- WHEN the retry timer fires
- THEN files that still fail remain in the queue
- AND the error is logged per file
- AND the retry will be attempted again on the next interval

#### Scenario: Retry interval
- GIVEN `S3_BUCKET` is configured
- WHEN the application starts
- THEN a retry timer runs every `S3_RETRY_INTERVAL` seconds (default: 300 / 5 minutes)
- AND the timer only runs while there are files in the retry queue

### Requirement: Lazy S3 client initialization
The S3Client SHALL be created once on first upload attempt and reused.

#### Scenario: First upload initializes client
- GIVEN no uploads have occurred yet
- WHEN the first upload is attempted
- THEN an S3Client is created from env vars
- AND the same client instance is reused for subsequent uploads

### Requirement: S3 path prefix
The system SHALL support an optional path prefix for organizing backups in the bucket.

#### Scenario: Prefix configured
- GIVEN `S3_PATH_PREFIX` is set to `myapp/backups`
- WHEN a file `backup_2026-05-31T20-00-00-000Z.sql` is uploaded
- THEN the object key is `myapp/backups/backup_2026-05-31T20-00-00-000Z.sql`

#### Scenario: No prefix
- GIVEN `S3_PATH_PREFIX` is not set
- WHEN a file is uploaded
- THEN the object key is `backup_2026-05-31T20-00-00-000Z.sql`
