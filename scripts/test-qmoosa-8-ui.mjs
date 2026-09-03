#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
const r=spawnSync(process.execPath,['scripts/verify-qmoosa-8-ui.mjs'],{stdio:'inherit'});
process.exit(r.status??1);
