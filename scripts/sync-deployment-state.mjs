#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";

console.log("🏛️ RDL BLOCKCHAIN — CANONICAL DEPLOYMENT STATE SYNCHRONIZER");
console.log("=============================================================");

let gitCommit = "unknown";
let gitBranch = "master";
try {
  gitCommit = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  gitBranch = execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { encoding: "utf8" }).trim();
} catch {}

let pkgVersion = "0.0.0";
try {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  pkgVersion = pkg.version || pkgVersion;
} catch {}

let genesisHash = null;
const genesisPath = "testnet/genesis.json";
if (existsSync(genesisPath)) {
  const raw = readFileSync(genesisPath, "utf8").replace(/\r\n/g, "\n");
  genesisHash = createHash("sha256").update(raw).digest("hex");
}

let nodes = [];
let topologyClassification = "UNKNOWN";
if (existsSync("artifacts/multi-node-topology.json")) {
  try {
    const topo = JSON.parse(readFileSync("artifacts/multi-node-topology.json", "utf8"));
    nodes = Array.isArray(topo.nodes) ? topo.nodes : [];
    topologyClassification = topo.classification || topologyClassification;
  } catch {}
}

let manifest = {};
try {
  manifest = JSON.parse(readFileSync("testnet/network-manifest.example.json", "utf8"));
} catch {}

const status = manifest.status || "NOT_VERIFIED";
const consensus = manifest.consensus || "PoS+BFT_DESIGN_TARGET";

const canonicalState = {
  synchronizedAt: new Date().toISOString(),
  mode: "REALITY_MODE",
  git: {
    commit: gitCommit,
    branch: gitBranch,
    repo: "https://github.com/elon00/pq-rdl-blockchain"
  },
  network: {
    chainId: manifest.chain_id || "RDL-TESTNET-001",
    version: pkgVersion,
    genesisSha256: genesisHash,
    classification: topologyClassification,
    consensus,
    status,
    rule: "Network status is copied from the manifest/reality evidence state; this synchronizer never promotes an unverified network to live status."
  },
  nodes
};

mkdirSync("artifacts", { recursive: true });
writeFileSync("artifacts/deployment-state.json", JSON.stringify(canonicalState, null, 2));
mkdirSync("src/config", { recursive: true });
writeFileSync("src/config/networkState.json", JSON.stringify(canonicalState, null, 2));

console.log(`✅ Git Commit:     ${gitCommit.slice(0, 12)}`);
console.log(`✅ Genesis SHA256: ${genesisHash ? genesisHash.slice(0, 16) + "..." : "NOT_AVAILABLE"}`);
console.log(`✅ Status:         ${status}`);
console.log(`✅ Consensus:      ${consensus}`);
console.log("✅ Synchronized:   artifacts/deployment-state.json");
console.log("✅ Synchronized:   src/config/networkState.json");
console.log("=============================================================");
