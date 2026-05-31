# Backup Execution Specification

## Purpose
Create PostgreSQL database dumps using pg_dump.

## Requirements

### Requirement: Manual backup trigger
The system creates a database dump when `createDatabaseDump()` is called (on startup or by scheduled jobs).

#### Scenario: Successful backup
- GIVEN all required environment variables are set (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DATABASE)
- WHEN `createDatabaseDump()` is called
- THEN a shell command is constructed using `PGPASSWORD` as a prefix and `pg_dump` with flags `-F c -b -v -w`
- AND the shell command is executed synchronously via Node.js `execSync()` with `stdio: 'pipe'`
- AND on success, a success message with the output path is logged
- AND the backup file is written to `/tmp/backup_<timestamp>.sql`

#### Scenario: Missing environment variables
- GIVEN one or more of DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, or DATABASE are not set
- WHEN `createDatabaseDump()` is called
- THEN an error is thrown with message "host, port, user, password, and database are required"
- AND no pg_dump command is attempted

#### Scenario: pg_dump command fails
- GIVEN all environment variables are set
- AND pg_dump cannot connect to the database or encounters an error
- WHEN execSync throws
- THEN the error message is logged to console.error
- AND the error is re-thrown so the caller can handle it

### Requirement: Backup file naming
Backup files use a timestamp-based naming scheme.

#### Scenario: Filename construction
- GIVEN a backup is triggered
- WHEN the output path is constructed
- THEN the filename follows the pattern `backup_YYYY-MM-DDTHH-MM-SS-sssZ.sql`
- AND colons and periods in the ISO timestamp are replaced with hyphens
- AND the file is placed in `/tmp/`

### Requirement: Database credentials in shell command
Database password is embedded directly in the shell command string.

#### Scenario: Password handling
- GIVEN DB_PASSWORD is set
- WHEN the backup command is constructed
- THEN PGPASSWORD is set as a shell variable prefix: `PGPASSWORD="<value>" /usr/bin/pg_dump ...`
- AND the `-w` flag suppresses the interactive password prompt

## Known Issues
- Password is visible in the process arguments on the host system
