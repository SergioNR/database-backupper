## Why

The current system accepts a raw cron expression via `BACKUP_FREQUENCY`, requiring users to know cron syntax. Most users just want common intervals (every 2 hours, every 8 hours, daily, weekly). Offering preset schedules as toggleable env vars makes configuration simpler and less error-prone, while multiple presets can run simultaneously.

## What Changes

- Add four new env vars: `BACKUP_EVERY_2H`, `BACKUP_EVERY_8H`, `BACKUP_EVERY_24H`, `BACKUP_WEEKLY` — each set to `true` or `false`
- **BREAKING**: Remove `BACKUP_FREQUENCY` env var and all associated code
- Create one CronJob per enabled preset, each with its own hardcoded cron expression
- Multiple presets can be active simultaneously
- Update `.env.example` and `compose-example.yaml` — remove `BACKUP_FREQUENCY`, add four new vars

## Capabilities

### New Capabilities
- `preset-schedules`: Defines the four preset backup intervals, their cron expressions, and how they are toggled via env vars

### Modified Capabilities
- `scheduling`: The scheduler now manages multiple CronJobs from presets only; `BACKUP_FREQUENCY` is removed

## Impact

- `src/cron/jobs/` — new `backupJobs.js` factory, remove `createDatabaseDumpJob.js`
- `src/cron/cronJobScheduler.js` — starts all enabled preset jobs, no more `BACKUP_FREQUENCY` handling
- `.env.example`, `compose-example.yaml` — remove `BACKUP_FREQUENCY`, add four new env vars
- **BREAKING**: Users currently using `BACKUP_FREQUENCY` must migrate to one or more of the four presets
