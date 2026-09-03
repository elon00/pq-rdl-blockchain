#!/usr/bin/env node
import fs from 'node:fs';

const required = [
  ['token', 'QMS Token & Coin'], ['staking', 'Staking'], ['governance', 'Governance / DAO'],
  ['nodes', 'Node Operator'], ['analytics', 'Network Analytics'], ['bridge', 'Cross-Chain / Bridge'],
  ['identity', 'Digital Identity'], ['settings', 'Settings & Network Control'],
];
const files = ['src/App.tsx','src/components/Navbar.tsx','src/components/QMoosaModuleView.tsx','scripts/test-qmoosa-8-ui.mjs'];
let ok = true;
for (const f of files) { if (!fs.existsSync(f)) { console.log(`❌ MISSING FILE: ${f}`); ok = false; } }
if (ok) {
  const app = fs.readFileSync('src/App.tsx','utf8');
  const nav = fs.readFileSync('src/components/Navbar.tsx','utf8');
  const view = fs.readFileSync('src/components/QMoosaModuleView.tsx','utf8');
  const tabMatch = app.match(/const moduleTabs\s*=\s*\[(.*?)\]/s);
  const tabs = tabMatch ? [...tabMatch[1].matchAll(/['\"]([a-z0-9-]+)['\"]/g)].map(m => m[1]) : [];
  for (const [id,title] of required) {
    const appHook = id === 'nodes' ? /activeTab\s*===\s*['"]nodes['"]/.test(app) : tabs.includes(id) && app.includes('QMoosaModuleView');
    const navHook = new RegExp(`id:\s*['"]${id}['"]`).test(nav);
    const viewHook = new RegExp(`\b${id}:\s*\{`).test(view);
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
