# Delta for backup-execution

## MODIFIED Requirements

### Requirement: Manual backup trigger
The system creates a database dump when the dump processor picks up a pending request, using per-request connection details instead of global env vars.

#### Scenario: Successful dump from request
- **GIVEN** a BackupRequest with status `pending` exists with host, port, user, password, database
- **WHEN** the dump processor runs
- **THEN** `pg_dump` is executed with the request's connection details (not global env vars)
- **AND** the backup file is written to `/tmp/backup_<requestId>_<timestamp>.sql`
- **AND** the dumpPath is recorded on the request

## REMOVED Requirements

### Requirement: Backup state tracking (in-memory backupState)
**Reason**: Replaced by database-backed BackupRequest records. Each request tracks its own status, timestamps, and errors.
**Migration**: Use GET /backups/:id to check individual request status instead of the global backupState object.

### Requirement: Backup retention (rotateBackups)
**Reason**: Local file rotation is no longer the primary concern. Files are uploaded to S3. Local cleanup can be handled separately if needed.
**Migration**: S3 provides durable storage. Local /tmp files are ephemeral.
