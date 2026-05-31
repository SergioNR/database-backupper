# Scheduling Specification

## Purpose
Manage scheduled backup execution using cron expressions via the `cron` npm package.

## Requirements

### Requirement: Cron job definition
The system defines a CronJob instance using `BACKUP_FREQUENCY` from the environment.

#### Scenario: CronJob is created with environment schedule
- GIVEN `createDatabaseDumpJob.js` is imported
- WHEN the module loads
- THEN a `CronJob` instance is constructed with `process.env.BACKUP_FREQUENCY` as the schedule
- AND the job's callback calls `createDatabaseDump()` inside a try/catch

#### Scenario: CronJob.start() is never called
- GIVEN the CronJob instance is created at module load time
- WHEN the module is imported anywhere
- THEN `.start()` is never invoked on the CronJob
- AND the job will never fire regardless of schedule configuration

### Requirement: Cron job error handling
The cron job callback includes a try/catch block that references an undefined function.

#### Scenario: Error in cron callback
- GIVEN the cron job callback runs and `createDatabaseDump()` throws
- WHEN the catch block executes
- THEN `logError()` is called
- AND `logError` is not imported or defined, causing a ReferenceError
- AND the original error is silently lost

### Requirement: Scheduler orchestration
The `startCronJobs` function is intended to start all cron jobs but contains a type error.

#### Scenario: startCronJobs is called
- GIVEN `startCronJobs()` is called
- WHEN it invokes `createDatabaseBackupJob()` 
- THEN a TypeError is thrown because `createDatabaseBackupJob` is a `CronJob` instance, not a function
- AND the scheduler fails

### Requirement: Scheduler is disabled
The cron scheduler is commented out in the application entry point.

#### Scenario: Application starts (current state)
- GIVEN the application starts via `index.mjs`
- WHEN the main script runs
- THEN `startCronJobs()` is commented out and never called
- AND only the initial backup on startup occurs (via direct `createDatabaseDump()` call)
- AND no recurring backups are scheduled

### Requirement: Environment read at module load
`BACKUP_FREQUENCY` is read from `process.env` at module load time, not at schedule time.

#### Scenario: Environment not available at import time
- GIVEN `BACKUP_FREQUENCY` is not set when the module loads
- WHEN the CronJob constructor receives `undefined` as the schedule
- THEN the cron library behavior is undefined (likely throws or defaults)

## Known Issues
- `startCronJobs()` calls a CronJob instance as a function — TypeError at runtime
- `CronJob.start()` is never called — even if instantiated, the job won't fire
- `logError` is not imported or defined — ReferenceError in the catch block
- `BACKUP_FREQUENCY` read at import time, not runtime
