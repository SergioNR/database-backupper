import { execSync } from 'node:child_process'
import path from 'node:path'

export const createDatabaseDump = () => {

    if (!process.env.DB_HOST || !process.env.DB_PORT || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DATABASE) {
    throw new Error(' error: host, port, user, password, and database are required');
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputPath = path.join('/tmp', `backup_${timestamp}.sql`);

  const backupCommand = `PGPASSWORD="${process.env.DB_PASSWORD}" /usr/bin/pg_dump -h ${process.env.DB_HOST} -p ${process.env.DB_PORT} -U ${process.env.DB_USER} -w -F c -b -v -f "${outputPath}" ${process.env.DATABASE}`;

  try {
    execSync(backupCommand, { stdio: 'pipe' });
    console.log(`Database dump created successfully at ${outputPath}`);
  } catch (error) {
    console.error(`Error creating database dump: ${error.message}`);
    throw error;
  }

};
