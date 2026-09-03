#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
const isWin = process.platform === "win32";
const npmCmd = isWin ? (process.env.ComSpec || "cmd.exe") : "npm";
const npmArgs = (script) => isWin ? ["/d","/s","/c",`npm run ${script}`] : ["run",script];
const steps = [
  ["truth", npmCmd, npmArgs("check:truth")],
  ["typescript", npmCmd, npmArgs("lint")],
  ["frontend-server-build", npmCmd, npmArgs("build")],
  ["rust-tests", "cargo", ["test","--workspace","--all-targets"]],
  ["rust-clippy", "cargo", ["clippy","--workspace","--all-targets","--","-D","warnings"]],
  ["local-multinode-smoke", isWin ? "bash.exe" : "bash", ["scripts/multi-node-smoke.sh"]],
  ["public-testnet-reality", process.execPath, ["scripts/public-testnet-reality-gate.mjs"]]
];
const results = [];
function runStep(name, command, args) {
  console.log("\n⚡ " + name);
  const r = spawnSync(command, args, { encoding:"utf8", shell:false, stdio:["ignore","pipe","pipe"], windowsHide:true });
  const stdout=(r.stdout??"").toString(), stderr=(r.stderr??"").toString();
  const output=[stdout,stderr].filter(Boolean).join("\n").trim();
  if(r.error){console.log("❌ FAIL — process could not start");console.log(r.error.message);results.push({name,status:"FAIL",reason:"PROCESS_START_ERROR",output:r.error.message});return false;}
  const ok=r.status===0; console.log(ok?"✅ PASS":`❌ FAIL (exit ${r.status})`);
  if(!ok){console.log("----- REAL ERROR OUTPUT -----");console.log(output.slice(-8000)||"(no output)");console.log("-----------------------------");}
  results.push({name,status:ok?"PASS":"FAIL",exitCode:r.status,signal:r.signal??null,output:output.slice(-8000)}); return ok;
}
console.log("🏛️ QMOOSA MASTER PROJECT FINISHER\n=================================\nReality mode: verify first, report exact failures, never fake evidence.");
for(const [name,command,args] of steps) runStep(name,command,args);
mkdirSync("artifacts",{recursive:true});
const localCoreNames=["truth","typescript","frontend-server-build","rust-tests","rust-clippy"];
const localCore=localCoreNames.every(n=>results.find(r=>r.name===n)?.status==="PASS");
const localSmoke=results.find(r=>r.name==="local-multinode-smoke")?.status==="PASS";
const testnet=results.find(r=>r.name==="public-testnet-reality")?.status==="PASS";
const failedSteps=results.filter(r=>r.status==="FAIL").map(r=>r.name);
const report={generatedAt:new Date().toISOString(),mode:"REALITY_MODE",localCore,localMultiNodeSmoke:localSmoke,testnetVerified:testnet,mainnetVerified:false,failedSteps,results,rule:"Automate verification; never invent public-network evidence."};
writeFileSync("artifacts/qmoosa-master-finisher-report.json",JSON.stringify(report,null,2));
console.log("\n🏁 QMOOSA MASTER VERDICT");
console.log("Local project:",localCore?"PASS":"FAIL");
console.log("Local 3-node smoke:",localSmoke?"PASS":"FAIL");
console.log("Public testnet:",testnet?"VERIFIED":"NOT_VERIFIED");
console.log("Mainnet: NOT_VERIFIED (requires real independent production evidence)");
if(failedSteps.length) console.log("Failed steps:",failedSteps.join(", "));
process.exit(localCore&&localSmoke&&testnet?0:2);
