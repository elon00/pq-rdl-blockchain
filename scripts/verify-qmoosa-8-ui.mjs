#!/usr/bin/env node
import fs from 'node:fs';

const required = [
  ['token', 'RDL Token & Coin'], ['staking', 'Staking'], ['governance', 'Governance / DAO'],
  ['nodes', 'Node Operator'], ['analytics', 'Network Analytics'], ['bridge', 'Cross-Chain / Bridge'],
  ['identity', 'Digital Identity'], ['settings', 'Settings & Network Control'],
];
const files = ['src/App.tsx','src/components/Navbar.tsx','src/components/QMoosaModuleView.tsx','scripts/test-qmoosa-8-ui.mjs'];
let ok = true;
for (const f of files) if (!fs.existsSync(f)) { console.log(`❌ MISSING FILE: ${f}`); ok = false; }

if (ok) {
  const app = fs.readFileSync(files[0],'utf8');
  const nav = fs.readFileSync(files[1],'utf8');
  const view = fs.readFileSync(files[2],'utf8');

  for (const [id,title] of required) {
    const appHook = new RegExp(`['"]${id}['"]`).test(app) && app.includes('QMoosaModuleView');
    const navHook = new RegExp(`id:\\s*['"]${id}['"]`).test(nav);
    const viewHook = new RegExp(`\\b${id}:\\s*\\{`).test(view);
    const found = appHook && navHook && viewHook;
    console.log(`${found ? '✅' : '❌'} ${id} — ${title}`);
    if (!found) ok = false;
  }

  const synchronized = ['chainState','blocks','contracts','wallet'].every(k => view.includes(k));
  console.log(`${synchronized ? '✅' : '❌'} shared state synchronization`);
  if (!synchronized) ok = false;
}
console.log(ok ? 'QMOOSA 8-UI GATE: PASS' : 'QMOOSA 8-UI GATE: FAIL');
process.exit(ok ? 0 : 1);
