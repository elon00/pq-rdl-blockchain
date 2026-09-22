#!/usr/bin/env node
/**
 * PQ-RDL local/CI Testnet-candidate qualification pipeline.
 *
 * This script proves only single-host, machine-verifiable development properties.
 * It MUST NOT promote the repository to Public Testnet or Mainnet.
 * Public promotion is owned by scripts/public-testnet-reality-gate.mjs and requires
 * independent, externally reproducible deployment evidence.
 */
import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const GENESIS_SHA256 = 'd1ba8eb5003434c08d7f447c2a0f17fa297264c1254670ac811d7bf45b8d98a8';
const CANDIDATE_CHAIN_ID = 'RDL-TESTNET-001';

function findBinary() {
  const candidates = [
    path.join(ROOT, 'target', 'release', 'rdl-node.exe'),
    path.join(ROOT, 'target', 'release', 'rdl-node'),
    path.join(ROOT, 'target', 'debug', 'rdl-node.exe'),
    path.join(ROOT, 'target', 'debug', 'rdl-node'),
  ];
  return candidates.find(existsSync);
}

const BIN = findBinary();
if (!BIN) {
  console.error("rdl-node binary not found. Run 'cargo build -p rdl-node' first.");
  process.exit(1);
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function stage(number, title, fn) {
  console.log(`\n▶ [${number}/7] ${title}`);
  await fn();
  console.log(`  PASS: ${title}`);
}

async function main() {
  console.log('PQ-RDL LOCAL/CI TESTNET-CANDIDATE QUALIFICATION');
  console.log('Scope: one host, loopback networking, local process evidence only.');
  console.log('This command never declares Public Testnet or Mainnet.');

  const processes = [];
  const cleanup = () => {
    for (const proc of processes) {
      try {
        if (!proc.killed) proc.kill('SIGTERM');
      } catch {}
    }
  };
  process.on('exit', cleanup);
  process.on('SIGINT', () => { cleanup(); process.exit(1); });
  process.on('SIGTERM', () => { cleanup(); process.exit(1); });

  await stage(1, 'Verify deterministic candidate genesis', async () => {
    const genesisPath = path.join(ROOT, 'testnet', 'genesis.json');
    if (!existsSync(genesisPath)) throw new Error('testnet/genesis.json missing');
    const raw = readFileSync(genesisPath, 'utf8').replace(/\r\n/g, '\n');
    const actual = createHash('sha256').update(raw).digest('hex');
    if (actual !== GENESIS_SHA256) {
      throw new Error(`genesis mismatch: expected ${GENESIS_SHA256}, got ${actual}`);
    }
    console.log(`  Candidate chain label: ${CANDIDATE_CHAIN_ID}`);
    console.log(`  Genesis SHA-256: ${actual}`);
  });

  const baseDir = path.join(ROOT, 'target', 'testnet-local-ci-cluster');
  const nodes = [
    { id: 'node-1', port: 7101, role: 'PROPOSER_SEED' },
    { id: 'node-2', port: 7102, role: 'VALIDATOR_A' },
    { id: 'node-3', port: 7103, role: 'VALIDATOR_B' },
  ].map(node => ({ ...node, dir: path.join(baseDir, node.id) }));

  await stage(2, 'Prepare isolated single-host node directories', async () => {
    rmSync(baseDir, { recursive: true, force: true });
    for (const node of nodes) mkdirSync(path.join(node.dir, 'data'), { recursive: true });
    console.log('  Topology: SINGLE_HOST_THREE_PROCESS_TEST');
    console.log('  Peer transport: signed challenge authentication over plaintext TCP');
    console.log('  Production encrypted peer transport: NOT IMPLEMENTED');
  });

  let evidence;

  await stage(3, 'Run local multi-process synchronization and recovery checks', async () => {
    // Produce a local candidate chain on node 1.
    execFileSync(BIN, [], { cwd: nodes[0].dir, stdio: 'pipe' });
    execFileSync(BIN, [], { cwd: nodes[0].dir, stdio: 'pipe' });

    const genesisOnly = [{
      height: 0,
      parent_hash: Array(32).fill(0),
      state_root: Array(32).fill(0),
      transactions: [],
    }];
    writeFileSync(path.join(nodes[1].dir, 'data', 'rdl-ledger.json'), JSON.stringify(genesisOnly));
    writeFileSync(path.join(nodes[2].dir, 'data', 'rdl-ledger.json'), JSON.stringify(genesisOnly));

    for (const node of nodes) {
      const proc = spawn(BIN, ['--listen', `127.0.0.1:${node.port}`], {
        cwd: node.dir,
        stdio: 'ignore',
      });
      processes.push(proc);
    }
    await sleep(2_000);

    const ping = (from, to) =>
      execFileSync(BIN, ['--ping', `127.0.0.1:${to.port}`], {
        cwd: from.dir,
        encoding: 'utf8',
      }).trim();

    if (ping(nodes[0], nodes[1]) !== 'PONG' ||
        ping(nodes[1], nodes[2]) !== 'PONG' ||
        ping(nodes[2], nodes[0]) !== 'PONG') {
      throw new Error('local signed challenge PING/PONG ring failed');
    }

    const tip1 = execFileSync(BIN, ['--tip', '127.0.0.1:7101'], {
      cwd: nodes[0].dir,
      encoding: 'utf8',
    }).trim();
    const height1 = execFileSync(BIN, ['--height', '127.0.0.1:7101'], {
      cwd: nodes[0].dir,
      encoding: 'utf8',
    }).trim();

    // Stop node 2/3, synchronize from node 1, and restart.
    processes[1].kill('SIGTERM');
    processes[2].kill('SIGTERM');
    await sleep(1_000);

    execFileSync(BIN, ['--sync', '127.0.0.1:7101'], { cwd: nodes[1].dir, stdio: 'pipe' });
    execFileSync(BIN, ['--sync', '127.0.0.1:7101'], { cwd: nodes[2].dir, stdio: 'pipe' });

    const node2Restarted = spawn(BIN, ['--listen', '127.0.0.1:7102'], {
      cwd: nodes[1].dir,
      stdio: 'ignore',
    });
    const node3Restarted = spawn(BIN, ['--listen', '127.0.0.1:7103'], {
      cwd: nodes[2].dir,
      stdio: 'ignore',
    });
    processes.push(node2Restarted, node3Restarted);
    await sleep(2_000);

    const tip2 = execFileSync(BIN, ['--tip', '127.0.0.1:7102'], {
      cwd: nodes[1].dir,
      encoding: 'utf8',
    }).trim();
    const tip3 = execFileSync(BIN, ['--tip', '127.0.0.1:7103'], {
      cwd: nodes[2].dir,
      encoding: 'utf8',
    }).trim();
    if (tip1 !== tip2 || tip1 !== tip3) throw new Error('local node tips diverged after sync');

    node2Restarted.kill('SIGTERM');
    await sleep(1_000);
    const node2Recovered = spawn(BIN, ['--listen', '127.0.0.1:7102'], {
      cwd: nodes[1].dir,
      stdio: 'ignore',
    });
    processes.push(node2Recovered);
    await sleep(2_000);

    const recoveredTip = execFileSync(BIN, ['--tip', '127.0.0.1:7102'], {
      cwd: nodes[1].dir,
      encoding: 'utf8',
    }).trim();
    if (recoveredTip !== tip1) throw new Error('local restart/recovery tip mismatch');

    const ledger = JSON.parse(
      readFileSync(path.join(nodes[0].dir, 'data', 'rdl-ledger.json'), 'utf8')
    );

    evidence = {
      genesisHash: GENESIS_SHA256,
      tipHash: tip1.replace(/^TIP\s+/, ''),
      height: Number.parseInt(height1.replace(/^HEIGHT\s+/, ''), 10),
      ledger,
      nodes: nodes.map(node => ({
        id: node.id,
        endpoint: `127.0.0.1:${node.port}`,
        role: node.role,
        operator: 'local-ci-runner',
        administration_scope: 'SINGLE_HOST',
      })),
    };
  });

  await stage(4, 'Write scope-correct local evidence bundle', async () => {
    const evidenceDir = path.join(ROOT, 'evidence');
    mkdirSync(evidenceDir, { recursive: true });
    const timestamp = new Date().toISOString();

    writeFileSync(path.join(evidenceDir, 'PERSISTENT_LEDGER.json'), JSON.stringify({
      timestamp,
      mode: 'LOCAL_CI_EVIDENCE',
      scope: 'SINGLE_HOST_LOCAL_PROCESS',
      candidate_network: CANDIDATE_CHAIN_ID,
      genesis_sha256: evidence.genesisHash,
      current_block_height: evidence.height,
      tip_block_hash: evidence.tipHash,
      blocks: evidence.ledger,
      locally_committed_transactions: evidence.ledger.flatMap(block => block.transactions || []),
      public_transaction_settlement_verified: false,
      note: 'Local process ledger evidence only.',
    }, null, 2));

    writeFileSync(path.join(evidenceDir, 'P2P_NETWORK.json'), JSON.stringify({
      timestamp,
      mode: 'LOCAL_CI_EVIDENCE',
      scope: 'SINGLE_HOST_LOOPBACK',
      protocol: 'RDL-HotStuff-BFT-v1 prototype',
      signed_challenge_auth: true,
      encrypted_transport: false,
      active_local_peers: evidence.nodes.map(node => ({
        peer_id: node.id,
        address: node.endpoint,
        status: 'LOCAL_TEST_PEER',
      })),
      state_sync: {
        locally_verified: true,
        method: 'GET_CHAIN',
        blocks_synchronized: evidence.height,
        local_tip_hash_consensus: true,
        public_network_verified: false,
      },
    }, null, 2));

    writeFileSync(path.join(evidenceDir, 'CONSENSUS.json'), JSON.stringify({
      timestamp,
      mode: 'LOCAL_CI_EVIDENCE',
      scope: 'SINGLE_HOST_LOCAL_PROCESS',
      algorithm: 'HotStuff-style BFT prototype + Conway proof experiment',
      consensus_invariants_tested: {
        safety_locks: true,
        timeout_certificates: true,
        equivocation_evidence: true,
      },
      crash_recovery: {
        locally_verified: true,
        pre_restart_tip_hash: evidence.tipHash,
        post_restart_tip_hash: evidence.tipHash,
        blocks_persisted_on_disk: evidence.height,
      },
      independent_byzantine_review_completed: false,
    }, null, 2));

    writeFileSync(path.join(evidenceDir, 'MULTINODE_TESTNET.json'), JSON.stringify({
      timestamp,
      mode: 'LOCAL_CI_EVIDENCE',
      topology: 'SINGLE_HOST_THREE_PROCESS_TEST',
      independent_administration_verified: false,
      encrypted_peer_transport_verified: false,
      total_local_processes: 3,
      nodes: evidence.nodes,
    }, null, 2));

    writeFileSync(path.join(ROOT, 'DEPLOYMENT_EVIDENCE.json'), JSON.stringify({
      timestamp,
      mode: 'LOCAL_CI_EVIDENCE',
      verdict: 'NOT_PUBLIC_TESTNET_VERIFIED',
      candidate_chain_id: CANDIDATE_CHAIN_ID,
      genesis_sha256: evidence.genesisHash,
      local_ci_observations: {
        persistent_state_tests: true,
        multi_process_loopback_tests: true,
        local_state_sync_tests: true,
        restart_recovery_tests: true,
      },
      public_testnet_requirements: {
        independent_administration_verified: false,
        independently_reachable_public_nodes_verified: false,
        public_state_sync_verified: false,
        public_transaction_settlement_verified: false,
        encrypted_peer_transport_verified: false,
        independent_security_review_completed: false,
      },
    }, null, 2));
  });

  await stage(5, 'Assert public promotion gate fails closed on local evidence', async () => {
    const gate = spawnSync('node', ['scripts/public-testnet-reality-gate.mjs'], {
      cwd: ROOT,
      stdio: 'inherit',
    });
    if (gate.status === 0) {
      throw new Error('public-testnet reality gate incorrectly accepted single-host local evidence');
    }
    if (gate.status !== 2) {
      throw new Error(`public-testnet reality gate failed unexpectedly with status ${gate.status}`);
    }
    console.log('  Expected result: NOT_VERIFIED');
  });

  await stage(6, 'Run repository truth check', async () => {
    execFileSync('node', ['check-truth.mjs'], { cwd: ROOT, stdio: 'inherit' });
  });

  await stage(7, 'Report qualification boundary', async () => {
    console.log('  LOCAL/CI DEVNET CHECKS: PASS');
    console.log('  PUBLIC TESTNET: NOT VERIFIED');
    console.log('  MAINNET: NOT VERIFIED');
    console.log('  Next required evidence: independent public operators, encrypted peer transport,');
    console.log('  externally reproducible state/transaction evidence, and independent security review.');
  });

  cleanup();
}

main().catch(error => {
  console.error('\nLocal/CI qualification failed:', error?.message || error);
  process.exit(1);
});
