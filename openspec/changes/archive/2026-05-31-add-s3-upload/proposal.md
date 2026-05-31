## Why

Backups stored only in `/tmp` inside the container are lost if the container is removed or the host volume fails. Uploading to S3-compatible storage (AWS S3, MinIO, DigitalOcean Spaces, etc.) provides durable, off-site backup storage with minimal configuration.

## What Changes

- Add `@aws-sdk/client-s3` as a dependency for S3-compatible uploads
- After each successful backup, upload the dump file to a configurable S3 bucket
- All S3 configuration via env vars (endpoint, bucket, region, credentials)
- S3 upload is optional — if `S3_BUCKET` is not set, backups stay local-only
- Add S3 upload status to the `/health` endpoint response

## Capabilities

### New Capabilities
- `s3-upload`: Uploads backup files to S3-compatible storage after each successful dump. Configurable endpoint, bucket, region, and credentials. Works with AWS S3, MinIO, DigitalOcean Spaces, and any S3-compatible service.

### Modified Capabilities
- `backup-execution`: After a successful backup, optionally upload to S3 before retention cleanup
- `http-server`: Health endpoint reports S3 upload status (last upload time, upload failures)

## Impact

- `package.json` — add `@aws-sdk/client-s3` dependency
- `src/backup.js` — call S3 upload after successful dump
- `src/s3.js` — new module for S3 upload logic
- `.env.example`, `compose-example.yaml` — add S3 env vars
- `Dockerfile` — no changes needed (SDK is pure JS, no native deps)
- `.env` and `compose.yaml` in `.gitignore` — safe for credentials
