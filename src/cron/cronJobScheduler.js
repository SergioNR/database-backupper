import { initDatabaseBackupJob, createDatabaseBackupJob } from "./jobs/createDatabaseDumpJob.js";

export const startCronJobs = () => {
    initDatabaseBackupJob();

    if (createDatabaseBackupJob) {
        createDatabaseBackupJob.start();
    }
}
