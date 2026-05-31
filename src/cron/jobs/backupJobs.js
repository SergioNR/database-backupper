import { CronJob } from "cron";
import { createDatabaseDump } from "../../backup.js";

export const PRESETS = [
  { envVar: 'BACKUP_EVERY_2H', cronExpression: '0 */2 * * *', label: 'every-2h' },
  { envVar: 'BACKUP_EVERY_8H', cronExpression: '0 */8 * * *', label: 'every-8h' },
  { envVar: 'BACKUP_EVERY_24H', cronExpression: '0 2 * * *', label: 'every-24h' },
  { envVar: 'BACKUP_WEEKLY', cronExpression: '0 2 * * 0', label: 'weekly' },
];

export function createBackupJob(cronExpression, label) {
  return new CronJob(
    cronExpression,
    async () => {
      try {
        await createDatabaseDump();
      } catch (error) {
        console.error(`[${label}] Error in backup job:`, error.message);
      }
    },
  );
}

export function initPresetJobs() {
  const jobs = [];

  for (const preset of PRESETS) {
    if (process.env[preset.envVar] === 'true') {
      jobs.push({
        job: createBackupJob(preset.cronExpression, preset.label),
        label: preset.label,
      });
    }
  }

  return jobs;
}
