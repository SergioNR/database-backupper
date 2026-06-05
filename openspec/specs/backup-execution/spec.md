# Backup Execution Specification

## Purpose
Create PostgreSQL database dumps using pg_dump with per-request connection details.

## Requirements

### Requirement: Per-request database dump
The system creates a database dump when the dump processor picks up a pending request, using per-request connection details.

#### Scenario: Successful dump from request
- GIVEN a BackupRequest with status `pending` exists with host, port, user, password, database
- WHEN the dump processor runs
- THEN `pg_dump` is executed with the request's connection details
- AND the backup file is written to `/tmp/backup_<requestId>_<timestamp>.sql`
- AND the dumpPath is recorded on the request

#### Scenario: Failed dump
- GIVEN a BackupRequest with status `pending` exists
- AND `pg_dump` fails (connection error, auth error)
- WHEN the dump processor runs
- THEN the request status is set to `failed`
- AND the error message is recorded on the request

### Requirement: Backup file naming
Backup files use a request ID and timestamp-based naming scheme.

#### Scenario: Filename construction
- GIVEN a backup is triggered for a request
- WHEN the output path is constructed
- THEN the filename follows the pattern `backup_<requestId>_<timestamp>.sql`
- AND colons and periods in the ISO timestamp are replaced with hyphens
- AND the file is placed in `/tmp/`

### Requirement: Database credentials in shell command
Database password is embedded directly in the shell command string.

#### Scenario: Password handling
- GIVEN a backup request with a password
- WHEN the backup command is constructed
- THEN PGPASSWORD is set as a shell variable prefix: `PGPASSWORD="<value>" /usr/bin/pg_dump ...`
- AND the `-w` flag suppresses the interactive password prompt

## Known Issues
- Password is visible in the process arguments on the host system
