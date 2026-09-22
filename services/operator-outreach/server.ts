import express from 'express';
import { timingSafeEqual } from 'node:crypto';
import { loadOutreachEnv, getInboundToken, positiveNumberEnv } from './config.ts';
import { OperatorNotFoundError, OutreachEngine } from './engine.ts';

loadOutreachEnv();

const app = express();
const engine = new OutreachEngine();
const port = positiveNumberEnv('OPERATOR_OUTREACH_PORT', 8790, 1, 65535);
const inboundToken = getInboundToken();

app.disable('x-powered-by');
app.use(express.json({ limit: '128kb' }));

function authorized(header: string | undefined): boolean {
  const expected = Buffer.from(`Bearer ${inboundToken}`);
  const actual = Buffer.from(header || '');
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'pq-rdl-operator-outreach' });
});

app.post('/webhooks/response', async (req, res) => {
  if (!authorized(req.headers.authorization)) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const { operatorId, body } = req.body || {};
  if (typeof operatorId !== 'string' || typeof body !== 'string' || !body.trim()) {
    return res.status(400).json({ error: 'operatorId and body are required' });
  }
  if (operatorId.length > 128 || body.length > 10_000) {
    return res.status(400).json({ error: 'operatorId or body exceeds allowed size' });
  }

  try {
    const operator = await engine.recordResponse(operatorId.trim(), body.trim());
    return res.json({ ok: true, operator });
  } catch (error: any) {
    if (error instanceof OperatorNotFoundError) {
      return res.status(404).json({ error: 'operator not found' });
    }
    console.error('operator response processing failed:', error?.message || String(error));
    return res.status(500).json({ error: 'internal server error' });
  }
});

app.listen(port, () => {
  console.log(`PQ-RDL operator outreach webhook listening on :${port}`);
});
