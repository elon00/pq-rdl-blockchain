#!/usr/bin/env node
/**
 * QMOOSA MASTER PROJECT FINISHER
 * One command orchestrator. It verifies; it never fabricates deployment evidence.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

const steps = [
  ["truth", "npm", ["run","check:truth"]],
  ["typescript", "npm", ["run","lint"]],
  ["frontend-server-build", "npm", ["run","build"]],
  ["rust-tests", "cargo", ["test","--workspace","--all-targets"]],
  ["rust-clippy", "cargo", ["clippy","--workspace","--all-targets","--","-D","warnings"]],
  ["local-multinode", "bash", ["scripts/multi-node-smoke.sh"]],
  ["public-testnet-reality", process.execPath, ["scripts/public-testnet-reality-gate.mjs"]],
];

const results=[];
for (const [name,cmd,args] of steps) {
  process.stdout.write("\n⚡ "+name+" ... ");
  try {
    const command = cmd==="npm" && process.platform==="win32" ? "npm.cmd" : cmd;
    execFileSync(command,args,{stdio:"pipe",shell:false});
    console.log("PASS");
    results.push({name,status:"PASS"});
  } catch (e) {
    console.log("NOT_VERIFIED_OR_FAIL");
    results.push({name,status:"FAIL",exitCode:e.status ?? null});
  }
}
mkdirSync("artifacts",{recursive:true});
const localCore=results.slice(0,6).every(r=>r.status==="PASS");
const testnet=results.find(r=>r.name==="public-testnet-reality")?.status==="PASS";
const report={generatedAt:new Date().toISOString(),mode:"REALITY_MODE",localCore,testnetVerified:testnet,mainnetVerified:false,results,rule:"This finisher automates checks and evidence collection but never invents cloud nodes, independent validators, or mainnet proof."};
writeFileSync("artifacts/qmoosa-master-finisher-report.json",JSON.stringify(report,null,2));
console.log("\n🏁 QMOOSA MASTER VERDICT");
console.log("Local project:",localCore?"PASS":"FAIL");
console.log("Public testnet:",testnet?"VERIFIED":"NOT_VERIFIED");
console.log("Mainnet: NOT_VERIFIED (requires real independent production evidence)");
process.exit(localCore && testnet ? 0 : 2);
