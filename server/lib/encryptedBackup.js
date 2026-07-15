import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from "node:crypto";
import { gunzipSync, gzipSync } from "node:zlib";
import Database from "better-sqlite3";

const MAGIC = Buffer.from("FSHABK01", "ascii");
const SALT_BYTES = 16;
const IV_BYTES = 12;
const AUTH_TAG_BYTES = 16;
const MINIMUM_PASSPHRASE_BYTES = 32;
const REQUIRED_TABLES = ["cohorts", "enrollments", "programs"];

function deriveKey(passphrase, salt) {
  if (typeof passphrase !== "string" || Buffer.byteLength(passphrase) < MINIMUM_PASSPHRASE_BYTES) {
    throw new Error("BACKUP_ENCRYPTION_KEY must contain at least 32 bytes.");
  }

  return scryptSync(passphrase, salt, 32);
}

export function encryptBackupBuffer(databaseBuffer, passphrase) {
  if (!Buffer.isBuffer(databaseBuffer) || databaseBuffer.length === 0) {
    throw new Error("Cannot encrypt an empty database backup.");
  }

  const salt = randomBytes(SALT_BYTES);
  const iv = randomBytes(IV_BYTES);
  const key = deriveKey(passphrase, salt);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const compressed = gzipSync(databaseBuffer, { level: 9 });
  const ciphertext = Buffer.concat([cipher.update(compressed), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([MAGIC, salt, iv, authTag, ciphertext]);
}

export function decryptBackupBuffer(encryptedBuffer, passphrase) {
  const headerBytes = MAGIC.length + SALT_BYTES + IV_BYTES + AUTH_TAG_BYTES;

  if (!Buffer.isBuffer(encryptedBuffer) || encryptedBuffer.length <= headerBytes) {
    throw new Error("Encrypted backup is missing or truncated.");
  }

  if (!encryptedBuffer.subarray(0, MAGIC.length).equals(MAGIC)) {
    throw new Error("Encrypted backup has an unsupported file format.");
  }

  let offset = MAGIC.length;
  const salt = encryptedBuffer.subarray(offset, offset + SALT_BYTES);
  offset += SALT_BYTES;
  const iv = encryptedBuffer.subarray(offset, offset + IV_BYTES);
  offset += IV_BYTES;
  const authTag = encryptedBuffer.subarray(offset, offset + AUTH_TAG_BYTES);
  offset += AUTH_TAG_BYTES;
  const ciphertext = encryptedBuffer.subarray(offset);
  const key = deriveKey(passphrase, salt);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  const compressed = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return gunzipSync(compressed);
}

export function validateSqliteBackup(databasePath) {
  const database = new Database(databasePath, {
    readonly: true,
    fileMustExist: true,
  });

  try {
    const integrity = database.pragma("integrity_check", { simple: true });

    if (integrity !== "ok") {
      throw new Error(`SQLite integrity check failed: ${integrity}`);
    }

    const tables = new Set(
      database
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
        .all()
        .map((row) => row.name)
    );
    const missingTables = REQUIRED_TABLES.filter((table) => !tables.has(table));

    if (missingTables.length > 0) {
      throw new Error(`SQLite backup is missing required tables: ${missingTables.join(", ")}`);
    }

    return {
      integrity,
      requiredTables: [...REQUIRED_TABLES],
    };
  } finally {
    database.close();
  }
}
