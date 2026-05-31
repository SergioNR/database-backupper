# Delta for scheduling

## MODIFIED Requirements

### Requirement: Scheduler activation
The system SHALL activate the cron scheduler on application startup by default.

#### Scenario: Scheduler enabled on startup
- GIVEN BACKUP_FREQUENCY is set
- WHEN the application starts
- THEN an initial backup is created
- AND startCronJobs() is called to schedule recurring backups

#### Scenario: No BACKUP_FREQUENCY configured
- GIVEN BACKUP_FREQUENCY is not set
- WHEN the application starts
- THEN an initial backup is created
- AND a warning is logged that recurring backups are disabled
- AND no cron job is scheduled
