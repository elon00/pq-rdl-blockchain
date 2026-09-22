import { randomUUID } from 'node:crypto';
import { OutreachStore } from './store.ts';
import { briefing, followUp, invitation, voiceBrief } from './templates.ts';
import { placeCall, sendEmail } from './providers.ts';
import { getMinContactIntervalMs } from './config.ts';
import type { DeliveryResult, OperatorContact, OutreachEvent } from './types.ts';

export class OperatorNotFoundError extends Error {
  constructor(operatorId: string) {
    super(`operator not found: ${operatorId}`);
    this.name = 'OperatorNotFoundError';
  }
}

function canContact(contact: OperatorContact): { ok: boolean; reason?: string } {
  if (!contact.consent) return { ok: false, reason: 'consent=false' };
  if (contact.stage === 'do-not-contact' || contact.stage === 'declined') return { ok: false, reason: `stage=${contact.stage}` };
  if (contact.lastContactAt) {
    const timestamp = Date.parse(contact.lastContactAt);
    if (!Number.isFinite(timestamp)) return { ok: false, reason: 'invalid lastContactAt' };
    if (Date.now() - timestamp < getMinContactIntervalMs()) {
      return { ok: false, reason: 'contact interval has not elapsed' };
    }
  }
  return { ok: true };
}

function event(operatorId: string, channel: OutreachEvent['channel'], kind: OutreachEvent['kind'], body: string, subject?: string): OutreachEvent {
  return { id: randomUUID(), operatorId, channel, kind, status: 'queued', body, subject, createdAt: new Date().toISOString() };
}

function applyDelivery(event: OutreachEvent, result: DeliveryResult): void {
  event.status = result.dryRun ? 'dry-run' : (result.ok ? 'sent' : 'failed');
  event.providerMessageId = result.providerMessageId;
  event.error = result.error;
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
      applyDelivery(e, await sendEmail(contact, t.subject, t.body));
      await this.store.appendEvent(e);
      results.push(e);
    }

    if (contact.phone && process.env.OPERATOR_ENABLE_VOICE === 'true') {
      const e = event(contact.id, 'voice', 'call', voiceBrief(contact));
      applyDelivery(e, await placeCall(contact, e.body));
      await this.store.appendEvent(e);
      results.push(e);
    }

    if (results.length === 0) {
      const skipped = event(contact.id, 'email', 'invite', 'no enabled delivery channel');
      skipped.status = 'skipped';
      skipped.error = 'no email address and no enabled voice route';
      await this.store.appendEvent(skipped);
      return [skipped];
    }

    if (results.some(x => x.status === 'sent')) {
      contact.stage = 'invited';
      contact.lastContactAt = new Date().toISOString();
      contact.updatedAt = contact.lastContactAt;
      await this.store.upsertOperator(contact);
    }
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
      applyDelivery(e, await sendEmail(contact, t.subject, t.body));
      if (e.status === 'sent') {
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
      applyDelivery(e, await sendEmail(contact, t.subject, t.body));
      if (e.status === 'sent') {
        contact.lastContactAt = new Date().toISOString();
        contact.updatedAt = contact.lastContactAt;
        await this.store.upsertOperator(contact);
      }
    }
    await this.store.appendEvent(e);
    return e;
  }

  private async autoReply(contact: OperatorContact): Promise<void> {
    if (process.env.OPERATOR_AUTO_REPLY !== 'true' || !contact.email || !contact.consent) return;
    const t = briefing(contact);
    const e = event(contact.id, 'email', 'response', t.body, `Re: ${t.subject}`);
    applyDelivery(e, await sendEmail(contact, e.subject || t.subject, t.body));
    await this.store.appendEvent(e);
    if (e.status === 'sent') {
      contact.stage = 'briefed';
      contact.lastContactAt = new Date().toISOString();
      contact.updatedAt = contact.lastContactAt;
      await this.store.upsertOperator(contact);
    }
  }

  async recordResponse(operatorId: string, body: string): Promise<OperatorContact> {
    const state = await this.store.load();
    const contact = state.operators.find(x => x.id === operatorId);
    if (!contact) throw new OperatorNotFoundError(operatorId);

    const normalized = body.toLowerCase();
    const isOptOut = /\b(?:unsubscribe|stop)\b|do not contact|opt[- ]?out/.test(normalized);
    const isDecline = /\bnot interested\b|\bno thanks\b|\bno thank you\b|\bdecline\b|\bdo not want\b/.test(normalized);
    const isInterested = /\binterested\b|\byes\b|\bbrief\b|tell me more|run a node/.test(normalized);

    if (isOptOut) {
      contact.stage = 'do-not-contact';
      contact.consent = false;
    } else if (isDecline) {
      contact.stage = 'declined';
    } else if (isInterested) {
      contact.stage = 'interested';
    }

    contact.notes = [contact.notes, `Response: ${body}`].filter(Boolean).join('\n');
    contact.updatedAt = new Date().toISOString();
    await this.store.upsertOperator(contact);

    const inbound = event(operatorId, 'email', 'response', body);
    inbound.status = 'received';
    await this.store.appendEvent(inbound);

    if (isInterested) await this.autoReply(contact);
    return contact;
  }
}
