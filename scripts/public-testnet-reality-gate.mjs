#!/usr/bin/env node
/**
 * PQ-RDL Public Testnet promotion gate.
 *
 * This gate accepts only evidence explicitly scoped as independently administered,
 * externally reachable public infrastructure. Localhost, single-host CI, generated
 * operator aliases, and ephemeral CI runners cannot satisfy promotion.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
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

function isPublicEndpoint(value) {
  if (!isNonPlaceholder(value)) return false;
  try {
    const url = new URL(value.includes('://') ? value : `tcp://${value}`);
    const host = url.hostname.toLowerCase();
    if (!host || ['localhost', '0.0.0.0', '::1'].includes(host)) return false;
    if (/^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host)) return false;
    if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return false;
    return true;
  } catch {
    return false;
  }
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
  check(
    `${name}File`,
    existsSync(file) && data[name] && typeof data[name] === 'object',
    `${file} must exist and contain valid JSON`,
    { path: file }
  );
}

let genesisSha256 = null;
if (existsSync(files.genesis)) {
  genesisSha256 = createHash('sha256').update(readFileSync(files.genesis)).digest('hex');
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
const publicBootstraps = bootstrapEndpoints.filter(isPublicEndpoint);
check(
  'publicBootstrapEndpoints',
  publicBootstraps.length >= 2,
  'at least two real, externally reachable bootstrap endpoints are required',
  { count: publicBootstraps.length }
);

const nodes = Array.isArray(data.multi?.nodes) ? data.multi.nodes : [];
const publicNodes = nodes.filter(node => isPublicEndpoint(node.endpoint || node.address || ''));
const operators = new Set(
  publicNodes
    .map(node => node.operator)
    .filter(isNonPlaceholder)
);

check(
  'independentEvidenceScope',
  data.multi?.mode === 'INDEPENDENT_PUBLIC_EVIDENCE' &&
    data.p2p?.mode === 'INDEPENDENT_PUBLIC_EVIDENCE' &&
    data.persistent?.mode === 'INDEPENDENT_PUBLIC_EVIDENCE' &&
    data.consensus?.mode === 'INDEPENDENT_PUBLIC_EVIDENCE' &&
    data.deployment?.mode === 'INDEPENDENT_PUBLIC_EVIDENCE',
  'all promotion evidence must explicitly identify independent public scope'
);

check(
  'independentAdministration',
  data.multi?.independent_administration_verified === true &&
    publicNodes.length >= 2 &&
    operators.size >= 2,
  'at least two public nodes must be controlled by distinct independently identified operators',
  { publicNodeCount: publicNodes.length, distinctOperatorCount: operators.size }
);

check(
  'multiMachinePhysicalSeparation',
  publicNodes.length >= 2 &&
    new Set(publicNodes.map(node => node.endpoint || node.address)).size >= 2,
  'at least two distinct non-loopback public endpoints are required'
);

check(
  'encryptedPeerTransport',
  data.multi?.encrypted_peer_transport_verified === true &&
    data.p2p?.encrypted_transport === true,
  'encrypted peer transport must be implemented and verified on the public deployment'
);

const publicSync = data.p2p?.state_sync;
check(
  'publicStateSync',
  publicSync?.public_network_verified === true &&
    publicSync?.tip_hash_consensus === true &&
    Number(publicSync?.blocks_synchronized) >= 1,
  'independently administered public nodes must reproduce state synchronization'
);

const settledTransactions = Array.isArray(data.persistent?.publicly_verified_transactions)
  ? data.persistent.publicly_verified_transactions
  : [];
check(
  'publicTransactionSettlement',
  data.persistent?.public_transaction_settlement_verified === true &&
    Number(data.persistent?.current_block_height) >= 1 &&
    settledTransactions.length >= 1,
  'at least one externally reproducible public transaction/state transition is required'
);

const recovery = data.consensus?.crash_recovery;
check(
  'publicRestartRecovery',
  recovery?.publicly_verified === true &&
    isNonPlaceholder(recovery?.pre_restart_tip_hash) &&
    recovery?.pre_restart_tip_hash === recovery?.post_restart_tip_hash,
  'restart/recovery must be reproduced on independently administered public infrastructure'
);

check(
  'deploymentAttestation',
  data.deployment?.verdict === 'PUBLIC_TESTNET_VERIFIED' &&
    data.deployment?.public_testnet_requirements?.independent_administration_verified === true &&
    data.deployment?.public_testnet_requirements?.encrypted_peer_transport_verified === true &&
    data.deployment?.public_testnet_requirements?.public_transaction_settlement_verified === true,
  'deployment attestation must explicitly satisfy public-testnet promotion requirements'
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
  rule: 'Single-host, loopback, simulated, or ephemeral CI evidence can never promote PQ-RDL to Public Testnet.',
};

writeFileSync('qmoosa-public-testnet-reality-report.json', JSON.stringify(report, null, 2));
console.log('\nPQ-RDL PUBLIC TESTNET REALITY GATE:', report.verdict);

if (!verified) {
  console.error('Missing independent public evidence:', missing.join(', '));
  process.exit(2);
}
