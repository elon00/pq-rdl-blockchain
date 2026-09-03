#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import process from 'node:process';
const isWindows=process.platform==='win32';
const npmLauncher=isWindows?(process.env.ComSpec||'cmd.exe'):'npm';
function run(label,command,args){console.log(`\n⚡ ${label}`);const r=spawnSync(command,args,{stdio:'inherit',shell:false,cwd:process.cwd(),windowsHide:true});if(r.error){console.error(`❌ ${label}: ${r.error.message}`);process.exitCode=r.status||1;return false;}if(r.status!==0){console.error(`❌ ${label}: exit ${r.status}`);process.exitCode=r.status||1;return false;}console.log(`✅ ${label}`);return true;}
function runNpm(script){return isWindows?run(`npm:${script}`,npmLauncher,['/d','/s','/c',`npm run ${script}`]):run(`npm:${script}`,'npm',['run',script]);}
console.log('🏛️ QMOOSA SINGLE MASTER FINISH-ALL\n===================================');
console.log('Reality mode: run UI, code, security, local-network and public-reality gates; never invent evidence.');
const steps=[
 ()=>runNpm('qmoosa:ui:verify'),
 ()=>runNpm('qmoosa:ui:test'),
 ()=>runNpm('qmoosa:master:finish'),
 ()=>runNpm('finish:all'),
];
let passed=0;for(const step of steps){if(step())passed++;else break;}
console.log(`\n🏁 MASTER FINISH-ALL SUMMARY\nAutomated pipelines passed: ${passed}/${steps.length}`);
if(process.exitCode)console.log('Overall automated verdict: FAIL — see exact failed stage above.');else console.log('Overall automated pipelines: PASS; public Testnet/Mainnet status remains whatever the reality gates prove.');
