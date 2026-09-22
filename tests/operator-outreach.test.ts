import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { OutreachStore } from '../services/operator-outreach/store.ts';
import { OutreachEngine } from '../services/operator-outreach/engine.ts';
import type { OperatorContact } from '../services/operator-outreach/types.ts';

test('opt-out response marks contact do-not-contact', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'pq-rdl-outreach-'));
  const store = new OutreachStore(path.join(dir, 'db.json'));
  const now = new Date().toISOString();
  const contact: OperatorContact = {
    id: 'operator-1',
    name: 'Example Operator',
    email: 'operator@example.invalid',
    stage: 'prospect',
    consent: true,
    source: 'test',
    tags: [],
    createdAt: now,
    updatedAt: now
  };
  await store.upsertOperator(contact);
  const engine = new OutreachEngine(store);
  const updated = await engine.recordResponse(contact.id, 'Please unsubscribe me.');
  assert.equal(updated.stage, 'do-not-contact');
  assert.equal(updated.consent, false);
});

test('invite is skipped without consent', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'pq-rdl-outreach-'));
  const store = new OutreachStore(path.join(dir, 'db.json'));
  const now = new Date().toISOString();
  const contact: OperatorContact = {
    id: 'operator-2',
    name: 'No Consent',
    email: 'operator@example.invalid',
    stage: 'prospect',
    consent: false,
    source: 'test',
    tags: [],
    createdAt: now,
    updatedAt: now
  };
  await store.upsertOperator(contact);
  const events = await new OutreachEngine(store).invite(contact);
  assert.equal(events[0]?.status, 'skipped');
});
