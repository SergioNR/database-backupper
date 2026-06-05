# S3 Upload Specification

## Purpose
Upload backup files to S3-compatible storage for durable off-site backup, driven by the upload processor.

## Requirements

### Requirement: S3-compatible upload
The upload processor SHALL upload dump files to S3 based on BackupRequest records.

#### Scenario: Upload from request record
- GIVEN a BackupRequest with status `dumped` exists and S3 is configured
- WHEN the upload processor runs
- THEN the file at `dumpPath` is uploaded to S3
- AND the s3Key is recorded on the request

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
- WHEN the upload processor checks S3 configuration
- THEN S3 is treated as not configured
- AND the request is marked as uploaded (skipped)

### Requirement: Upload failure handling
The system SHALL set the request status to `failed` if the S3 upload fails.

#### Scenario: Upload fails
- GIVEN a backup file exists locally and the S3 upload fails
- WHEN the upload error is caught
- THEN the error is logged with details
- AND the local backup file is preserved
- AND the request status is set to `failed` with the error message

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
- WHEN a file `backup_xxx_2026-05-31T20-00-00-000Z.sql` is uploaded
- THEN the object key is `myapp/backups/backup_xxx_2026-05-31T20-00-00-000Z.sql`

#### Scenario: No prefix
- GIVEN `S3_PATH_PREFIX` is not set
- WHEN a file is uploaded
- THEN the object key is just the filename
