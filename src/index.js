import express from 'express'
import { createDatabaseDump, backupState } from './backup.js';
import { startCronJobs } from './cron/cronJobScheduler.js';
import { isS3Configured, s3State, getRetryQueueSize, startRetryTimer } from './s3.js';


const app = express();

app.get('/health', (req, res) => {
    const response = {};

    if (backupState.lastStatus === 'failed') {
        response.status = 'degraded';
        response.lastBackup = backupState.lastBackup;
        response.lastError = backupState.lastError;
        response.backupCount = backupState.backupCount;
    } else if (backupState.lastStatus === 'success') {
        response.status = 'ok';
        response.lastBackup = backupState.lastBackup;
        response.backupCount = backupState.backupCount;
    } else {
        response.status = 'starting';
        response.lastBackup = null;
        response.backupCount = 0;
    }

    if (isS3Configured()) {
        response.s3Status = s3State.status || 'pending';
        response.s3LastUpload = s3State.lastUpload;
        response.s3RetryQueue = getRetryQueueSize();
        if (s3State.lastError) {
            response.s3Error = s3State.lastError;
        }
    }

    const httpStatus = response.status === 'degraded' ? 503 : 200;
    return res.status(httpStatus).json(response);
});

try {
    createDatabaseDump()
} catch (error) {
    console.error(`Initial backup failed: ${error.message}`)
}

startCronJobs()

startRetryTimer()


app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`)
})
