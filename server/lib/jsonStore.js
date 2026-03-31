import { promises as fs } from "node:fs";
import path from "node:path";

const EMPTY_COLLECTION = "[]";

export class StoreIntegrityError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "StoreIntegrityError";
    this.details = details;
  }
}

export class JsonStore {
  constructor(filePath) {
    this.filePath = filePath;
    this.writeQueue = Promise.resolve();
  }

  async ensureFile() {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });

    try {
      await fs.access(this.filePath);
    } catch {
      await fs.writeFile(this.filePath, EMPTY_COLLECTION, "utf8");
    }
  }

  async readAll() {
    await this.ensureFile();
    const content = await fs.readFile(this.filePath, "utf8");

    if (!content.trim()) {
      return [];
    }

    try {
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      const corruptPath = `${this.filePath}.corrupt-${Date.now()}`;
      await fs.rename(this.filePath, corruptPath);
      throw new StoreIntegrityError("Stored submission data is corrupted.", { corruptPath });
    }
  }

  async insert(record) {
    return this.enqueueWrite(async () => {
      const records = await this.readAll();
      records.push(record);
      await fs.writeFile(this.filePath, JSON.stringify(records, null, 2), "utf8");
      return record;
    });
  }

  async list({ page = 1, pageSize = 20 } = {}) {
    const records = await this.readAll();
    const ordered = [...records].sort((a, b) => {
      const aDate = new Date(a.createdAt ?? 0).getTime();
      const bDate = new Date(b.createdAt ?? 0).getTime();
      return bDate - aDate;
    });
    const total = ordered.length;
    const offset = (page - 1) * pageSize;
    const items = ordered.slice(offset, offset + pageSize);

    return {
      items,
      page,
      pageSize,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
    };
  }

  enqueueWrite(task) {
    this.writeQueue = this.writeQueue.then(task, task);
    return this.writeQueue;
  }
}
