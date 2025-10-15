import { CronJob } from "cron";
import { createDatabaseDump } from "../../backup";


export const createDatabaseDumpScheduler = () => {

} 

export const markAnalysisEntriesAsCancelledScheduler = new CronJob(
    '0 * * * *',
    async () => {
        try {
        await createDatabaseDump()
    } catch (error) {
      logError('Error in the database dump cronjob', error);
    }
  },
);