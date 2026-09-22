import { config as loadDotenv } from 'dotenv';

let loaded = false;

export function loadOutreachEnv(): void {
  if (loaded) return;
  loaded = true;
  loadDotenv({ path: '.env.local', override: false, quiet: true });
  loadDotenv({ path: '.env', override: false, quiet: true });
}

export function positiveNumberEnv(name: string, fallback: number, min: number, max: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) && value >= min && value <= max ? value : fallback;
}

export function getMinContactIntervalMs(): number {
  return positiveNumberEnv('OPERATOR_MIN_CONTACT_INTERVAL_HOURS', 48, 1, 24 * 30) * 60 * 60 * 1000;
}

export function getGatewayTimeoutMs(): number {
  return positiveNumberEnv('OPERATOR_GATEWAY_TIMEOUT_MS', 10_000, 1_000, 60_000);
}

export function getInboundToken(): string {
  const token = process.env.OPERATOR_INBOUND_TOKEN?.trim() || '';
  if (token.length < 32 || /^change[_-]?me/i.test(token)) {
    throw new Error('OPERATOR_INBOUND_TOKEN must be a non-placeholder secret of at least 32 characters');
  }
  return token;
}
