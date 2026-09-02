#!/usr/bin/env node
import { execSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";

const stages = [
  ["DISCOVER", "node -e \"const p=require('./package.json'); console.log(JSON.stringify({package:p.name,node:process.version}))\""],
  ["CLASSIFY", "node -e \"console.log('REALITY_CHAIN: prototype-to-testnet implementation workspace')\""],
  ["AUDIT", "npm run check:truth"],
  ["FIX", "node -e \"console.log('Reality mode: no fake auto-fix; unresolved failures remain failures.')\""],
  ["TEST", "npm test"],
  ["VERIFY", "npm run build"],
  ["PUBLIC_TESTNET_GATE", "node scripts/public-testnet-reality-gate.mjs"],
];

const results=[];
let failed=false;
for (const [stage, command] of stages) {
  try {
    execSync(command,{stdio:"inherit"});
    results.push({stage,status:"PASS",evidence:command});
  } catch {
    results.push({stage,status:"FAIL",evidence:command});
    failed=true;
    if(stage!=="PUBLIC_TESTNET_GATE") break;
  }
}

const requirements = {
  persistentLedger: existsSync("evidence/PERSISTENT_LEDGER.json"),
  p2pNetwork: existsSync("evidence/P2P_NETWORK.json"),
  consensus: existsSync("evidence/CONSENSUS.json"),
  multiNodeTestnet: existsSync("evidence/MULTINODE_TESTNET.json"),
  deployment: existsSync("DEPLOYMENT_EVIDENCE.json"),
};

for (const [name, present] of Object.entries(requirements)) {
  results.push({stage:"REALITY_GATE", requirement:name, status:present?"EVIDENCE_PRESENT":"NOT_VERIFIED"});
}

const allEvidence = Object.values(requirements).every(Boolean);
const status = failed ? "NOT_VERIFIED" : allEvidence ? "TESTNET_EVIDENCE_COMPLETE" : "PROTOTYPE_OR_PARTIAL_IMPLEMENTATION";
results.push({stage:"REPORT",status:"COMPLETE"});
writeFileSync("qmoosa-reality-report.json",JSON.stringify({
  mode:"REALITY_MODE",
  status,
  results,
  requirements,
  rule:"No public testnet success claim without independently reproducible live-network evidence."
},null,2));

console.log("\nQMOOSA REALITY MODE:",status);
process.exit(failed ? 2 : 0);
