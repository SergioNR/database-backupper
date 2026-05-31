## 1. S3 Module

- [x] 1.1 Install `@aws-sdk/client-s3` dependency
- [x] 1.2 Create `src/s3.js` with `isS3Configured()` validator — checks S3_BUCKET + S3_ACCESS_KEY + S3_SECRET_KEY, logs warning if partially configured
- [x] 1.3 Implement lazy-initialized S3Client with `forcePathStyle: true` when custom endpoint is provided
- [x] 1.4 Implement `uploadToS3(filePath)` function using PutObjectCommand
- [x] 1.5 Support `S3_PATH_PREFIX` for object key prefix
- [x] 1.6 All S3 functions wrapped in try/catch — never throw, always return status

## 2. Retry Queue

- [x] 2.1 Add in-memory `Set<string>` retry queue to s3.js for failed upload file paths
- [x] 2.2 On upload failure, add file path to retry queue (deduplicated by Set)
- [x] 2.3 On upload success, remove file path from retry queue if present
- [x] 2.4 Implement `startRetryTimer()` with configurable `S3_RETRY_INTERVAL` (default 300s)
- [x] 2.5 Retry timer iterates queue, attempts upload for each file, removes on success, logs failures
- [x] 2.6 Timer only runs while queue is non-empty (stops when empty, restarts on next failure)
- [x] 2.7 Export `getRetryQueueSize()` for health endpoint reporting

## 3. Integrate Upload into Backup Flow

- [x] 3.1 In `backup.js`, call `uploadToS3()` after successful dump, before `rotateBackups()`
- [x] 3.2 Skip upload call entirely if `isS3Configured()` returns false
- [x] 3.3 Wrap upload call in try/catch — log error but don't throw (backup stays local)
- [x] 3.4 Import and call `startRetryTimer()` from `index.mjs` on startup

## 4. Health Endpoint S3 Status

- [x] 4.1 Add `s3State` tracking object to `s3.js` (lastUpload, lastError, status)
- [x] 4.2 Update `/health` in `index.mjs` to include S3 status and retry queue size when configured

## 5. Configuration

- [ ] 5.1 Add S3 env vars to `.env.example` (S3_BUCKET, S3_REGION, S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY, S3_PATH_PREFIX, S3_RETRY_INTERVAL)
- [ ] 5.2 Add S3 env vars to `compose-example.yaml`

## 6. Testing

- [ ] 6.1 Test backup completes successfully when S3 is not configured (no regression)
- [ ] 6.2 Test server starts normally when S3_BUCKET is set but credentials are missing (warning logged)
- [ ] 6.3 Test upload is skipped when S3_BUCKET is not set
- [ ] 6.4 Test upload failure does not crash the backup process
- [ ] 6.5 Test failed upload is added to retry queue
- [ ] 6.6 Test retry queue processes files and removes them on success
- [ ] 6.7 Test `/health` includes S3 status and queue size when configured, omits when not
