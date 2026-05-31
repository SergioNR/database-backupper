## Context

The current scheduler accepts a single `BACKUP_FREQUENCY` env var with a raw cron expression. After the Phase 0 fixes (exec→execSync, deferred CronJob construction), the scheduler infrastructure works but only supports one schedule. Users need to know cron syntax to configure it.

## Goals / Non-Goals

**Goals:**
- Offer four preset backup intervals as toggleable env vars: `BACKUP_EVERY_2H`, `BACKUP_EVERY_8H`, `BACKUP_EVERY_24H`, `BACKUP_WEEKLY`
- Allow multiple presets to run simultaneously
- Remove `BACKUP_FREQUENCY` and raw cron expression support entirely — only the four presets are available
- Keep configuration simple: `true`/`false` per preset

**Non-Goals:**
- Custom cron expressions — removed entirely
- Configurable preset intervals (e.g. "every 3 hours") — the presets are fixed
- Per-preset database targets — all presets back up the same database

## Decisions

### Decision 1: Job factory pattern over separate job files

Create a single `createBackupJob(schedule, label)` factory function instead of four separate job files.

**Rationale**: All presets run the same backup logic — only the cron expression differs. A factory avoids code duplication and makes adding new presets trivial.

**Alternative considered**: One file per preset (e.g. `every2h.js`, `every8h.js`). Rejected because each file would be identical except the cron string.

### Decision 2: Preset cron expressions

| Preset | Env Var | Cron Expression | Description |
|---|---|---|---|
| Every 2 hours | `BACKUP_EVERY_2H` | `0 */2 * * *` | At minute 0 past every 2nd hour |
| Every 8 hours | `BACKUP_EVERY_8H` | `0 */8 * * *` | At minute 0 past every 8th hour |
| Every 24 hours | `BACKUP_EVERY_24H` | `0 2 * * *` | Daily at 2:00 AM |
| Weekly | `BACKUP_WEEKLY` | `0 2 * * 0` | Weekly on Sunday at 2:00 AM |

### Decision 3: Remove BACKUP_FREQUENCY entirely

Delete all code, env vars, and references to `BACKUP_FREQUENCY`. Only the four presets are available.

**Rationale**: Simplicity — one way to configure schedules, no ambiguity about priority or interaction between presets and custom cron.

### Decision 4: Replace createDatabaseDumpJob.js with backupJobs.js

The current `createDatabaseDumpJob.js` will be deleted. A new `backupJobs.js` module will contain the factory and preset definitions. `cronJobScheduler.js` will iterate over enabled presets and start them.

## Risks / Trade-offs

- **BREAKING**: Users relying on `BACKUP_FREQUENCY` must switch to presets → Migration guide: map their cron to the closest preset
- **Multiple backups at the same time** → If `BACKUP_EVERY_24H` and `BACKUP_WEEKLY` both fire at 2 AM Sunday, two backups run concurrently. Acceptable for now.
- **No custom schedules** → Users who need "every 3 hours" or "daily at 5 AM" cannot be served. Can be added later as new presets.
