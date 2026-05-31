# Tasks

## 0. Prerequisite Fixes
- [x] 0.1 Convert `exec()` to `execSync()` in backup.js so createDatabaseDump is truly awaitable
- [x] 0.2 Remove unused `fs` import from backup.js
- [x] 0.3 Fix cronJobScheduler.js: change `createDatabaseBackupJob()` to `createDatabaseBackupJob.start()`
- [x] 0.4 Add `.start()` call to CronJob in createDatabaseDumpJob.js (or ensure scheduler calls it)
- [x] 0.5 Replace undefined `logError(...)` with `console.error(...)` in createDatabaseDumpJob.js

## 1. Backup State Tracking
- [ ] 1.1 Export `backupState` object from backup.js
- [ ] 1.2 Update `createDatabaseDump` to set backupState on success
- [ ] 1.3 Update `createDatabaseDump` to set backupState on failure

## 2. Backup Retention
- [ ] 2.1 Create `rotateBackups(maxBackups)` function in backup.js
- [ ] 2.2 Read /tmp, filter backup_*.sql files, sort by name
- [ ] 2.3 Delete oldest files when count exceeds maxBackups
- [ ] 2.4 Call rotateBackups after successful dump (if MAX_BACKUPS is set)
- [ ] 2.5 Add MAX_BACKUPS to .env.example and compose-example.yaml

## 3. Health Endpoint
- [ ] 3.1 Add `GET /health` route in index.mjs
- [ ] 3.2 Import backupState and return JSON response
- [ ] 3.3 Return 200 for healthy/starting, 503 for degraded
- [ ] 3.4 Add healthcheck to Dockerfile (HEALTHCHECK instruction)

## 4. Enable Cron Scheduler
- [ ] 4.1 Uncomment startCronJobs() in index.mjs
- [ ] 4.2 Add guard: skip if BACKUP_FREQUENCY not set, log warning

## 5. Testing
- [ ] 5.1 Test retention with MAX_BACKUPS=2 and 3 successful backups
- [ ] 5.2 Test /health returns 200 before any backup (starting state)
- [ ] 5.3 Test /health returns 200 after successful backup
- [ ] 5.4 Test /health returns 503 after failed backup
- [ ] 5.5 Test cron scheduler starts when BACKUP_FREQUENCY is set
- [ ] 5.6 Test warning logged when BACKUP_FREQUENCY is missing
