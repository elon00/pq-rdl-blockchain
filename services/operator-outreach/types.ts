export type OperatorStage =
  | 'prospect'
  | 'invited'
  | 'interested'
  | 'briefed'
  | 'onboarding'
  | 'active'
  | 'declined'
  | 'do-not-contact';

export type Channel = 'email' | 'voice' | 'telegram';

export interface OperatorContact {
  id: string;
  name: string;
  organization?: string;
  email?: string;
  phone?: string;
  telegram?: string;
  timezone?: string;
  stage: OperatorStage;
  consent: boolean;
  source: string;
  tags: string[];
  notes?: string;
  lastContactAt?: string;
  nextActionAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OutreachEvent {
  id: string;
  operatorId: string;
  channel: Channel;
  kind: 'invite' | 'brief' | 'follow-up' | 'response' | 'call';
  status: 'queued' | 'sent' | 'received' | 'failed' | 'skipped' | 'dry-run';
  subject?: string;
  body: string;
  providerMessageId?: string;
  error?: string;
  createdAt: string;
}

export interface OutreachState {
  operators: OperatorContact[];
  events: OutreachEvent[];
}

export interface DeliveryResult {
  ok: boolean;
  dryRun?: boolean;
  providerMessageId?: string;
  error?: string;
}
