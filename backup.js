import { exec } from 'node:child_process'
import path from 'node:path'
import fs from 'node:fs'

export const createDatabaseDump = async () => {

    if (!process.env.DB_HOST || !process.env.DB_PORT || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DATABASE) {
    throw new Error(' error: host, port, user, password, and database are required');
  }
  // Create output file name with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputPath = path.join('.', `backup_${timestamp}.sql`);

  const backupCommand = `/opt/homebrew/opt/postgresql@17/bin/pg_dump -h ${process.env.DB_HOST} -p ${process.env.DB_PORT} -U ${process.env.DB_USER} -F c -b -v -f "${outputPath}" ${process.env.DATABASE}`;

      
  exec(backupCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error creating database dump: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`pg_dump stderr: ${stderr}`);
      return;
    }
    console.log(`Database dump created successfully at ${outputPath}`);
  })

};


