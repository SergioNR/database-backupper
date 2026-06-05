import { execSync } from 'node:child_process'
import path from 'node:path'

export function createDatabaseDump({ host, port, user, password, database, requestId }) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const outputPath = path.join('/tmp', `backup_${requestId}_${timestamp}.sql`)

  const backupCommand = `PGPASSWORD="${password}" /usr/bin/pg_dump -h ${host} -p ${port} -U ${user} -w -F c -b -v -f "${outputPath}" ${database}`

  execSync(backupCommand, { stdio: 'pipe' })
  console.log(`Database dump created successfully at ${outputPath}`)

  return outputPath
}
