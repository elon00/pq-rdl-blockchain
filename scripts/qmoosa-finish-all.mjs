#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import process from 'node:process';

const isWindows = process.platform === 'win32';
const npmLauncher = isWindows ? (process.env.ComSpec || 'cmd.exe') : 'npm';

function run(label, command, args) {
  console.log(`\n⚡ ${label}`);
  console.log(`   command: ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, { stdio: 'inherit', shell: false, cwd: process.cwd() });
  if (result.error) {
    console.error(`❌ ${label}: ${result.error.message}`);
    process.exitCode = result.status || 1;
    return false;
  }
  if (result.status !== 0) {
    console.error(`❌ ${label}: exit ${result.status}`);
    process.exitCode = result.status || 1;
    return false;
  }
  console.log(`✅ ${label}`);
  return true;
}

function runNpm(script) {
  return isWindows
    ? run(`npm:${script}`, npmLauncher, ['/d', '/s', '/c', `npm run ${script}`])
    : run(`npm:${script}`, 'npm', ['run', script]);
}

function runNodeScript(label, path) {
  return run(label, process.execPath, [path]);
}

console.log('🏛️ QMOOSA SINGLE MASTER FINISH-ALL');
console.log('===================================');
console.log('Reality mode: run all automated gates; never invent public-network evidence.');

const steps = [
  () => runNpm('qmoosa:master:finish'),
  () => runNpm('finish:all'),
];

let passed = 0;
for (const step of steps) {
  if (step()) passed += 1;
  else break;
}

console.log('\n🏁 MASTER FINISH-ALL SUMMARY');
console.log(`Automated pipelines passed: ${passed}/${steps.length}`);
if (process.exitCode) {
  console.log('Overall automated verdict: FAIL — see exact failed stage above.');
} else {
  console.log('Overall automated pipelines: PASS');
  console.log('Public Testnet/Mainnet status remains whatever the reality gate proves.');
}
