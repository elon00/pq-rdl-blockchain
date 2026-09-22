#!/usr/bin/env node
import { randomUUID } from 'node:crypto';
import { OutreachEngine } from './engine.ts';
import { OutreachStore } from './store.ts';
import type { OperatorContact } from './types.ts';

const [command, ...args] = process.argv.slice(2);
const store = new OutreachStore();
const engine = new OutreachEngine(store);

function usage(): never {
  console.error(`Usage:
  npm run operator:add -- --name "Alice" --email alice@example.com --source conference --consent
  npm run operator:list
  npm run operator:invite -- <operator-id>
  npm run operator:brief -- <operator-id>
  npm run operator:followup -- <operator-id>
  npm run operator:response -- <operator-id> "response text"

Outreach is dry-run unless OPERATOR_EMAIL_WEBHOOK_URL / OPERATOR_VOICE_WEBHOOK_URL are configured.`);
  process.exit(2);
}

function flag(name: string): string | undefined {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}

async function getOperator(id: string) {
  const state = await store.load();
  const op = state.operators.find(x => x.id === id);
  if (!op) throw new Error(`operator not found: ${id}`);
  return op;
}

if (!command) usage();

if (command === 'add') {
  const now = new Date().toISOString();
  const name = flag('--name');
  const source = flag('--source');
  if (!name || !source) throw new Error('--name and --source are required');
  const op: OperatorContact = {
    id: randomUUID(),
    name,
    organization: flag('--org'),
    email: flag('--email'),
    phone: flag('--phone'),
    telegram: flag('--telegram'),
    timezone: flag('--timezone'),
    stage: 'prospect',
    consent: args.includes('--consent'),
    source,
    tags: (flag('--tags') || '').split(',').map(x => x.trim()).filter(Boolean),
    createdAt: now,
    updatedAt: now
  };
  await store.upsertOperator(op);
  console.log(JSON.stringify(op, null, 2));
} else if (command === 'list') {
  console.log(JSON.stringify((await store.load()).operators, null, 2));
} else if (command === 'invite') {
  console.log(JSON.stringify(await engine.invite(await getOperator(args[0])), null, 2));
} else if (command === 'brief') {
  console.log(JSON.stringify(await engine.brief(await getOperator(args[0])), null, 2));
} else if (command === 'followup') {
  console.log(JSON.stringify(await engine.followUp(await getOperator(args[0])), null, 2));
} else if (command === 'response') {
  console.log(JSON.stringify(await engine.recordResponse(args[0], args.slice(1).join(' ')), null, 2));
} else {
  usage();
}
