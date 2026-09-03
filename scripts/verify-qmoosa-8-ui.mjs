#!/usr/bin/env node
import fs from 'node:fs';

const required = [
  ['token', 'QMS Token & Coin'],
  ['staking', 'Staking'],
  ['governance', 'Governance / DAO'],
  ['nodes', 'Node Operator'],
  ['analytics', 'Network Analytics'],
  ['bridge', 'Cross-Chain / Bridge'],
  ['identity', 'Digital Identity'],
  ['settings', 'Settings & Network Control'],
];

const files = [
  'src/App.tsx',
  'src/components/Navbar.tsx',
  'src/components/QMoosaModuleView.tsx',
  'scripts/test-qmoosa-8-ui.mjs',
];

let ok = true;
for (const file of files) {
  if (!fs.existsSync(file)) {
    console.error(`❌ MISSING FILE: ${file}`);
    ok = false;
  }
}

if (ok) {
  const app = fs.readFileSync('src/App.tsx', 'utf8');
  const nav = fs.readFileSync('src/components/Navbar.tsx', 'utf8');
  const view = fs.readFileSync('src/components/QMoosaModuleView.tsx', 'utf8');

  for (const [id, title] of required) {
    const route = id === 'nodes'
      ? app.includes("activeTab==='nodes'&&<PeerMeshView/>")
      : app.includes("moduleTabs.includes(activeTab)") && app.includes(`'${id}'`);
    const navEntry = nav.includes(`{ id: '${id}',`);
    const viewEntry = view.includes(`${id}:`);
    const found = route && navEntry && viewEntry;
    console.log(`${found ? '✅' : '❌'} ${id} — ${title}`);
    if (!found) ok = false;
  }

  const synchronized =
    view.includes('chainState') &&
    view.includes('blocks') &&
    view.includes('contracts') &&
    view.includes('wallet');
  console.log(`${synchronized ? '✅' : '❌'} shared state synchronization`);
  if (!synchronized) ok = false;
}

console.log(ok ? 'QMOOSA 8-UI GATE: PASS' : 'QMOOSA 8-UI GATE: FAIL');
process.exit(ok ? 0 : 1);
