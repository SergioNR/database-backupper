import { createDatabaseDump } from "../backup.js";

export const startCronJobs = () => {

    createDatabaseDump()
}