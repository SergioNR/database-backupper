# Preset Schedules Specification

## Purpose
Define the four preset backup intervals, their cron expressions, and how they are toggled via env vars.

## Requirements

### Requirement: Preset schedule definitions
The system SHALL define four preset backup schedules, each controlled by its own boolean env var.

#### Scenario: Every 2 hours enabled
- **GIVEN** `BACKUP_EVERY_2H` is set to `"true"`
- **WHEN** the application starts
- **THEN** a CronJob is created with cron expression `0 */2 * * *`
- **AND** the job is labeled "every-2h"

#### Scenario: Every 8 hours enabled
- **GIVEN** `BACKUP_EVERY_8H` is set to `"true"`
- **WHEN** the application starts
- **THEN** a CronJob is created with cron expression `0 */8 * * *`
- **AND** the job is labeled "every-8h"

#### Scenario: Every 24 hours enabled
- **GIVEN** `BACKUP_EVERY_24H` is set to `"true"`
- **WHEN** the application starts
- **THEN** a CronJob is created with cron expression `0 2 * * *`
- **AND** the job is labeled "every-24h"

#### Scenario: Weekly enabled
- **GIVEN** `BACKUP_WEEKLY` is set to `"true"`
- **WHEN** the application starts
- **THEN** a CronJob is created with cron expression `0 2 * * 0`
- **AND** the job is labeled "weekly"

### Requirement: Disabled presets are skipped
Presets set to any value other than `"true"` SHALL be ignored.

#### Scenario: Preset set to false
- **GIVEN** `BACKUP_EVERY_2H` is set to `"false"`
- **WHEN** the application starts
- **THEN** no CronJob is created for that preset

#### Scenario: Preset env var not set
- **GIVEN** `BACKUP_EVERY_2H` is not defined in the environment
- **WHEN** the application starts
- **THEN** no CronJob is created for that preset

### Requirement: Multiple presets run simultaneously
The system SHALL support multiple presets enabled at the same time.

#### Scenario: Two presets enabled
- **GIVEN** `BACKUP_EVERY_2H` is `"true"` and `BACKUP_EVERY_24H` is `"true"`
- **WHEN** the application starts
- **THEN** two CronJobs are created and started
- **AND** backups run on both schedules independently
