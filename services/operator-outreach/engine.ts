import { randomUUID } from 'node:crypto';
import { OutreachStore } from './store.ts';
import { briefing, followUp, invitation, voiceBrief } from './templates.ts';
import { placeCall, sendEmail } from './providers.ts';
import type { OperatorContact, OutreachEvent } from './types.ts';

const MIN_INTERVAL_MS = Number(process.env.OPERATOR_MIN_CONTACT_INTERVAL_HOURS || 48) * 60 * 60 * 1000;

function canContact(contact: OperatorContact): { ok: boolean; reason?: string } {
  if (!contact.consent) return { ok: false, reason: 'consent=false' };
  if (contact.stage === 'do-not-contact' || contact.stage === 'declined') return { ok: false, reason: `stage=${contact.stage}` };
  if (contact.lastContactAt && Date.now() - Date.parse(contact.lastContactAt) < MIN_INTERVAL_MS) {
    return { ok: false, reason: 'contact interval has not elapsed' };
  }
  return { ok: true };
}

function event(operatorId: string, channel: OutreachEvent['channel'], kind: OutreachEvent['kind'], body: string, subject?: string): OutreachEvent {
  return { id: randomUUID(), operatorId, channel, kind, status: 'queued', body, subject, createdAt: new Date().toISOString() };
}

export class OutreachEngine {
  constructor(private readonly store = new OutreachStore()) {}

  async invite(contact: OperatorContact): Promise<OutreachEvent[]> {
    const allowed = canContact(contact);
    if (!allowed.ok) {
      const skipped = event(contact.id, 'email', 'invite', allowed.reason || 'not contactable');
      skipped.status = 'skipped';
      await this.store.appendEvent(skipped);
      return [skipped];
    }

    const results: OutreachEvent[] = [];
    if (contact.email) {
      const t = invitation(contact);
      const e = event(contact.id, 'email', 'invite', t.body, t.subject);
      const r = await sendEmail(contact, t.subject, t.body);
      e.status = r.ok ? 'sent' : 'failed';
      e.providerMessageId = r.providerMessageId;
      e.error = r.error;
      await this.store.appendEvent(e);
      results.push(e);
    }

    if (contact.phone && process.env.OPERATOR_ENABLE_VOICE === 'true') {
      const e = event(contact.id, 'voice', 'call', voiceBrief(contact));
      const r = await placeCall(contact, e.body);
      e.status = r.ok ? 'sent' : 'failed';
      e.providerMessageId = r.providerMessageId;
      e.error = r.error;
      await this.store.appendEvent(e);
      results.push(e);
    }

    contact.stage = 'invited';
    contact.lastContactAt = new Date().toISOString();
    contact.updatedAt = contact.lastContactAt;
    await this.store.upsertOperator(contact);
    return results;
  }

  async brief(contact: OperatorContact): Promise<OutreachEvent> {
    const t = briefing(contact);
    const e = event(contact.id, 'email', 'brief', t.body, t.subject);
    const allowed = canContact(contact);
    if (!allowed.ok) {
      e.status = 'skipped';
      e.error = allowed.reason;
    } else {
      const r = await sendEmail(contact, t.subject, t.body);
      e.status = r.ok ? 'sent' : 'failed';
      e.providerMessageId = r.providerMessageId;
      e.error = r.error;
      if (r.ok) {
        contact.stage = 'briefed';
        contact.lastContactAt = new Date().toISOString();
        contact.updatedAt = contact.lastContactAt;
        await this.store.upsertOperator(contact);
      }
    }
    await this.store.appendEvent(e);
    return e;
  }

  async followUp(contact: OperatorContact): Promise<OutreachEvent> {
    const t = followUp(contact);
    const e = event(contact.id, 'email', 'follow-up', t.body, t.subject);
    const allowed = canContact(contact);
    if (!allowed.ok) {
      e.status = 'skipped';
      e.error = allowed.reason;
    } else {
      const r = await sendEmail(contact, t.subject, t.body);
      e.status = r.ok ? 'sent' : 'failed';
      e.providerMessageId = r.providerMessageId;
      e.error = r.error;
      if (r.ok) {
        contact.lastContactAt = new Date().toISOString();
        contact.updatedAt = contact.lastContactAt;
        await this.store.upsertOperator(contact);
      }
    }
    await this.store.appendEvent(e);
    return e;
  }

  async recordResponse(operatorId: string, body: string): Promise<OperatorContact> {
    const state = await this.store.load();
    const contact = state.operators.find(x => x.id === operatorId);
    if (!contact) throw new Error('operator not found');
    const normalized = body.toLowerCase();
    if (/unsubscribe|stop|do not contact|opt out/.test(normalized)) {
      contact.stage = 'do-not-contact';
      contact.consent = false;
    } else if (/interested|yes|brief|tell me more|run a node/.test(normalized)) {
      contact.stage = 'interested';
    }
    contact.notes = [contact.notes, `Response: ${body}`].filter(Boolean).join('\n');
    contact.updatedAt = new Date().toISOString();
    await this.store.upsertOperator(contact);
    const e = event(operatorId, 'email', 'response', body);
    e.status = 'received';
    await this.store.appendEvent(e);
    return contact;
  }
}
