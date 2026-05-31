# Scheduling Specification

## Purpose
Manage scheduled backup execution using preset cron intervals via the `cron` npm package.

## Requirements

### Requirement: Scheduler activation
The system SHALL activate the cron scheduler on application startup.

#### Scenario: Scheduler enabled on startup
- GIVEN one or more preset env vars are set to "true"
- WHEN the application starts
- THEN an initial backup is created
- AND startCronJobs() is called to schedule recurring backups

#### Scenario: No schedules configured
- GIVEN no preset env vars are set to "true"
- WHEN the application starts
- THEN an initial backup is created
- AND a warning is logged that no schedules are configured
- AND no cron jobs are scheduled

### Requirement: Preset schedule configuration
The system provides four preset backup schedules controlled by boolean env vars.

#### Scenario: Every 2 hours enabled
- GIVEN `BACKUP_EVERY_2H` is set to `"true"`
- WHEN the application starts
- THEN a CronJob is created with cron expression `0 */2 * * *`
- AND the job is labeled "every-2h"

#### Scenario: Every 8 hours enabled
- GIVEN `BACKUP_EVERY_8H` is set to `"true"`
- WHEN the application starts
- THEN a CronJob is created with cron expression `0 */8 * * *`
- AND the job is labeled "every-8h"

#### Scenario: Every 24 hours enabled
- GIVEN `BACKUP_EVERY_24H` is set to `"true"`
- WHEN the application starts
- THEN a CronJob is created with cron expression `0 2 * * *`
- AND the job is labeled "every-24h"

#### Scenario: Weekly enabled
- GIVEN `BACKUP_WEEKLY` is set to `"true"`
- WHEN the application starts
- THEN a CronJob is created with cron expression `0 2 * * 0`
- AND the job is labeled "weekly"

### Requirement: Multiple simultaneous schedules
Multiple presets can be enabled at the same time, each running independently.

#### Scenario: Two presets enabled
- GIVEN `BACKUP_EVERY_2H` and `BACKUP_EVERY_24H` are both set to `"true"`
- WHEN `startCronJobs()` is called
- THEN two CronJobs are created and started
- AND backups run on both schedules independently

### Requirement: Disabled presets are skipped
Presets set to any value other than `"true"` are ignored.

#### Scenario: Preset set to false
- GIVEN `BACKUP_EVERY_2H` is set to `"false"`
- WHEN `startCronJobs()` is called
- THEN no CronJob is created for that preset

### Requirement: Startup logging
Active schedules are logged on startup.

#### Scenario: Schedules active
- GIVEN one or more presets are enabled
- WHEN `startCronJobs()` is called
- THEN a log message lists all active schedule labels

### Requirement: Job error handling
Each job's callback catches errors and logs them with the job label.

#### Scenario: Backup fails in scheduled job
- GIVEN a scheduled job runs and `createDatabaseDump()` throws
- WHEN the catch block executes
- THEN the error is logged to `console.error` with the job label prefix
- AND the CronJob continues scheduling future runs
