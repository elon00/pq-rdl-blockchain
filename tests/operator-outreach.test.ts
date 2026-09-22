import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { OutreachStore } from '../services/operator-outreach/store.ts';
import { OutreachEngine } from '../services/operator-outreach/engine.ts';
import { invitation } from '../services/operator-outreach/templates.ts';
import { getInboundToken } from '../services/operator-outreach/config.ts';
import type { OperatorContact, OutreachEvent } from '../services/operator-outreach/types.ts';

async function testStore(t: test.TestContext, name = 'db.json') {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'pq-rdl-outreach-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  return new OutreachStore(path.join(dir, name));
}

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

test('opt-out response marks contact do-not-contact', async t => {
  const store = await testStore(t);
  const original = contact('operator-1');
  await store.upsertOperator(original);
  const updated = await new OutreachEngine(store).recordResponse(original.id, 'Please unsubscribe me.');
  assert.equal(updated.stage, 'do-not-contact');
  assert.equal(updated.consent, false);
});

test('decline is not misclassified as interested', async t => {
  const store = await testStore(t);
  const original = contact('operator-decline');
  await store.upsertOperator(original);
  const updated = await new OutreachEngine(store).recordResponse(original.id, 'Thanks, but I am not interested.');
  assert.equal(updated.stage, 'declined');
});

test('unrelated words do not mutate response state', async t => {
  const store = await testStore(t);
  const original = contact('operator-words');
  await store.upsertOperator(original);
  const updated = await new OutreachEngine(store).recordResponse(original.id, 'I checked a stopwatch yesterday.');
  assert.equal(updated.stage, 'prospect');
  assert.equal(updated.consent, true);
});

test('invite is skipped without consent', async t => {
  const store = await testStore(t);
  const original = contact('operator-2', { consent: false });
  await store.upsertOperator(original);
  const events = await new OutreachEngine(store).invite(original);
  assert.equal(events[0]?.status, 'skipped');
});

test('dry-run invitation never advances contact state', async t => {
  const store = await testStore(t);
  const original = contact('operator-dry-run');
  await store.upsertOperator(original);
  const events = await new OutreachEngine(store).invite(original);
  assert.equal(events[0]?.status, 'dry-run');
  const saved = (await store.load()).operators.find(x => x.id === original.id);
  assert.equal(saved?.stage, 'prospect');
  assert.equal(saved?.lastContactAt, undefined);
});

test('invite does not advance stage when there is no enabled delivery channel', async t => {
  const store = await testStore(t);
  const original = contact('operator-3', { email: undefined });
  await store.upsertOperator(original);
  const events = await new OutreachEngine(store).invite(original);
  assert.equal(events[0]?.status, 'skipped');
  const saved = (await store.load()).operators.find(x => x.id === original.id);
  assert.equal(saved?.stage, 'prospect');
});

test('invalid contact timestamp fails closed', async t => {
  const store = await testStore(t);
  const original = contact('operator-corrupt-time', { lastContactAt: 'not-a-date' });
  await store.upsertOperator(original);
  const events = await new OutreachEngine(store).invite(original);
  assert.equal(events[0]?.status, 'skipped');
  assert.equal(events[0]?.body, 'invalid lastContactAt');
});

test('operator display names are sanitized before templating', () => {
  const rendered = invitation(contact('operator-name', { name: 'Alice\r\nBcc: attacker@example.com' }));
  assert.equal(rendered.body.includes('\r'), false);
  assert.equal(rendered.body.includes('\nBcc:'), false);
  assert.match(rendered.body, /Hi Alice Bcc: attacker@example\.com,/);
});

test('concurrent event mutations are not lost', async t => {
  const store = await testStore(t);
  const statePath = (store as any).filePath as string;
  const secondStore = new OutreachStore(statePath);
  const now = new Date().toISOString();

  const makeEvent = (i: number): OutreachEvent => ({
    id: `event-${i}`,
    operatorId: 'operator-concurrent',
    channel: 'email',
    kind: 'invite',
    status: 'queued',
    body: `event ${i}`,
    createdAt: now
  });

  await Promise.all(Array.from({ length: 20 }, (_, i) => (i % 2 ? store : secondStore).appendEvent(makeEvent(i))));
  const state = await store.load();
  assert.equal(state.events.length, 20);
  assert.equal(new Set(state.events.map(x => x.id)).size, 20);
});

test('inbound token rejects missing, short, and placeholder secrets', () => {
  const previous = process.env.OPERATOR_INBOUND_TOKEN;
  try {
    delete process.env.OPERATOR_INBOUND_TOKEN;
    assert.throws(() => getInboundToken(), /at least 32 characters/);
    process.env.OPERATOR_INBOUND_TOKEN = 'CHANGE_ME_LONG_RANDOM_SECRET_123456';
    assert.throws(() => getInboundToken(), /non-placeholder/);
    process.env.OPERATOR_INBOUND_TOKEN = '0123456789abcdef0123456789abcdef';
    assert.equal(getInboundToken().length, 32);
  } finally {
    if (previous === undefined) delete process.env.OPERATOR_INBOUND_TOKEN;
    else process.env.OPERATOR_INBOUND_TOKEN = previous;
  }
});
