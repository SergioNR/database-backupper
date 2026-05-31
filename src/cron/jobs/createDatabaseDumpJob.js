import { CronJob } from "cron";
import { createDatabaseDump } from "../../backup.js";

// Every minute:  * * * * *  — runs every minute.
// Every 5 minutes:  */5 * * * *  — runs every 5 minutes.
// Every 10 minutes:  */10 * * * *  — runs every 10 minutes.
// Every 15 minutes:  */15 * * * *  — runs every 15 minutes.
// Every 30 minutes:  */30 * * * *  — runs every 30 minutes.
// Every hour:  0 * * * *  — runs at the top of every hour.
// Every 2 hours:  0 */2 * * *  — runs every 2 hours.
// Every 6 hours:  0 */6 * * *  — runs every 6 hours.
// Every day at midnight:  0 0 * * *  — runs once daily at midnight.
// Every day at a specific time, such as 7 AM:  0 7 * * * .

export let createDatabaseBackupJob = null;

export function initDatabaseBackupJob() {
  if (!process.env.BACKUP_FREQUENCY) {
    console.warn('BACKUP_FREQUENCY not set — recurring backups disabled');
    return;
  }

  createDatabaseBackupJob = new CronJob(
    process.env.BACKUP_FREQUENCY,
    async () => {
      try {
        await createDatabaseDump();
      } catch (error) {
        console.error('Error in the database dump cronjob', error);
      }
    },
  );
}
