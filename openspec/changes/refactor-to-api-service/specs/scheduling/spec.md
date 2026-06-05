# Delta for scheduling

## REMOVED Requirements

### Requirement: Preset schedule configuration
**Reason**: Replaced by API-driven model. Backups are no longer triggered by preset env vars.

### Requirement: Multiple simultaneous schedules
**Reason**: No longer relevant.

### Requirement: Disabled presets are skipped
**Reason**: No longer relevant.

### Requirement: No schedules configured
**Reason**: No longer relevant.

### Requirement: Startup logging
**Reason**: No longer relevant. Service logs processor startup instead.

### Requirement: Scheduler activation
**Reason**: Replaced by automatic processor startup.

## ADDED Requirements

### Requirement: Internal processors start automatically
The dump and upload processors SHALL start automatically when the application starts.

#### Scenario: Application starts processors
- **GIVEN** the application starts and connects to the metadata database
- **WHEN** initialization completes
- **THEN** the dump processor starts polling every 10 seconds
- **AND** the upload processor starts polling every 30 seconds
