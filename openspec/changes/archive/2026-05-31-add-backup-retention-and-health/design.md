# Design: Backup Retention and Health Endpoint

## Prerequisite: Fix async/callback mismatch in backup.js
Convert `exec()` to `execSync()` (or promisified exec from `node:child_process`) so that `createDatabaseDump` actually awaits pg_dump completion. This is required before any success/failure tracking or retention logic can work.

- Replace `import { exec } from 'node:child_process'` with `import { execSync } from 'node:child_process'`
- Wrap `execSync` in a try/catch, set `backupState` on success/failure
- Remove the unused `fs` import

## Prerequisite: Fix cron scheduler bugs
Three bugs must be fixed before enabling the scheduler:

1. **cronJobScheduler.js** — Change from calling `createDatabaseBackupJob()` (TypeError) to `createDatabaseBackupJob.start()` (correct CronJob API)
2. **createDatabaseDumpJob.js** — Add `.start()` call after CronJob construction, or construct and start in the scheduler
3. **createDatabaseDumpJob.js** — Replace `logError(...)` with `console.error(...)`

## In-Memory State
Add a module-level object to track backup state:
```js
export const backupState = {
  lastBackup: null,      // ISO timestamp
  lastStatus: null,      // "success" | "failed"
  lastError: null,       // error message if failed
  backupCount: 0         // total successful backups since start
}
```

## Backup Retention Logic
- After each successful dump, read /tmp directory
- Filter files matching `backup_*.sql`
- Sort by filename (timestamps are lexicographically sortable)
- If count > MAX_BACKUPS, delete oldest files (slice from start)
- MAX_BACKUPS defaults to Infinity (no retention) if not set

## Health Endpoint
- Add `app.get('/health', ...)` route in index.mjs
- Import backupState from backup.js
- Return JSON with status derived from backupState

## Scheduler Activation
- Uncomment `startCronJobs()` in index.mjs
- Add guard: only call if BACKUP_FREQUENCY is set, log warning otherwise
