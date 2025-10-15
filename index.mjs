import  express from 'express'
import { createDatabaseDump } from './backup.js';
import { startCronJobs } from './cron/cronJobScheduler.js';


const app = express();


createDatabaseDump()

// startCronJobs()


app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`)
})