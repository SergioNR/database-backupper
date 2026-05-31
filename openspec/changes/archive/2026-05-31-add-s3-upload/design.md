## Context

Backups are currently written to `/tmp` inside the container and optionally persisted via Docker volume mounts. This is fragile — container removal or host disk failure loses all backups. S3-compatible storage provides durable, off-site storage.

## Goals / Non-Goals

**Goals:**
- Upload each backup file to S3-compatible storage immediately after creation
- Support any S3-compatible service (AWS S3, MinIO, DigitalOcean Spaces, etc.) via configurable endpoint
- Make S3 upload optional — if `S3_BUCKET` is not configured, everything works as before
- Never crash the server — missing/invalid credentials, network failures, and S3 outages are all handled gracefully
- Retry failed uploads periodically so temporary S3 outages don't result in lost off-site backups
- Report S3 upload status and retry queue size in the health endpoint

**Non-Goals:**
- Downloading/restoring backups from S3 (manual process)
- S3 lifecycle policies or bucket management
- Multipart upload for large files (single PutObject is sufficient for pg_dump custom format files)
- Encrypting backups before upload (S3 server-side encryption handles this)
- Persisting the retry queue to disk (in-memory only — lost on container restart)

## Decisions

### Decision 1: Use @aws-sdk/client-s3

Use the official AWS SDK v3 with only the `S3Client` and `PutObjectCommand`.

**Rationale**: Modular, tree-shakeable, works with any S3-compatible service by setting a custom `endpoint`. Pure JavaScript — no native dependencies, no changes to the Dockerfile.

**Alternative considered**: Shell out to `aws s3 cp`. Rejected because it requires installing the AWS CLI in the Docker image and doesn't handle MinIO's endpoint configuration as cleanly.

### Decision 2: Separate s3.js module

Create `src/s3.js` as a standalone module with `uploadToS3(filePath)` function and retry logic. Called from `backup.js` after a successful dump, before retention cleanup.

**Rationale**: Separation of concerns — backup logic stays in backup.js, upload + retry logic in s3.js. Easy to test independently.

### Decision 3: S3 client lazy initialization with validation

Create the S3Client instance once on first upload attempt, reuse for subsequent uploads. Before creating the client, validate that all required env vars are present. If not, log a warning and skip — never throw.

**Rationale**: Prevents crashes when S3_BUCKET is set but credentials are missing. The client simply doesn't get created.

### Decision 4: Upload before retention

Upload happens after successful dump but before `rotateBackups()`. This ensures the file is in S3 before it could be deleted by retention.

### Decision 5: In-memory retry queue with periodic timer

Maintain a `Set<string>` of file paths that failed to upload. A `setInterval` timer (configurable via `S3_RETRY_INTERVAL`, default 300s/5min) attempts to re-upload queued files. Successfully uploaded files are removed from the queue. The timer only runs while the queue is non-empty.

**Rationale**: Simple, no external state, handles temporary S3 outages. In-memory means the queue is lost on container restart — acceptable trade-off since local files still exist and will be retried on the next backup cycle if they haven't been rotated away.

**Alternative considered**: Persist queue to a file in `/tmp`. Rejected as over-engineering for now — can be added later if needed.

### Decision 6: Environment variables

| Env Var | Required | Description |
|---|---|---|
| `S3_BUCKET` | No | Bucket name. If not set, uploads are skipped entirely |
| `S3_REGION` | No | Region (default: `us-east-1`) |
| `S3_ENDPOINT` | No | Custom endpoint for MinIO/Spaces (default: AWS) |
| `S3_ACCESS_KEY` | No* | Access key ID (*validated only if S3_BUCKET is set) |
| `S3_SECRET_KEY` | No* | Secret access key (*validated only if S3_BUCKET is set) |
| `S3_PATH_PREFIX` | No | Optional prefix/folder in the bucket (default: none) |
| `S3_RETRY_INTERVAL` | No | Seconds between retry attempts (default: 300) |

## Risks / Trade-offs

- **Retry queue is in-memory** → Lost on container restart. Mitigated by the fact that local files still exist and will be re-uploaded on next backup if still in `/tmp`.
- **Upload failures don't block backups** → If S3 upload fails, log the error but don't delete the local file or throw. The backup still exists locally. → Mitigation: retry queue attempts re-upload periodically
- **No multipart upload** → pg_dump custom format files can be large. Single PutObject has a 5GB limit. → Acceptable for now; can add multipart later if needed
- **Credentials in env vars** → Standard for containers, but ensure compose.yaml stays in .gitignore
