# Delta for backup-execution

## ADDED Requirements

### Requirement: Backup retention
The system SHALL limit the number of stored backup files by removing the oldest when a configurable limit is exceeded.

#### Scenario: Retention limit not exceeded
- GIVEN MAX_BACKUPS is set to 5
- AND 3 backup files exist in /tmp
- WHEN a new backup is created
- THEN the new file is kept
- AND no existing files are deleted

#### Scenario: Retention limit exceeded
- GIVEN MAX_BACKUPS is set to 5
- AND 5 backup files exist in /tmp
- WHEN a new backup is created
- THEN the oldest backup file is deleted
- AND the new file is kept
- AND exactly 5 files remain

#### Scenario: MAX_BACKUPS not set
- GIVEN MAX_BACKUPS is not configured
- WHEN a new backup is created
- THEN no files are deleted
- AND backups accumulate without limit (backward-compatible behavior)

## MODIFIED Requirements

### Requirement: Manual backup trigger
The system SHALL create a database dump when explicitly called AND track the result for health reporting.

#### Scenario: Successful backup tracked
- GIVEN a backup completes successfully
- WHEN the file is written
- THEN the last backup timestamp and status ("success") are recorded in memory
- AND the retention check runs

#### Scenario: Failed backup tracked
- GIVEN a backup fails
- WHEN the error is logged
- THEN the last backup timestamp and status ("failed") are recorded in memory
