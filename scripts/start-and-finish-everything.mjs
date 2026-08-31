#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const stages = ["DISCOVER", "CLASSIFY", "AUDIT", "FIX", "TEST", "VERIFY", "DEPLOY", "REPORT"];
console.log("🧙 QMOOSA MASTER OPERATING SYSTEM");
console.log("⚡ START AND FINISH EVERYTHING");
for (const stage of stages) console.log(`→ ${stage}`);

console.log("\nRunning project Reality Mode checks...");
const result = spawnSync(process.execPath, ["scripts/qmoosa-reality-check.mjs"], { stdio: "inherit" });

if (result.status !== 0) {
  console.error("\n❌ NOT VERIFIED — one or more machine-verifiable checks failed.");
  process.exit(result.status ?? 1);
}

console.log("\n✅ VERIFIED PASS — all configured local verification gates passed.");
console.log("⚠️ Deployment, public-chain settlement, external security/legal review and other external evidence remain VERIFIED only when independently evidenced.");
