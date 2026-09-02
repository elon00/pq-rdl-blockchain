#!/usr/bin/env node
/**
 * QMoosa Public Testnet Reality Gate
 * Fails closed: repository text or generated evidence can never substitute
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

const checks = required.map(([name,path]) => ({name,path,present:existsSync(path)}));
const manifestPath="testnet/network-manifest.example.json";
let manifest=null;
try { manifest=JSON.parse(readFileSync(manifestPath,"utf8")); }
catch { checks.push({name:"manifest",path:manifestPath,present:false}); }

const genesisPath="testnet/genesis.json";
let genesisSha256=null;
if (existsSync(genesisPath)) {
  genesisSha256=createHash("sha256").update(readFileSync(genesisPath)).digest("hex");
  checks.push({name:"genesisHash",expected:manifest?.genesis_sha256 ?? null,actual:genesisSha256,present:manifest?.genesis_sha256===genesisSha256});
}

const endpointCount=Array.isArray(manifest?.bootstrap_endpoints)?manifest.bootstrap_endpoints.length:0;
checks.push({name:"bootstrapEndpoints",count:endpointCount,present:endpointCount>=2});
checks.push({name:"independentAdministration",present:false,reason:"must be proven by external operator/deployment evidence, not repository text"});
checks.push({name:"realStateSync",present:false,reason:"must be reproducible from independently running nodes"});
checks.push({name:"realTransactionSettlement",present:false,reason:"must include independently verifiable transaction/state-transition evidence"});
checks.push({name:"restartRecovery",present:false,reason:"must include reproducible restart/recovery evidence"});

const missing=checks.filter(c=>!c.present).map(c=>c.name);
const verified=missing.length===0;
const report={
  mode:"REALITY_MODE",
  verdict:verified?"PUBLIC_TESTNET_VERIFIED":"NOT_VERIFIED",
  generated_at:new Date().toISOString(),
  genesis_sha256:genesisSha256,
  checks,
  missing
};
writeFileSync("qmoosa-public-testnet-reality-report.json",JSON.stringify(report,null,2));
console.log("\nQMOOSA PUBLIC TESTNET REALITY GATE:",report.verdict);
if (!verified) {
  console.error("Missing independent evidence:",missing.join(", "));
  process.exit(2);
}
