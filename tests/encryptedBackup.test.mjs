import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { EnrollmentDatabase } from "../server/lib/enrollmentDb.js";
import {
  decryptBackupBuffer,
  encryptBackupBuffer,
  validateSqliteBackup,
} from "../server/lib/encryptedBackup.js";

test("database backups encrypt, authenticate, decrypt, and pass SQLite recovery checks", async () => {
  const tempDirectory = await mkdtemp(path.join(os.tmpdir(), "firststep-encrypted-backup-test-"));
  const databasePath = path.join(tempDirectory, "enrollment.db");
  const restoredPath = path.join(tempDirectory, "restored.db");
  const passphrase = "test-backup-passphrase-with-at-least-32-bytes";
  const database = new EnrollmentDatabase(databasePath);
  database.close();

  try {
    const source = await import("node:fs/promises").then(({ readFile }) => readFile(databasePath));
    const encrypted = encryptBackupBuffer(source, passphrase);
    assert.notDeepEqual(encrypted.subarray(0, 16), source.subarray(0, 16));

    const decrypted = decryptBackupBuffer(encrypted, passphrase);
    await writeFile(restoredPath, decrypted, { mode: 0o600 });
    assert.equal(validateSqliteBackup(restoredPath).integrity, "ok");

    const tampered = Buffer.from(encrypted);
    tampered[tampered.length - 1] ^= 1;
    assert.throws(() => decryptBackupBuffer(tampered, passphrase));
    assert.throws(() => decryptBackupBuffer(encrypted, `${passphrase}-wrong`));
  } finally {
    await rm(tempDirectory, { recursive: true, force: true });
  }
});
