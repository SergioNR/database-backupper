import { execSync } from 'node:child_process'
import path from 'node:path'
import fs from 'node:fs'
import { uploadToS3, isS3Configured } from './s3.js'

export const backupState = {
  lastBackup: null,
  lastStatus: null,
  lastError: null,
  backupCount: 0
}

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

    backupState.lastBackup = new Date().toISOString();
    backupState.lastStatus = 'success';
    backupState.lastError = null;
    backupState.backupCount++;

    if (isS3Configured()) {
      try {
        uploadToS3(outputPath);
      } catch (error) {
        console.error(`S3 upload error: ${error.message}`);
      }
    }

    rotateBackups();
  } catch (error) {
    console.error(`Error creating database dump: ${error.message}`);

    backupState.lastBackup = new Date().toISOString();
    backupState.lastStatus = 'failed';
    backupState.lastError = error.message;

    throw error;
  }

};

function rotateBackups() {
  const maxBackups = parseInt(process.env.MAX_BACKUPS, 10);
  if (!maxBackups || maxBackups <= 0) return;

  const tmpDir = '/tmp';
  const files = fs.readdirSync(tmpDir)
    .filter(f => f.startsWith('backup_') && f.endsWith('.sql'))
    .sort();

  while (files.length > maxBackups) {
    const toDelete = files.shift();
    fs.unlinkSync(path.join(tmpDir, toDelete));
    console.log(`Rotated backup: deleted ${toDelete}`);
  }
}
