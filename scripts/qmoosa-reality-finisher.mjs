#!/usr/bin/env node
import { execSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";

const stages = [
  ["DISCOVER", "node -e \"console.log(JSON.stringify({package:require('./package.json').name, node:process.version}))\""],
  ["CLASSIFY", "node -e \"console.log('prototype: blockchain + Conway automation + AI-assisted workflows + PQC research')\""],
  ["AUDIT", "npm run check:truth"],
  ["FIX", "node -e \"console.log('No automatic destructive fixes; failures remain evidence until explicitly fixed.')\""],
  ["TEST", "npm test"],
  ["VERIFY", "npm run build"],
];

const results=[];
for (const [stage, command] of stages) {
  try {
    execSync(command,{stdio:"inherit"});
    results.push({stage,status:"PASS",evidence:command});
  } catch (error) {
    results.push({stage,status:"FAIL",evidence:command});
    writeFileSync("qmoosa-reality-report.json", JSON.stringify({mode:"REALITY_MODE",results,status:"FAILED"},null,2));
    process.exit(1);
  }
}
const deployEvidence = existsSync("DEPLOYMENT_EVIDENCE.json");
results.push({
  stage:"DEPLOY",
  status:deployEvidence ? "EVIDENCE_PRESENT" : "NOT_VERIFIED",
  evidence:deployEvidence ? "DEPLOYMENT_EVIDENCE.json" : "No machine-verifiable deployment evidence"
});
results.push({stage:"REPORT",status:"COMPLETE",evidence:"qmoosa-reality-report.json"});
const status = deployEvidence ? "VERIFIED PASS" : "NOT VERIFIED FOR DEPLOYMENT";
writeFileSync("qmoosa-reality-report.json", JSON.stringify({mode:"REALITY_MODE",results,status},null,2));
console.log("\nQMOOSA REALITY MODE:",status);
