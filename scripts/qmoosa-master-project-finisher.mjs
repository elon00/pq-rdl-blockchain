#!/usr/bin/env node
/**
 * QMOOSA MASTER PROJECT FINISHER
 * One command orchestrator. It verifies; it never fabricates deployment evidence.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

const isWin = process.platform === "win32";
const npmCmd = isWin ? "npm.cmd" : "npm";
const steps = [
  ["truth", npmCmd, ["run", "check:truth"]],
  ["typescript", npmCmd, ["run", "lint"]],
  ["frontend-server-build", npmCmd, ["run", "build"]],
  ["rust-tests", "cargo", ["test", "--workspace", "--all-targets"]],
  ["rust-clippy", "cargo", ["clippy", "--workspace", "--all-targets", "--", "-D", "warnings"]],
  ["local-multinode-smoke", isWin ? "bash.exe" : "bash", ["scripts/multi-node-smoke.sh"]],
  ["public-testnet-reality", process.execPath, ["scripts/public-testnet-reality-gate.mjs"]],
];

const results = [];
function runStep(name, command, args) {
  process.stdout.write(`\n⚡ ${name} ... `);
  try {
    const output = execFileSync(command, args, { encoding: "utf8", shell: false });
    console.log("PASS");
    results.push({ name, status: "PASS", output: output.trim().slice(-4000) });
    return true;
  } catch (e) {
    const output = [e?.stdout?.toString?.() ?? "", e?.stderr?.toString?.() ?? ""].filter(Boolean).join("\n").trim();
    console.log("FAIL");
    if (output) console.log(output.slice(-4000));
    results.push({ name, status: "FAIL", exitCode: e?.status ?? null, output: output.slice(-4000) });
    return false;
  }
}

console.log("🏛️ QMOOSA MASTER PROJECT FINISHER");
console.log("=================================");
for (const [name, command, args] of steps) {
  const ok = runStep(name, command, args);
  if (!ok && name !== "public-testnet-reality") break;
}

mkdirSync("artifacts", { recursive: true });
const localCore = ["truth", "typescript", "frontend-server-build", "rust-tests", "rust-clippy"]
  .every((name) => results.find((r) => r.name === name)?.status === "PASS");
const localSmoke = results.find((r) => r.name === "local-multinode-smoke")?.status === "PASS";
const testnet = results.find((r) => r.name === "public-testnet-reality")?.status === "PASS";
const report = {
  generatedAt: new Date().toISOString(),
  mode: "REALITY_MODE",
  localCore,
  localMultiNodeSmoke: localSmoke,
  testnetVerified: testnet,
  mainnetVerified: false,
  results,
  networkSemantics: {
    localMultiNodeSmoke: "Three local node processes/TLS sockets; not external validator independence.",
    publicTestnetVerification: "Requires independently reproducible live-node evidence and the public-testnet reality gate.",
    mainnetVerification: "Requires production deployment, security review, independent operators, and mainnet-specific evidence."
  },
  mainnetBlockers: [
    "Production genesis/release evidence",
    "Independent validator/operator administration",
    "Production persistence and backup/restore evidence",
    "Real P2P and consensus evidence",
    "Real transaction settlement and state synchronization evidence",
    "Restart/recovery evidence",
    "Security review/audit and operational controls"
  ],
  rule: "The finisher automates verification and evidence collection but never invents cloud nodes, independent validators, or mainnet proof.",
};
writeFileSync("artifacts/qmoosa-master-finisher-report.json", JSON.stringify(report, null, 2));

console.log("\n🏁 QMOOSA MASTER VERDICT");
console.log("Local project:", localCore ? "PASS" : "FAIL");
console.log("Local 3-node smoke:", localSmoke ? "PASS" : "FAIL");
console.log("Public testnet:", testnet ? "VERIFIED" : "NOT_VERIFIED");
console.log("Mainnet: NOT_VERIFIED (requires real independent production evidence)");
process.exit(localCore && testnet ? 0 : 2);
