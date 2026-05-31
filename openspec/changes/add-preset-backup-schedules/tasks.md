## 1. Job Factory

- [ ] 1.1 Create `src/cron/jobs/backupJobs.js` with a `createBackupJob(cronExpression, label)` factory function
- [ ] 1.2 Factory returns a new CronJob that calls `createDatabaseDump()` inside try/catch
- [ ] 1.3 Errors are logged via `console.error` with the job label for identification

## 2. Preset Definitions

- [ ] 2.1 Define a `PRESETS` array in `backupJobs.js` mapping env var names to cron expressions and labels:
  - `BACKUP_EVERY_2H` → `0 */2 * * *` → "every-2h"
  - `BACKUP_EVERY_8H` → `0 */8 * * *` → "every-8h"
  - `BACKUP_EVERY_24H` → `0 2 * * *` → "every-24h"
  - `BACKUP_WEEKLY` → `0 2 * * 0` → "weekly"
- [ ] 2.2 Export an `initPresetJobs()` function that iterates PRESETS and creates jobs for those set to `"true"`

## 3. Scheduler Rewrite

- [ ] 3.1 Rewrite `src/cron/cronJobScheduler.js` to call `initPresetJobs()` and start all returned jobs
- [ ] 3.2 If no presets are enabled, log a warning that no schedules are configured
- [ ] 3.3 Log active schedule labels on startup (e.g. "Active schedules: every-2h, weekly")

## 4. Remove BACKUP_FREQUENCY

- [ ] 4.1 Delete `src/cron/jobs/createDatabaseDumpJob.js` entirely
- [ ] 4.2 Remove all references to `BACKUP_FREQUENCY` from code
- [ ] 4.3 Remove `BACKUP_FREQUENCY` from `.env.example`
- [ ] 4.4 Remove `BACKUP_FREQUENCY` from `compose-example.yaml`

## 5. Update Baseline Specs

- [ ] 5.1 Update `openspec/specs/scheduling/spec.md` to remove all `BACKUP_FREQUENCY` references and known issues
- [ ] 5.2 Update `openspec/specs/backup-execution/spec.md` if affected
- [ ] 5.3 Update `openspec/config.yaml` to reflect new env vars

## 6. Testing

- [ ] 6.1 Test with single preset enabled (`BACKUP_EVERY_2H=true`) — verify one job starts
- [ ] 6.2 Test with multiple presets enabled — verify all jobs start
- [ ] 6.3 Test with no schedules configured — verify warning is logged
- [ ] 6.4 Test with preset set to `"false"` — verify it's skipped
