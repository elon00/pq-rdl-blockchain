#!/usr/bin/env node
import fs from 'node:fs';
const required=['token','staking','governance','nodes','analytics','bridge','identity','settings'];
const files=['src/App.tsx','src/components/Navbar.tsx','src/components/QMoosaModuleView.tsx'];
let ok=true;
for(const f of files){if(!fs.existsSync(f)){console.error('MISSING FILE:',f);ok=false;}}
if(ok){
 const app=fs.readFileSync('src/App.tsx','utf8');
 const nav=fs.readFileSync('src/components/Navbar.tsx','utf8');
 const view=fs.readFileSync('src/components/QMoosaModuleView.tsx','utf8');
 for(const id of required){
  const found=app.includes("activeTab === '"+id+"'") && nav.includes("id: '"+id+"'") && view.includes(id+":{");
  console.log(found?'✅':'❌',id);
  if(!found) ok=false;
 }
}
console.log(ok?'QMOOSA 8-UI GATE: PASS':'QMOOSA 8-UI GATE: FAIL');
process.exit(ok?0:1);
