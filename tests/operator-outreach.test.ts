import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { OutreachStore } from '../services/operator-outreach/store.ts';
import { OutreachEngine } from '../services/operator-outreach/engine.ts';
import type { OperatorContact } from '../services/operator-outreach/types.ts';

function contact(id: string, overrides: Partial<OperatorContact> = {}): OperatorContact {
  const now = new Date().toISOString();
  return {
    id,
    name: 'Example Operator',
    email: 'operator@example.invalid',
    stage: 'prospect',
    consent: true,
    source: 'test',
    tags: [],
    createdAt: now,
    updatedAt: now,
    ...overrides
  };
}

test('opt-out response marks contact do-not-contact', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'pq-rdl-outreach-'));
  const store = new OutreachStore(path.join(dir, 'db.json'));
  const original = contact('operator-1');
  await store.upsertOperator(original);
  const updated = await new OutreachEngine(store).recordResponse(original.id, 'Please unsubscribe me.');
  assert.equal(updated.stage, 'do-not-contact');
  assert.equal(updated.consent, false);
});

test('decline is not misclassified as interested', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'pq-rdl-outreach-'));
  const store = new OutreachStore(path.join(dir, 'db.json'));
  const original = contact('operator-decline');
  await store.upsertOperator(original);
  const updated = await new OutreachEngine(store).recordResponse(original.id, 'Thanks, but I am not interested.');
  assert.equal(updated.stage, 'declined');
});

test('invite is skipped without consent', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'pq-rdl-outreach-'));
  const store = new OutreachStore(path.join(dir, 'db.json'));
  const original = contact('operator-2', { consent: false });
  await store.upsertOperator(original);
  const events = await new OutreachEngine(store).invite(original);
  assert.equal(events[0]?.status, 'skipped');
});

test('invite does not advance stage when there is no enabled delivery channel', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'pq-rdl-outreach-'));
  const store = new OutreachStore(path.join(dir, 'db.json'));
  const original = contact('operator-3', { email: undefined });
  await store.upsertOperator(original);
  const events = await new OutreachEngine(store).invite(original);
  assert.equal(events[0]?.status, 'skipped');
  const saved = (await store.load()).operators.find(x => x.id === original.id);
  assert.equal(saved?.stage, 'prospect');
});
