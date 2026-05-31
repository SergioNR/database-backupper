# Delta for scheduling

## MODIFIED Requirements

### Requirement: Scheduler orchestration
The `startCronJobs` function SHALL start all enabled preset CronJobs. No custom cron expressions are supported.

#### Scenario: Single preset enabled
- **GIVEN** `BACKUP_EVERY_2H` is `"true"` and no other presets are set
- **WHEN** `startCronJobs()` is called
- **THEN** one CronJob is started for the 2h preset

#### Scenario: Multiple presets enabled
- **GIVEN** `BACKUP_EVERY_2H` is `"true"` and `BACKUP_WEEKLY` is `"true"`
- **WHEN** `startCronJobs()` is called
- **THEN** two CronJobs are started and both run independently

#### Scenario: No presets enabled
- **GIVEN** no preset env vars are set to `"true"`
- **WHEN** `startCronJobs()` is called
- **THEN** a warning is logged that no schedules are configured
- **AND** no CronJobs are created

### Requirement: Job factory
The system SHALL use a factory function to create CronJobs with a given schedule and label.

#### Scenario: Create a preset job
- **GIVEN** a cron expression and a label
- **WHEN** the factory function is called
- **THEN** a CronJob is created with that expression
- **AND** the job's callback calls `createDatabaseDump()` inside a try/catch
- **AND** errors are logged to console.error with the job label

## REMOVED Requirements

### Requirement: Cron job definition
**Reason**: Replaced by preset schedule system. `BACKUP_FREQUENCY` env var is removed.
**Migration**: Use `BACKUP_EVERY_2H`, `BACKUP_EVERY_8H`, `BACKUP_EVERY_24H`, or `BACKUP_WEEKLY` env vars instead.

### Requirement: Environment read at module load
**Reason**: No longer relevant — CronJobs are created at runtime via the factory, not at module load time.

## ADDED Requirements

### Requirement: Startup logging
The system SHALL log which schedules are active on startup.

#### Scenario: Multiple schedules active
- **GIVEN** `BACKUP_EVERY_2H` and `BACKUP_WEEKLY` are set to `"true"`
- **WHEN** `startCronJobs()` is called
- **THEN** a log message lists all active schedules (e.g. "Active schedules: every-2h, weekly")
