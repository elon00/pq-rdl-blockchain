import express, { type Express, type NextFunction, type Request, type Response } from 'express';
import { timingSafeEqual } from 'node:crypto';

const PROTECTED_POSTS = new Set([
  '/api/blockchain/mine',
  '/api/blockchain/deploy-contract',
  '/api/tokens/create',
  '/api/tokens/transfer',
  '/api/tokens/mint',
  '/api/faucet/dispense',
  '/api/gemini/smart-contract-copilot',
  '/api/automaton/step'
]);

const SERVER_KEYGEN_PATH = '/api/quantum/generate-keypair';

function secureTokenEquals(header: string | undefined, token: string): boolean {
  const expected = Buffer.from(`Bearer ${token}`);
  const actual = Buffer.from(header || '');
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function allowedOrigins(): Set<string> {
  const configured = (process.env.RDL_CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map(x => x.trim())
    .filter(Boolean);
  if (process.env.APP_URL?.trim()) configured.push(process.env.APP_URL.trim());
  return new Set(configured);
}

function positiveInt(raw: string | undefined, fallback: number, min: number, max: number): number {
  const value = Number(raw);
  return Number.isInteger(value) && value >= min && value <= max ? value : fallback;
}

export function applyRuntimeSecurity(app: Express): void {
  const production = process.env.NODE_ENV === 'production';
  const simulationEnabled = process.env.RDL_ENABLE_SIMULATION_API === 'true';
  const adminToken = process.env.RDL_ADMIN_TOKEN?.trim() || '';
  const origins = allowedOrigins();
  const maxBodyKb = positiveInt(process.env.RDL_MAX_JSON_BODY_KB, 256, 16, 1024);
  const requestsPerMinute = positiveInt(process.env.RDL_API_REQUESTS_PER_MINUTE, 120, 10, 10_000);

  if (
    production &&
    simulationEnabled &&
    (adminToken.length < 32 || /^change[_-]?me/i.test(adminToken))
  ) {
    throw new Error('RDL_ADMIN_TOKEN must be a non-placeholder secret of at least 32 characters when production simulation APIs are enabled');
  }

  app.disable('x-powered-by');
  app.use(express.json({ limit: `${maxBodyKb}kb` }));

  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    const origin = req.headers.origin;
    if (origin) {
      if (origins.has(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
        res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      } else if (production) {
        return res.status(403).json({ error: 'origin not allowed' });
      }
    }
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });

  const buckets = new Map<string, { startedAt: number; count: number }>();
  let lastBucketSweep = 0;
  app.use('/api', (req, res, next) => {
    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || 'unknown';

    if (now - lastBucketSweep >= 60_000) {
      for (const [entryKey, entry] of buckets) {
        if (now - entry.startedAt >= 120_000) buckets.delete(entryKey);
      }
      lastBucketSweep = now;
    }

    let bucket = buckets.get(key);
    if (!bucket) {
      if (buckets.size >= 10_000) {
        return res.status(429).json({ error: 'rate-limit capacity reached; retry later' });
      }
      bucket = { startedAt: now, count: 0 };
      buckets.set(key, bucket);
    } else if (now - bucket.startedAt >= 60_000) {
      bucket = { startedAt: now, count: 0 };
      buckets.set(key, bucket);
    }

    bucket.count += 1;
    if (bucket.count > requestsPerMinute) {
      return res.status(429).json({ error: 'rate limit exceeded' });
    }
    next();
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (!production || req.method !== 'POST') return next();

    const path = req.path.replace(/\/+$/, '') || '/';
    if (path === SERVER_KEYGEN_PATH) {
      return res.status(403).json({
        error: 'server-side private-key generation is disabled in production; generate keys in a trusted client or offline environment'
      });
    }

    if (!PROTECTED_POSTS.has(path)) return next();

    if (!simulationEnabled) {
      return res.status(503).json({
        error: 'simulation mutation API is disabled in production',
        mode: 'READ_ONLY_PRODUCTION_PREVIEW'
      });
    }
    if (!secureTokenEquals(req.headers.authorization, adminToken)) {
      return res.status(401).json({ error: 'unauthorized' });
    }
    next();
  });
}
