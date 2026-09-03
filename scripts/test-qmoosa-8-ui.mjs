#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const verify = spawnSync(process.execPath, ['scripts/verify-qmoosa-8-ui.mjs'], { stdio: 'inherit' });
if (verify.status !== 0) process.exit(verify.status ?? 1);

const checks = [
  ['App integration', 'src/App.tsx'],
  ['Navbar integration', 'src/components/Navbar.tsx'],
  ['Shared module view', 'src/components/QMoosaModuleView.tsx'],
];
let ok = true;
for (const [label, file] of checks) {
  const pass = spawnSync(process.execPath, ['-e', `require('fs').accessSync(${JSON.stringify(file)})`], { stdio: 'ignore' }).status === 0;
  console.log(`${pass ? '✅' : '❌'} ${label}`);
  ok = ok && pass;
}
console.log(ok ? 'QMOOSA 8-UI SMOKE TEST: PASS' : 'QMOOSA 8-UI SMOKE TEST: FAIL');
process.exit(ok ? 0 : 1);
