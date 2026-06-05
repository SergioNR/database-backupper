# Scheduling Specification

## Purpose
Internal processors that poll the database for pending work at a configurable interval.

## Requirements

### Requirement: Internal processors start automatically
The dump and upload processors SHALL start automatically when the application starts.

#### Scenario: Application starts processors
- GIVEN the application starts and connects to the metadata database
- WHEN initialization completes
- THEN both processors start polling at the interval defined by `PROCESSOR_INTERVAL` (default: 15 minutes)

### Requirement: Configurable processor interval
The polling interval for both processors SHALL be configurable via the `PROCESSOR_INTERVAL` environment variable (in seconds).

#### Scenario: Default interval
- GIVEN `PROCESSOR_INTERVAL` is not set
- WHEN the application starts
- THEN both processors poll every 900 seconds (15 minutes)

#### Scenario: Custom interval
- GIVEN `PROCESSOR_INTERVAL` is set to `300`
- WHEN the application starts
- THEN both processors poll every 300 seconds (5 minutes)
