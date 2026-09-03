#!/usr/bin/env node
import fs from 'node:fs';
const required = [
  ['token', 'QMS Token & Coin'], ['staking', 'Staking'], ['governance', 'Governance / DAO'],
  ['nodes', 'Node Operator'], ['analytics', 'Network Analytics'], ['bridge', 'Cross-Chain / Bridge'],
  ['identity', 'Digital Identity'], ['settings', 'Settings & Network Control'],
];
const files=['src/App.tsx','src/components/Navbar.tsx','src/components/QMoosaModuleView.tsx','scripts/test-qmoosa-8-ui.mjs'];
let ok=true;
for(const f of files){if(!fs.existsSync(f)){console.error(`❌ MISSING FILE: ${f}`);ok=false;}}
if(ok){
 const app=fs.readFileSync(files[0],'utf8'), nav=fs.readFileSync(files[1],'utf8'), view=fs.readFileSync(files[2],'utf8');
 for(const [id,title] of required){
  const appHook=id==='nodes' ? app.includes("activeTab==='nodes'") : app.includes(`'${id}'`) && app.includes('moduleTabs');
  const navHook=nav.includes(`{ id: '${id}',`);
  const viewHook=view.includes(`${id}:`);
  const found=appHook&&navHook&&viewHook;
  console.log(`${found?'✅':'❌'} ${id} — ${title}`); if(!found) ok=false;
 }
 const sync=['chainState','blocks','contracts','wallet'].every(k=>view.includes(k));
 console.log(`${sync?'✅':'❌'} shared state synchronization`); if(!sync)ok=false;
}
console.log(ok?'QMOOSA 8-UI GATE: PASS':'QMOOSA 8-UI GATE: FAIL');
process.exit(ok?0:1);
