import { createDatabaseBackupJob } from "./jobs/createDatabaseDumpJob.js";

export const startCronJobs = () => {

    createDatabaseBackupJob()
}