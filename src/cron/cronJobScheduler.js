import { initPresetJobs } from "./jobs/backupJobs.js";

export const startCronJobs = () => {
    const activeJobs = initPresetJobs();

    if (activeJobs.length === 0) {
        console.warn('No backup schedules configured. Set at least one of: BACKUP_EVERY_2H, BACKUP_EVERY_8H, BACKUP_EVERY_24H, BACKUP_WEEKLY to true');
        return;
    }

    const labels = activeJobs.map(j => j.label);
    console.log(`Active schedules: ${labels.join(', ')}`);

    for (const { job } of activeJobs) {
        job.start();
    }
}
