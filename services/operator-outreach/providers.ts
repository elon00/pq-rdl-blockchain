import type { DeliveryResult, OperatorContact } from './types.ts';

type GatewayPayload = Record<string, unknown>;

async function postGateway(url: string | undefined, token: string | undefined, payload: GatewayPayload): Promise<DeliveryResult> {
  if (!url) return { ok: true, providerMessageId: 'dry-run' };
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(token ? { authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) return { ok: false, error: `gateway returned HTTP ${response.status}` };
    const body = await response.json().catch(() => ({})) as { id?: string; messageId?: string };
    return { ok: true, providerMessageId: body.id || body.messageId || 'accepted' };
  } catch (error: any) {
    return { ok: false, error: error?.message || String(error) };
  }
}

export async function sendEmail(contact: OperatorContact, subject: string, body: string): Promise<DeliveryResult> {
  if (!contact.email) return { ok: false, error: 'contact has no email' };
  return postGateway(process.env.OPERATOR_EMAIL_WEBHOOK_URL, process.env.OPERATOR_GATEWAY_TOKEN, {
    type: 'email',
    to: contact.email,
    name: contact.name,
    subject,
    body
  });
}

export async function placeCall(contact: OperatorContact, script: string): Promise<DeliveryResult> {
  if (!contact.phone) return { ok: false, error: 'contact has no phone' };
  return postGateway(process.env.OPERATOR_VOICE_WEBHOOK_URL, process.env.OPERATOR_GATEWAY_TOKEN, {
    type: 'voice',
    to: contact.phone,
    name: contact.name,
    script,
    disclosure: 'Automated or assisted project outreach. Recipient may opt out.'
  });
}
