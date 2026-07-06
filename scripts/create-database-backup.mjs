import { existsSync } from "node:fs";
import path from "node:path";
import { config } from "../server/config.js";
import { EnrollmentDatabase } from "../server/lib/enrollmentDb.js";

function getArgValue(name) {
  const prefix = `${name}=`;
  const match = process.argv.slice(2).find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : "";
}

const databasePath = path.resolve(getArgValue("--database") || config.databasePath);
const backupDirectory = getArgValue("--directory")
  ? path.resolve(getArgValue("--directory"))
  : path.join(path.dirname(databasePath), "backups");

if (!existsSync(databasePath)) {
  console.error(`Database file does not exist: ${databasePath}`);
  process.exit(1);
}

const enrollmentDb = new EnrollmentDatabase(databasePath);

try {
  const backup = await enrollmentDb.createBackup({ directory: backupDirectory });
  console.log(JSON.stringify({
    filename: backup.filename,
    path: backup.path,
    createdAt: backup.createdAt,
  }, null, 2));
} finally {
  enrollmentDb.close();
}
