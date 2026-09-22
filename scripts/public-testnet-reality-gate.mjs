#!/usr/bin/env node
/**
 * PQ-RDL Public Testnet promotion gate.
 *
 * Repository-controlled evidence alone is never sufficient for promotion. A passing
 * result requires live attestations from at least two distinct public HTTPS hosts
 * and independently identified operators, supplied at runtime through
 * RDL_PUBLIC_TESTNET_ATTESTATION_URLS.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { isIP } from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function resolveRepoPath(relativePath) {
  return path.resolve(ROOT, relativePath);
}

function readJson(relativePath) {
  try {
    return JSON.parse(readFileSync(resolveRepoPath(relativePath), 'utf8'));
  } catch {
    return null;
  }
}

function isNonPlaceholder(value) {
  if (typeof value !== 'string') return false;
  const normalized = value.trim();
  return normalized.length > 0 &&
    !/(TODO|TBD|PLACEHOLDER|EXAMPLE|NOT[_ -]?VERIFIED|SIMULATION|DEMO|FAKE)/i.test(normalized);
}

function normalizeHost(hostname) {
  return hostname.replace(/^\[/, '').replace(/\]$/, '').toLowerCase();
}

function isReservedIpv4(host) {
  const parts = host.split('.').map(Number);
  if (parts.length !== 4 || parts.some(part => !Number.isInteger(part) || part < 0 || part > 255)) {
    return true;
  }
  const [a, b, c] = parts;
  return a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0 && c === 0) ||
    (a === 192 && b === 0 && c === 2) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    (a === 198 && b === 51 && c === 100) ||
    (a === 203 && b === 0 && c === 113) ||
    a >= 224;
}

function isReservedIpv6(host) {
  const normalized = host.toLowerCase();
  if (normalized === '::' || normalized === '::1') return true;
  if (/^f[cd][0-9a-f]{2}:/i.test(normalized)) return true; // fc00::/7 unique-local
  if (/^fe[89ab][0-9a-f]:/i.test(normalized)) return true; // fe80::/10 link-local
  if (/^ff/i.test(normalized)) return true; // multicast
  if (/^2001:db8:/i.test(normalized)) return true; // documentation
  if (/^::ffff:/i.test(normalized)) {
    const mapped = normalized.slice('::ffff:'.length);
    return isIP(mapped) === 4 ? isReservedIpv4(mapped) : true;
  }
  return false;
}

function parsePublicUrl(value) {
  if (!isNonPlaceholder(value)) return null;
  try {
    const url = new URL(value.includes('://') ? value : `tcp://${value}`);
    const host = normalizeHost(url.hostname);
    if (!host || host === 'localhost' || host === '0.0.0.0') return null;

    const ipVersion = isIP(host);
    if (ipVersion === 4 && isReservedIpv4(host)) return null;
    if (ipVersion === 6 && isReservedIpv6(host)) return null;

    return url;
  } catch {
    return null;
  }
}

function isPublicEndpoint(value) {
  return Boolean(parsePublicUrl(value));
}

function isPublicPeerEndpoint(value) {
  const url = parsePublicUrl(value);
  if (!url) return false;
  if (!['tls:', 'quic:'].includes(url.protocol)) return false;
  return Boolean(url.port && Number(url.port) > 0 && Number(url.port) <= 65535);
}

function isPublicHttpsEndpoint(value) {
  const url = parsePublicUrl(value);
  return Boolean(url && url.protocol === 'https:');
}

async function fetchExternalAttestations(genesisSha256) {
  const configured = (process.env.RDL_PUBLIC_TESTNET_ATTESTATION_URLS || '')
    .split(',')
    .map(value => value.trim())
    .filter(Boolean);

  const urls = configured.filter(isPublicHttpsEndpoint);
  const valid = [];

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        headers: { accept: 'application/json' },
        redirect: 'error',
        signal: AbortSignal.timeout(8_000),
      });
      if (!response.ok) continue;

      const body = await response.json();
      const parsedUrl = new URL(url);
      const attestationValid =
        body?.mode === 'INDEPENDENT_PUBLIC_ATTESTATION' &&
        body?.network === 'PQ-RDL' &&
        body?.genesis_sha256 === genesisSha256 &&
        isNonPlaceholder(body?.operator) &&
        body?.encrypted_peer_transport_verified === true &&
        body?.public_state_sync_verified === true &&
        body?.public_transaction_settlement_verified === true &&
        body?.restart_recovery_verified === true;

      if (attestationValid) {
        valid.push({
          host: normalizeHost(parsedUrl.hostname),
          operator: body.operator.trim(),
          url,
        });
      }
    } catch {
      // Fail closed: unreachable, redirected, malformed, or timed-out attestations are ignored.
    }
  }

  const distinctHosts = new Set(valid.map(item => item.host));
  const distinctOperators = new Set(valid.map(item => item.operator));

  return {
    configuredCount: configured.length,
    validCount: valid.length,
    distinctHostCount: distinctHosts.size,
    distinctOperatorCount: distinctOperators.size,
    verified: valid.length >= 2 && distinctHosts.size >= 2 && distinctOperators.size >= 2,
  };
}

const files = {
  genesis: 'testnet/genesis.json',
  manifest: 'testnet/network-manifest.example.json',
  persistent: 'evidence/PERSISTENT_LEDGER.json',
  p2p: 'evidence/P2P_NETWORK.json',
  consensus: 'evidence/CONSENSUS.json',
  multi: 'evidence/MULTINODE_TESTNET.json',
  deployment: 'DEPLOYMENT_EVIDENCE.json',
};

const data = Object.fromEntries(
  Object.entries(files).map(([key, file]) => [key, readJson(file)])
);

const checks = [];
function check(name, present, reason, details = {}) {
  checks.push({ name, present: Boolean(present), reason, ...details });
}

for (const [name, file] of Object.entries(files)) {
  const absolutePath = resolveRepoPath(file);
  check(
    `${name}File`,
    existsSync(absolutePath) && data[name] && typeof data[name] === 'object',
    `${file} must exist inside the repository root and contain valid JSON`,
    { path: file }
  );
}

let genesisSha256 = null;
const genesisPath = resolveRepoPath(files.genesis);
if (existsSync(genesisPath)) {
  genesisSha256 = createHash('sha256').update(readFileSync(genesisPath)).digest('hex');
}
check(
  'genesisHash',
  Boolean(genesisSha256 && data.manifest?.genesis_sha256 === genesisSha256),
  'manifest genesis SHA-256 must exactly match testnet/genesis.json',
  { expected: data.manifest?.genesis_sha256 ?? null, actual: genesisSha256 }
);

const bootstrapEndpoints = Array.isArray(data.manifest?.bootstrap_endpoints)
  ? data.manifest.bootstrap_endpoints
  : [];
const publicBootstraps = bootstrapEndpoints.filter(isPublicPeerEndpoint);
check(
  'publicBootstrapEndpoints',
  publicBootstraps.length >= 2,
  'at least two externally reachable encrypted P2P bootstrap endpoints (tls:// or quic://) are required',
  { count: publicBootstraps.length }
);

const nodes = Array.isArray(data.multi?.nodes) ? data.multi.nodes : [];
const publicNodes = nodes.filter(node => isPublicEndpoint(node.endpoint || node.address || ''));
const operators = new Set(
  publicNodes
    .map(node => node.operator)
    .filter(isNonPlaceholder)
);

const externalAttestations = await fetchExternalAttestations(genesisSha256);
check(
  'externalIndependentAttestations',
  externalAttestations.verified,
  'at least two live public HTTPS attestations from distinct hosts and independently identified operators are required at runtime',
  externalAttestations
);

check(
  'independentEvidenceScope',
  data.multi?.mode === 'INDEPENDENT_PUBLIC_EVIDENCE' &&
    data.p2p?.mode === 'INDEPENDENT_PUBLIC_EVIDENCE' &&
    data.persistent?.mode === 'INDEPENDENT_PUBLIC_EVIDENCE' &&
    data.consensus?.mode === 'INDEPENDENT_PUBLIC_EVIDENCE' &&
    data.deployment?.mode === 'INDEPENDENT_PUBLIC_EVIDENCE',
  'all repository evidence must explicitly identify independent public scope'
);

check(
  'independentAdministration',
  externalAttestations.verified &&
    data.multi?.independent_administration_verified === true &&
    publicNodes.length >= 2 &&
    operators.size >= 2,
  'repository claims require corroboration by external attestations and at least two independently identified public node operators',
  { publicNodeCount: publicNodes.length, distinctOperatorCount: operators.size }
);

check(
  'multiMachinePhysicalSeparation',
  externalAttestations.verified &&
    publicNodes.length >= 2 &&
    new Set(publicNodes.map(node => node.endpoint || node.address)).size >= 2,
  'at least two distinct non-loopback public endpoints plus external corroboration are required'
);

check(
  'encryptedPeerTransport',
  externalAttestations.verified &&
    data.multi?.encrypted_peer_transport_verified === true &&
    data.p2p?.encrypted_transport === true,
  'encrypted peer transport must be implemented, repository-recorded, and externally corroborated'
);

const publicSync = data.p2p?.state_sync;
check(
  'publicStateSync',
  externalAttestations.verified &&
    publicSync?.public_network_verified === true &&
    publicSync?.tip_hash_consensus === true &&
    Number(publicSync?.blocks_synchronized) >= 1,
  'public state synchronization must be repository-recorded and externally corroborated'
);

const settledTransactions = Array.isArray(data.persistent?.publicly_verified_transactions)
  ? data.persistent.publicly_verified_transactions
  : [];
check(
  'publicTransactionSettlement',
  externalAttestations.verified &&
    data.persistent?.public_transaction_settlement_verified === true &&
    Number(data.persistent?.current_block_height) >= 1 &&
    settledTransactions.length >= 1,
  'public settlement requires at least one recorded transaction and external corroboration'
);

const recovery = data.consensus?.crash_recovery;
check(
  'publicRestartRecovery',
  externalAttestations.verified &&
    recovery?.publicly_verified === true &&
    isNonPlaceholder(recovery?.pre_restart_tip_hash) &&
    recovery?.pre_restart_tip_hash === recovery?.post_restart_tip_hash,
  'restart/recovery must be recorded and externally corroborated on independently administered infrastructure'
);

check(
  'deploymentAttestation',
  externalAttestations.verified &&
    data.deployment?.verdict === 'PUBLIC_TESTNET_VERIFIED' &&
    data.deployment?.public_testnet_requirements?.independent_administration_verified === true &&
    data.deployment?.public_testnet_requirements?.encrypted_peer_transport_verified === true &&
    data.deployment?.public_testnet_requirements?.public_transaction_settlement_verified === true,
  'deployment attestation must satisfy public-testnet requirements and be corroborated externally'
);

const missing = checks.filter(item => !item.present).map(item => item.name);
const verified = missing.length === 0;
const report = {
  mode: 'PUBLIC_TESTNET_PROMOTION_GATE',
  verdict: verified ? 'PUBLIC_TESTNET_VERIFIED' : 'NOT_VERIFIED',
  generated_at: new Date().toISOString(),
  genesis_sha256: genesisSha256,
  checks,
  missing,
  rule: 'Repository-controlled, single-host, loopback, simulated, or ephemeral CI evidence can never by itself promote PQ-RDL to Public Testnet.',
};

writeFileSync(
  resolveRepoPath('qmoosa-public-testnet-reality-report.json'),
  JSON.stringify(report, null, 2)
);
console.log('\nPQ-RDL PUBLIC TESTNET REALITY GATE:', report.verdict);

if (!verified) {
  console.error('Missing independent public evidence:', missing.join(', '));
  process.exit(2);
}
