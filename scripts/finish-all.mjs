#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import https from "node:https";
import http from "node:http";

console.log("🏛️ RDL BLOCKCHAIN — UNIFIED FINISH:ALL REALITY PIPELINE");
console.log("==========================================================");

const stages = [];
const add = (name, status, details) => stages.push({ name, status, details });

function runStep(name, command, args) {
  process.stdout.write(`⏳ Running ${name}... `);
  try {
    const cmd = command === "npm" && process.platform === "win32" ? "npm.cmd" : command;
    execFileSync(cmd, args, { stdio: "pipe", encoding: "utf8", shell: process.platform === "win32" });
    console.log("✅ PASS");
    add(name, "PASS", `${command} ${args.join(" ")}`);
    return true;
  } catch (error) {
    console.log("❌ FAIL");
    const stdout = error?.stdout?.toString?.() ?? "";
    const stderr = error?.stderr?.toString?.() ?? "";
    const combined = [stdout, stderr].filter(Boolean).join("\n");
    const lines = combined.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    const detail = lines.slice(-8).join(" | ") || error?.message || `${command} ${args.join(" ")}`;
    add(name, "FAIL", detail);
    return false;
  }
}

let localPassed = true;
console.log("\n[1/3] VERIFYING LOCAL RUST & JAVASCRIPT CODEBASE:");
for (const [name, command, args] of [
  ["Rust Unit & Consensus Tests", "cargo", ["test", "--workspace", "--all-targets"]],
  ["Rust Security & Lints (Clippy)", "cargo", ["clippy", "--workspace", "--all-targets"]],
  ["QMoosa Truth Check", "npm", ["run", "check:truth"]],
  ["Canonical Deployment State Sync", "npm", ["run", "deploy:state"]],
  ["Frontend & Server Build", "npm", ["run", "build"]],
]) {
  if (!runStep(name, command, args)) localPassed = false;
}

console.log("\n[2/3] PROBING CONFIGURED CLOUD & REGIONAL NODES:");
const nodes = [
  { name: "Node 1 (Google Cloud)", role: "Public Node", url: process.env.RDL_NODE1_URL || "https://story-sunshine-schools-grateful.trycloudflare.com", provider: "Google Cloud" },
  { name: "Node 2 (Local Laptop / Dev)", role: "Local Node", url: process.env.RDL_NODE2_URL || "http://127.0.0.1:3000", provider: "Localhost" },
  { name: "Node 3 (GitHub Codespaces)", role: "Temporary Cloud Test Node", url: process.env.RDL_NODE3_URL || "https://super-telegram-45967gpjj7rhjwj9-3000.app.github.dev", provider: "GitHub Codespaces" },
];

function checkEndpoint(node) {
  return new Promise((resolve) => {
    const base = node.url.replace(/\/$/, "");
    const transport = base.startsWith("https") ? https : http;
    const started = Date.now();
    const req = transport.get(`${base}/api/health`, { timeout: 5000 }, (res) => {
      let body = "";
      res.on("data", chunk => { body += chunk; });
      res.on("end", () => {
        let health = null;
        try { health = JSON.parse(body); } catch {}
        resolve({
          ...node,
          reachable: res.statusCode === 200,
          status: res.statusCode === 200 ? "HEALTHY" : `HTTP_${res.statusCode}`,
          httpCode: res.statusCode,
          latencyMs: Date.now() - started,
          health,
        });
      });
    });
    req.on("timeout", () => { req.destroy(); resolve({ ...node, reachable: false, status: "TIMEOUT" }); });
    req.on("error", error => resolve({ ...node, reachable: false, status: "UNREACHABLE", error: error.message }));
  });
}

const probedNodes = await Promise.all(nodes.map(checkEndpoint));
for (const node of probedNodes) {
  console.log(`  ${node.reachable ? "🟢" : "🔴"} ${node.name} [${node.provider}]: ${node.status} (${node.url})`);
}

mkdirSync("artifacts", { recursive: true });
const reachableCount = probedNodes.filter(n => n.reachable).length;
const allConfiguredNodesReachable = reachableCount === probedNodes.length;
const topologyClassification = allConfiguredNodesReachable
  ? "ALL_CONFIGURED_ENDPOINTS_REACHABLE"
  : reachableCount > 0
    ? "PARTIALLY_REACHABLE"
    : "OFFLINE";

const topologyReport = {
  generatedAt: new Date().toISOString(),
  mode: "REALITY_MODE",
  classification: topologyClassification,
  reachableCount,
  totalConfiguredNodes: probedNodes.length,
  note: "HTTP health proves endpoint reachability only; it does not prove blockchain P2P, consensus, state synchronization, transaction settlement, persistence, or independent administration.",
  nodes: probedNodes,
};
writeFileSync("artifacts/multi-node-topology.json", JSON.stringify(topologyReport, null, 2));

console.log("\n[3/3] REALITY VERDICT SUMMARY:");
const evidenceGateResult = (() => {
  try {
    execFileSync(process.execPath, ["scripts/public-testnet-reality-gate.mjs"], { stdio: "inherit", shell: false });
    return true;
  } catch {
    return false;
  }
})();

console.log(`- Local Machine Gates: ${localPassed ? "✅ ALL PASS" : "❌ FAILED"}`);
console.log(`- Reachable HTTP endpoints: ${reachableCount} / ${probedNodes.length}`);
console.log(`- Endpoint topology: ${topologyClassification}`);
console.log(`- Public blockchain status: ${evidenceGateResult ? "✅ VERIFIED" : "🟡 NOT VERIFIED"}`);
console.log("- Rule: endpoint reachability alone can never promote the network to Public Testnet.\n");

if (!localPassed || !allConfiguredNodesReachable || !evidenceGateResult) {
  process.exit(2);
}