import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { createServer } from 'node:http';
import { applyRuntimeSecurity } from '../src/server/runtimeSecurity.ts';

type EnvSnapshot = Record<string, string | undefined>;

function snapshotEnv(keys: string[]): EnvSnapshot {
  return Object.fromEntries(keys.map(key => [key, process.env[key]]));
}

function restoreEnv(snapshot: EnvSnapshot): void {
  for (const [key, value] of Object.entries(snapshot)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

async function withServer(run: (baseUrl: string) => Promise<void>) {
  const app = express();
  applyRuntimeSecurity(app);
  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.post('/api/tokens/create', (_req, res) => res.json({ mutated: true }));
  app.post('/api/automaton/step', (_req, res) => res.json({ mutated: true }));
  app.post('/api/quantum/generate-keypair', (_req, res) => res.json({ privateKey: 'should-not-run' }));
  const server = createServer(app);
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve());
  });
  try {
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('unexpected server address');
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
}

const keys = [
  'NODE_ENV',
  'APP_URL',
  'RDL_CORS_ALLOWED_ORIGINS',
  'RDL_ENABLE_SIMULATION_API',
  'RDL_ADMIN_TOKEN',
  'RDL_API_REQUESTS_PER_MINUTE',
  'RDL_MAX_JSON_BODY_KB'
];

test('production defaults to read-only simulation mutations', async () => {
  const env = snapshotEnv(keys);
  try {
    process.env.NODE_ENV = 'production';
    delete process.env.RDL_ENABLE_SIMULATION_API;
    delete process.env.RDL_CORS_ALLOWED_ORIGINS;
    delete process.env.APP_URL;

    await withServer(async baseUrl => {
      const response = await fetch(`${baseUrl}/api/tokens/create`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{}'
      });
      assert.equal(response.status, 503);
      const body = await response.json() as { mode?: string };
      assert.equal(body.mode, 'READ_ONLY_PRODUCTION_PREVIEW');
    });
  } finally {
    restoreEnv(env);
  }
});

test('protected production paths cannot bypass controls with a trailing slash', async () => {
  const env = snapshotEnv(keys);
  try {
    process.env.NODE_ENV = 'production';
    delete process.env.RDL_ENABLE_SIMULATION_API;
    await withServer(async baseUrl => {
      for (const path of ['/api/tokens/create/', '/api/automaton/step/']) {
        const response = await fetch(`${baseUrl}${path}`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: '{}'
        });
        assert.equal(response.status, 503);
      }
    });
  } finally {
    restoreEnv(env);
  }
});

test('server-side private-key generation is blocked in production', async () => {
  const env = snapshotEnv(keys);
  try {
    process.env.NODE_ENV = 'production';
    await withServer(async baseUrl => {
      const response = await fetch(`${baseUrl}/api/quantum/generate-keypair`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{}'
      });
      assert.equal(response.status, 403);
    });
  } finally {
    restoreEnv(env);
  }
});

test('untrusted browser origins are rejected in production', async () => {
  const env = snapshotEnv(keys);
  try {
    process.env.NODE_ENV = 'production';
    process.env.APP_URL = 'https://rdl.example';
    await withServer(async baseUrl => {
      const denied = await fetch(`${baseUrl}/api/health`, {
        headers: { origin: 'https://attacker.example' }
      });
      assert.equal(denied.status, 403);

      const allowed = await fetch(`${baseUrl}/api/health`, {
        headers: { origin: 'https://rdl.example' }
      });
      assert.equal(allowed.status, 200);
      assert.equal(allowed.headers.get('access-control-allow-origin'), 'https://rdl.example');
    });
  } finally {
    restoreEnv(env);
  }
});

test('production simulation mode rejects weak or placeholder admin tokens', () => {
  const env = snapshotEnv(keys);
  try {
    process.env.NODE_ENV = 'production';
    process.env.RDL_ENABLE_SIMULATION_API = 'true';
    process.env.RDL_ADMIN_TOKEN = 'CHANGE_ME_WITH_A_RANDOM_32_PLUS_CHAR_SECRET';
    assert.throws(() => applyRuntimeSecurity(express()), /non-placeholder secret/);

    process.env.RDL_ADMIN_TOKEN = 'short';
    assert.throws(() => applyRuntimeSecurity(express()), /non-placeholder secret/);
  } finally {
    restoreEnv(env);
  }
});
