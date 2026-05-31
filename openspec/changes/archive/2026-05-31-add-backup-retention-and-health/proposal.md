# Proposal: Backup Retention and Health Endpoint

## Intent
Prevent unbounded disk growth by adding configurable backup retention, and add a health check endpoint for container orchestration. Enable the cron scheduler (currently commented out and broken).

## Scope
- Fix `createDatabaseDump` async/callback mismatch so completion can be tracked
- Fix cron scheduler bugs (TypeError, missing .start(), undefined logError)
- Add MAX_BACKUPS env var to limit stored backups (oldest deleted first)
- Add GET /health endpoint returning backup status and last backup time
- Uncomment and activate startCronJobs() in index.mjs
- Add backup success/failure logging with structured output

## Approach
- Convert `exec()` to `execSync()` (or promisified `exec`) in backup.js so callers can await completion and track results
- Fix `cronJobScheduler.js` to call `.start()` on the CronJob instance instead of invoking it as a function
- Fix `createDatabaseDumpJob.js` to replace undefined `logError` with `console.error`
- On each backup completion, scan /tmp for backup_*.sql files, sort by date, delete oldest if count exceeds MAX_BACKUPS
- Add a simple Express route for /health
- Track last backup timestamp and status in memory for the health endpoint to report

## Prerequisites Discovered
These issues exist in the current codebase and block the change. They must be fixed first:

1. **backup.js: async/callback mismatch** — `createDatabaseDump` is async but uses callback-based `exec()`. Function returns before pg_dump finishes. No way to track success/failure.
2. **cronJobScheduler.js: TypeError** — calls `createDatabaseBackupJob()` but that's a CronJob instance, not a function.
3. **createDatabaseDumpJob.js: missing .start()** — CronJob is created but `.start()` is never called, so it won't fire.
4. **createDatabaseDumpJob.js: undefined logError** — `logError()` is called in the catch block but never imported or defined.
