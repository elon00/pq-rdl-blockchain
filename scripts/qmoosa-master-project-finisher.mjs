#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
const isWin=process.platform==="win32";
const npmCmd=isWin?(process.env.ComSpec||"cmd.exe"):"npm";
const npmArgs=s=>isWin?["/d","/s","/c",`npm run ${s}`]:["run",s];
const steps=[
 ["truth",npmCmd,npmArgs("check:truth")],
 ["8-ui-verify",npmCmd,npmArgs("qmoosa:ui:verify")],
 ["8-ui-test",npmCmd,npmArgs("qmoosa:ui:test")],
 ["typescript",npmCmd,npmArgs("lint")],
 ["frontend-server-build",npmCmd,npmArgs("build")],
 ["rust-tests","cargo",["test","--workspace","--all-targets"]],
 ["rust-clippy","cargo",["clippy","--workspace","--all-targets","--","-D","warnings"]],
 ["local-multinode-smoke",isWin?"bash.exe":"bash",["scripts/multi-node-smoke.sh"]],
 ["public-testnet-reality",process.execPath,["scripts/public-testnet-reality-gate.mjs"]]
];
const results=[];
function runStep(name,cmd,args){console.log(`\n⚡ ${name}`);const r=spawnSync(cmd,args,{encoding:"utf8",shell:false,stdio:["ignore","pipe","pipe"],windowsHide:true});const out=[(r.stdout??"").toString(),(r.stderr??"").toString()].filter(Boolean).join("\n").trim();if(r.error){console.log("❌ FAIL — process could not start\n"+r.error.message);results.push({name,status:"FAIL",output:r.error.message});return;}const ok=r.status===0;console.log(ok?"✅ PASS":`❌ FAIL (exit ${r.status})`);if(!ok){console.log("----- REAL ERROR OUTPUT -----\n"+(out.slice(-8000)||"(no output)")+"\n-----------------------------");}results.push({name,status:ok?"PASS":"FAIL",exitCode:r.status,output:out.slice(-8000)});}
console.log("🏛️ QMOOSA MASTER PROJECT FINISHER\n=================================\nReality mode: verify first, report exact failures, never fake evidence.");
for(const s of steps)runStep(...s);
mkdirSync("artifacts",{recursive:true});
const localCore=["truth","8-ui-verify","8-ui-test","typescript","frontend-server-build","rust-tests","rust-clippy"].every(n=>results.find(r=>r.name===n)?.status==="PASS");
const smoke=results.find(r=>r.name==="local-multinode-smoke")?.status==="PASS";
const testnet=results.find(r=>r.name==="public-testnet-reality")?.status==="PASS";
const failedSteps=results.filter(r=>r.status==="FAIL").map(r=>r.name);
writeFileSync("artifacts/qmoosa-master-finisher-report.json",JSON.stringify({generatedAt:new Date().toISOString(),mode:"REALITY_MODE",localCore,localMultiNodeSmoke:smoke,testnetVerified:testnet,mainnetVerified:false,ui8Verified:results.find(r=>r.name==="8-ui-verify")?.status==="PASS",ui8SmokeTest:results.find(r=>r.name==="8-ui-test")?.status==="PASS",failedSteps,results,rule:"Automate verification; never invent public-network evidence."},null,2));
console.log("\n🏁 QMOOSA MASTER VERDICT");console.log("8-UI:",results.find(r=>r.name==="8-ui-verify")?.status==="PASS"?"VERIFIED":"NOT_VERIFIED");console.log("Local project:",localCore?"PASS":"FAIL");console.log("Local 3-node smoke:",smoke?"PASS":"FAIL");console.log("Public testnet:",testnet?"VERIFIED":"NOT_VERIFIED");console.log("Mainnet: NOT_VERIFIED (requires real independent production evidence)");if(failedSteps.length)console.log("Failed steps:",failedSteps.join(", "));process.exit(localCore&&smoke&&testnet?0:2);
