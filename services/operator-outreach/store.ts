import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { OperatorContact, OutreachEvent, OutreachState } from './types.ts';

const DEFAULT_PATH = process.env.OPERATOR_OUTREACH_DB || 'data/operator-outreach.json';

export class OutreachStore {
  constructor(private readonly filePath = DEFAULT_PATH) {}

  async load(): Promise<OutreachState> {
    try {
      return JSON.parse(await fs.readFile(this.filePath, 'utf8')) as OutreachState;
    } catch (error: any) {
      if (error?.code !== 'ENOENT') throw error;
      return { operators: [], events: [] };
    }
  }

  async save(state: OutreachState): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    const tmp = `${this.filePath}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(state, null, 2) + '\n', { mode: 0o600 });
    await fs.rename(tmp, this.filePath);
  }

  async upsertOperator(operator: OperatorContact): Promise<void> {
    const state = await this.load();
    const index = state.operators.findIndex(x => x.id === operator.id);
    if (index >= 0) state.operators[index] = operator;
    else state.operators.push(operator);
    await this.save(state);
  }

  async appendEvent(event: OutreachEvent): Promise<void> {
    const state = await this.load();
    state.events.push(event);
    await this.save(state);
  }
}
