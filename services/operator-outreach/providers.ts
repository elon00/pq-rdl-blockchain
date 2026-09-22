import type { DeliveryResult, OperatorContact } from './types.ts';
import { getGatewayTimeoutMs } from './config.ts';
import { sanitizeDisplayName } from './sanitize.ts';

type GatewayPayload = Record<string, unknown>;

function validateGatewayUrl(raw: string): string {
  const url = new URL(raw);
  const local = ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
  if (url.protocol !== 'https:' && !(local && url.protocol === 'http:')) {
    throw new Error('gateway URL must use HTTPS (HTTP is allowed only for localhost)');
  }
  return url.toString();
}

async function postGateway(url: string | undefined, token: string | undefined, payload: GatewayPayload): Promise<DeliveryResult> {
  if (!url) return { ok: true, dryRun: true, providerMessageId: 'dry-run' };
  if (!token?.trim()) return { ok: false, error: 'OPERATOR_GATEWAY_TOKEN is required when a gateway URL is configured' };

  try {
    const endpoint = validateGatewayUrl(url);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${token.trim()}`
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(getGatewayTimeoutMs())
    });
    if (!response.ok) return { ok: false, error: `gateway returned HTTP ${response.status}` };
    const body = await response.json().catch(() => ({})) as { id?: string; messageId?: string };
    return { ok: true, providerMessageId: body.id || body.messageId || 'accepted' };
  } catch (error: any) {
    const message = error?.name === 'TimeoutError' ? 'gateway request timed out' : (error?.message || String(error));
    return { ok: false, error: message };
  }
}

export async function sendEmail(contact: OperatorContact, subject: string, body: string): Promise<DeliveryResult> {
  if (!contact.email) return { ok: false, error: 'contact has no email' };
  return postGateway(process.env.OPERATOR_EMAIL_WEBHOOK_URL, process.env.OPERATOR_GATEWAY_TOKEN, {
    type: 'email',
    to: contact.email,
    name: sanitizeDisplayName(contact.name),
    subject,
    body
  });
}

export async function placeCall(contact: OperatorContact, script: string): Promise<DeliveryResult> {
  if (!contact.phone) return { ok: false, error: 'contact has no phone' };
  return postGateway(process.env.OPERATOR_VOICE_WEBHOOK_URL, process.env.OPERATOR_GATEWAY_TOKEN, {
    type: 'voice',
    to: contact.phone,
    name: sanitizeDisplayName(contact.name),
    script,
    disclosure: 'Automated or assisted project outreach. Recipient may opt out.'
  });
}
