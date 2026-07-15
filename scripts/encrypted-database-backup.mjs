import { existsSync } from "node:fs";
import {
  chmod,
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import { config } from "../server/config.js";
import {
  decryptBackupBuffer,
  encryptBackupBuffer,
  validateSqliteBackup,
} from "../server/lib/encryptedBackup.js";

function getArgValue(name) {
  const prefix = `${name}=`;
  const match = process.argv.slice(3).find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : "";
}

function backupTimestamp() {
  return new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
}

async function writePrivateFile(filePath, contents) {
  await mkdir(path.dirname(filePath), { recursive: true, mode: 0o700 });
  await writeFile(filePath, contents, { flag: "wx", mode: 0o600 });
  await chmod(filePath, 0o600);
}

async function verifyEncryptedFile(inputPath, passphrase) {
  const tempDirectory = await mkdtemp(path.join(os.tmpdir(), "firststep-restore-check-"));
  const restoredPath = path.join(tempDirectory, "restored.db");

  try {
    const encrypted = await readFile(inputPath);
    const decrypted = decryptBackupBuffer(encrypted, passphrase);
    await writeFile(restoredPath, decrypted, { mode: 0o600 });
    const result = validateSqliteBackup(restoredPath);

    return {
      ...result,
      encryptedBytes: encrypted.length,
      decryptedBytes: decrypted.length,
    };
  } finally {
    await rm(tempDirectory, { recursive: true, force: true });
  }
}

async function createBackup({ databasePath, outputPath, passphrase }) {
  if (!existsSync(databasePath)) {
    throw new Error(`Database file does not exist: ${databasePath}`);
  }

  const tempDirectory = await mkdtemp(path.join(os.tmpdir(), "firststep-backup-"));
  const plaintextPath = path.join(tempDirectory, "enrollment.db");
  const source = new Database(databasePath, { readonly: true, fileMustExist: true });

  try {
    await source.backup(plaintextPath);
  } finally {
    source.close();
  }

  try {
    validateSqliteBackup(plaintextPath);
    const plaintext = await readFile(plaintextPath);
    const encrypted = encryptBackupBuffer(plaintext, passphrase);
    await writePrivateFile(outputPath, encrypted);
    const verification = await verifyEncryptedFile(outputPath, passphrase);

    return {
      output: outputPath,
      ...verification,
    };
  } catch (error) {
    await rm(outputPath, { force: true });
    throw error;
  } finally {
    await rm(tempDirectory, { recursive: true, force: true });
  }
}

async function restoreBackup({ inputPath, outputPath, passphrase }) {
  if (existsSync(outputPath)) {
    throw new Error(`Refusing to overwrite an existing file: ${outputPath}`);
  }

  const tempDirectory = await mkdtemp(path.join(os.tmpdir(), "firststep-restore-"));
  const candidatePath = path.join(tempDirectory, "candidate.db");

  try {
    const encrypted = await readFile(inputPath);
    const decrypted = decryptBackupBuffer(encrypted, passphrase);
    await writeFile(candidatePath, decrypted, { mode: 0o600 });
    const verification = validateSqliteBackup(candidatePath);
    await mkdir(path.dirname(outputPath), { recursive: true, mode: 0o700 });
    await copyFile(candidatePath, `${outputPath}.tmp`, 1);
    await chmod(`${outputPath}.tmp`, 0o600);
    await rename(`${outputPath}.tmp`, outputPath);

    return {
      output: outputPath,
      ...verification,
      restoredBytes: decrypted.length,
    };
  } catch (error) {
    await rm(`${outputPath}.tmp`, { force: true });
    await rm(outputPath, { force: true });
    throw error;
  } finally {
    await rm(tempDirectory, { recursive: true, force: true });
  }
}

const command = process.argv[2];
const passphrase = process.env.BACKUP_ENCRYPTION_KEY ?? "";
const databasePath = path.resolve(getArgValue("--database") || config.databasePath);
const inputPath = getArgValue("--input") ? path.resolve(getArgValue("--input")) : "";
const outputPath = path.resolve(
  getArgValue("--output") || path.join(process.cwd(), `firststep-enrollment-${backupTimestamp()}.fshabk`)
);

try {
  let result;

  if (command === "create") {
    result = await createBackup({ databasePath, outputPath, passphrase });
  } else if (command === "verify") {
    if (!inputPath) {
      throw new Error("verify requires --input=/path/to/backup.fshabk");
    }
    result = await verifyEncryptedFile(inputPath, passphrase);
  } else if (command === "restore") {
    if (!inputPath || !getArgValue("--output")) {
      throw new Error("restore requires --input=/path/to/backup.fshabk and --output=/safe/new/path.db");
    }
    result = await restoreBackup({ inputPath, outputPath, passphrase });
  } else {
    throw new Error("Usage: encrypted-database-backup.mjs <create|verify|restore> [--input=...] [--output=...] [--database=...]");
  }

  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(`Encrypted backup ${command || "operation"} failed: ${error.message}`);
  process.exitCode = 1;
}
