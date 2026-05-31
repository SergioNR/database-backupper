import express from 'express'
import { createDatabaseDump, backupState } from './backup.js';
import { startCronJobs } from './cron/cronJobScheduler.js';


const app = express();

app.get('/health', (req, res) => {
    if (backupState.lastStatus === 'failed') {
        return res.status(503).json({
            status: 'degraded',
            lastBackup: backupState.lastBackup,
            lastError: backupState.lastError,
            backupCount: backupState.backupCount
        });
    }

    if (backupState.lastStatus === 'success') {
        return res.status(200).json({
            status: 'ok',
            lastBackup: backupState.lastBackup,
            backupCount: backupState.backupCount
        });
    }

    return res.status(200).json({
        status: 'starting',
        lastBackup: null,
        backupCount: 0
    });
});

try {
    createDatabaseDump()
} catch (error) {
    console.error(`Initial backup failed: ${error.message}`)
}

startCronJobs()


app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`)
})
