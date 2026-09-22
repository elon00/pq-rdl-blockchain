import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { OperatorContact, OutreachEvent, OutreachState } from './types.ts';

const LOCK_WAIT_MS = 25;
const LOCK_TIMEOUT_MS = 5_000;
const LOCK_STALE_MS = 30_000;

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class OutreachStore {
  constructor(private readonly filePath = process.env.OPERATOR_OUTREACH_DB || 'data/operator-outreach.json') {}

  private async loadUnlocked(): Promise<OutreachState> {
    try {
      return JSON.parse(await fs.readFile(this.filePath, 'utf8')) as OutreachState;
    } catch (error: any) {
      if (error?.code !== 'ENOENT') throw error;
      return { operators: [], events: [] };
    }
  }

  async load(): Promise<OutreachState> {
    return this.loadUnlocked();
  }

  private async saveUnlocked(state: OutreachState): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    const tmp = `${this.filePath}.${process.pid}.${randomUUID()}.tmp`;
    try {
      await fs.writeFile(tmp, JSON.stringify(state, null, 2) + '\n', { mode: 0o600 });
      await fs.rename(tmp, this.filePath);
    } finally {
      await fs.rm(tmp, { force: true }).catch(() => undefined);
    }
  }

  async save(state: OutreachState): Promise<void> {
    await this.withLock(() => this.saveUnlocked(state));
  }

  private async withLock<T>(operation: () => Promise<T>): Promise<T> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    const lockPath = `${this.filePath}.lock`;
    const deadline = Date.now() + LOCK_TIMEOUT_MS;

    while (true) {
      try {
        const handle = await fs.open(lockPath, 'wx', 0o600);
        try {
          return await operation();
        } finally {
          await handle.close();
          await fs.rm(lockPath, { force: true });
        }
      } catch (error: any) {
        if (error?.code !== 'EEXIST') throw error;

        try {
          const stat = await fs.stat(lockPath);
          if (Date.now() - stat.mtimeMs > LOCK_STALE_MS) {
            await fs.rm(lockPath, { force: true });
            continue;
          }
        } catch (statError: any) {
          if (statError?.code === 'ENOENT') continue;
          throw statError;
        }

        if (Date.now() >= deadline) {
          throw new Error(`operator outreach store lock timeout: ${lockPath}`);
        }
        await sleep(LOCK_WAIT_MS);
      }
    }
  }

  async upsertOperator(operator: OperatorContact): Promise<void> {
    await this.withLock(async () => {
      const state = await this.loadUnlocked();
      const index = state.operators.findIndex(x => x.id === operator.id);
      if (index >= 0) state.operators[index] = operator;
      else state.operators.push(operator);
      await this.saveUnlocked(state);
    });
  }

  async appendEvent(event: OutreachEvent): Promise<void> {
    await this.withLock(async () => {
      const state = await this.loadUnlocked();
      state.events.push(event);
      await this.saveUnlocked(state);
    });
  }
}
