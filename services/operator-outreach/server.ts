import express from 'express';
import { OutreachEngine } from './engine.ts';

const app = express();
const engine = new OutreachEngine();
const port = Number(process.env.OPERATOR_OUTREACH_PORT || 8790);
const inboundToken = process.env.OPERATOR_INBOUND_TOKEN;

app.use(express.json({ limit: '128kb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'pq-rdl-operator-outreach' });
});

app.post('/webhooks/response', async (req, res) => {
  if (inboundToken && req.headers.authorization !== `Bearer ${inboundToken}`) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const { operatorId, body } = req.body || {};
  if (typeof operatorId !== 'string' || typeof body !== 'string' || !body.trim()) {
    return res.status(400).json({ error: 'operatorId and body are required' });
  }

  try {
    const operator = await engine.recordResponse(operatorId, body.slice(0, 10000));
    return res.json({ ok: true, operator });
  } catch (error: any) {
    return res.status(404).json({ error: error?.message || String(error) });
  }
});

app.listen(port, () => {
  console.log(`PQ-RDL operator outreach webhook listening on :${port}`);
});
