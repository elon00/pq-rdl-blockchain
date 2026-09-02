#!/usr/bin/env node
import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";

console.log("🏛️ RDL BLOCKCHAIN — CANONICAL DEPLOYMENT STATE SYNCHRONIZER");
console.log("=============================================================");

// 1. Extract Git Metadata
let gitCommit = "unknown";
let gitBranch = "master";
try {
  gitCommit = execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
  gitBranch = execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf8" }).trim();
} catch {}

// 2. Extract Package Version
let pkgVersion = "0.1.0";
try {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  pkgVersion = pkg.version || "0.1.0";
} catch {}

// 3. Compute Deterministic Genesis SHA-256
let genesisHash = "unknown";
const genesisPath = "testnet/genesis.json";
if (existsSync(genesisPath)) {
  const raw = readFileSync(genesisPath, "utf8").replace(/\r\n/g, "\n");
  genesisHash = createHash("sha256").update(raw).digest("hex");
}

// 4. Read Multi-Node Topology
let activeNodes = [];
let topologyClassification = "MULTI_REGION_DISTRIBUTED_TESTNET";
if (existsSync("artifacts/multi-node-topology.json")) {
  try {
    const topo = JSON.parse(readFileSync("artifacts/multi-node-topology.json", "utf8"));
    activeNodes = topo.nodes || [];
    topologyClassification = topo.classification || topologyClassification;
  } catch {}
}

const canonicalState = {
  synchronizedAt: new Date().toISOString(),
  git: {
    commit: gitCommit,
    branch: gitBranch,
    repo: "https://github.com/elon00/pq-rdl-blockchain"
  },
  network: {
    chainId: "RDL-TESTNET-001",
    version: pkgVersion,
    genesisSha256: genesisHash,
    classification: topologyClassification,
    consensus: "Conway Proof-of-Automaton (PoA) + Dilithium2/SPHINCS+",
    status: "TESTNET_LIVE_CANONICAL"
  },
  nodes: activeNodes
};

// 5. Write to Canonical Artifacts
mkdirSync("artifacts", { recursive: true });
writeFileSync("artifacts/deployment-state.json", JSON.stringify(canonicalState, null, 2));

mkdirSync("src/config", { recursive: true });
writeFileSync("src/config/networkState.json", JSON.stringify(canonicalState, null, 2));

console.log(`✅ Git Commit:     ${gitCommit.slice(0, 10)} (${gitBranch})`);
console.log(`✅ Genesis SHA256: ${genesisHash.slice(0, 16)}...`);
console.log(`✅ Synchronized:   artifacts/deployment-state.json`);
console.log(`✅ Synchronized:   src/config/networkState.json`);
console.log("=============================================================");