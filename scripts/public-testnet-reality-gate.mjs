#!/usr/bin/env node
/**
 * QMoosa Public Testnet Reality Gate
 * Fails closed: repository text or placeholder evidence can never substitute
 * for independently reproducible live-network evidence.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

const required = [
  ["genesis", "testnet/genesis.json"],
  ["persistentLedger", "evidence/PERSISTENT_LEDGER.json"],
  ["p2pNetwork", "evidence/P2P_NETWORK.json"],
  ["consensus", "evidence/CONSENSUS.json"],
  ["multiNode", "evidence/MULTINODE_TESTNET.json"],
  ["deployment", "DEPLOYMENT_EVIDENCE.json"],
];

function readJson(path) {
  try { return JSON.parse(readFileSync(path, "utf8")); } catch { return null; }
}

function nonPlaceholderValue(value) {
  if (value === null || value === undefined || value === false) return false;
  if (typeof value === "string") {
    const normalized = value.trim().toUpperCase();
    return normalized.length > 0 && !/(TODO|TBD|PLACEHOLDER|EXAMPLE|GENERATE_WITH|NOT_VERIFIED|SIMULATION|DEMO|FAKE)/.test(normalized);
  }
  if (Array.isArray(value)) return value.length > 0 && value.every(nonPlaceholderValue);
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

const checks = required.map(([name, path]) => {
  const present = existsSync(path);
  const data = present ? readJson(path) : null;
  const structurallyUsable = present && data && typeof data === "object" && Object.keys(data).length > 0;
  return { name, path, present: structurallyUsable, placeholderRejected: present && !structurallyUsable };
});

const manifestPath = "testnet/network-manifest.example.json";
const manifest = readJson(manifestPath);
checks.push({ name: "manifest", path: manifestPath, present: !!manifest && typeof manifest === "object" });

const genesisPath = "testnet/genesis.json";
let genesisSha256 = null;
if (existsSync(genesisPath)) {
  genesisSha256 = createHash("sha256").update(readFileSync(genesisPath)).digest("hex");
}
checks.push({
  name: "genesisHash",
  expected: manifest?.genesis_sha256 ?? null,
  actual: genesisSha256,
  present: Boolean(genesisSha256 && manifest?.genesis_sha256 === genesisSha256),
});

const endpoints = Array.isArray(manifest?.bootstrap_endpoints) ? manifest.bootstrap_endpoints : [];
const validEndpoints = endpoints.filter((url) => {
  if (typeof url !== "string" || !/^https?:\/\//i.test(url)) return false;
  return nonPlaceholderValue(url);
});
checks.push({ name: "bootstrapEndpoints", count: validEndpoints.length, present: validEndpoints.length >= 2 });

const proofChecks = [
  ["independentAdministration", "independently administered node/operator identities"],
  ["realStateSync", "reproducible state synchronization between independently running nodes"],
  ["realTransactionSettlement", "externally verifiable transaction/state transition"],
  ["restartRecovery", "reproducible restart and recovery sequence"],
];
for (const [name, reason] of proofChecks) {
  const presentEvidence = checks.find((c) => ["multiNode", "deployment"].includes(c.name) && c.present);
  checks.push({
    name,
    present: false,
    reason: `${reason}; not inferable from file presence alone`,
    linkedEvidencePresent: Boolean(presentEvidence),
  });
}

const missing = checks.filter(c => !c.present).map(c => c.name);
const verified = missing.length === 0;
const report = {
  mode: "REALITY_MODE",
  verdict: verified ? "PUBLIC_TESTNET_VERIFIED" : "NOT_VERIFIED",
  generated_at: new Date().toISOString(),
  genesis_sha256: genesisSha256,
  checks,
  missing,
  rule: "Only independently reproducible live-network evidence can promote a prototype to Public Testnet.",
};
writeFileSync("qmoosa-public-testnet-reality-report.json", JSON.stringify(report, null, 2));
console.log("\nQMOOSA PUBLIC TESTNET REALITY GATE:", report.verdict);
if (!verified) {
  console.error("Missing independent evidence:", missing.join(", "));
  process.exit(2);
}