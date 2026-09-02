#!/usr/bin/env node
import { spawnSync, execFileSync, execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import https from "node:https";
import http from "node:http";

console.log("🏛️ RDL BLOCKCHAIN — UNIFIED FINISH:ALL REALITY PIPELINE");
console.log("==========================================================");

const stages = [];
const add = (name, status, details) => stages.push({ name, status, details });

// Helper to run commands
function runStep(name, command, args) {
  process.stdout.write(`⏳ Running ${name}... `);
  try {
    const cmd = command === "npm" && process.platform === "win32" ? "npm.cmd" : command;
    execFileSync(cmd, args, { stdio: "pipe", encoding: "utf8", shell: true });
    console.log("✅ PASS");
    add(name, "PASS", `${command} ${args.join(" ")}`);
    return true;
  } catch (error) {
    console.log("❌ FAIL");
    const message = String(error?.stderr || error?.message || "command failed").split("\n")[0].trim();
    add(name, "FAIL", message || `${command} ${args.join(" ")}`);
    return false;
  }
}

// 1. Local Codebase & Consensus Verification
console.log("\n[1/3] VERIFYING LOCAL RUST & JAVASCRIPT CODEBASE:");
runStep("Rust Unit & Consensus Tests", "cargo", ["test", "--workspace", "--all-targets"]);
runStep("Rust Security & Lints (Clippy)", "cargo", ["clippy", "--workspace", "--all-targets", "--", "-D", "warnings"]);
runStep("QMoosa Truth Check", "npm", ["run", "check:truth"]);
runStep("Frontend & Server Build", "npm", ["run", "build"]);

// 2. Topology and Remote Node Verification
console.log("\n[2/3] PROBING CONFIGURED CLOUD & REGIONAL NODES:");

let nodes = [
  { name: "Node 1 (Google Cloud)", role: "Public RPC / Explorer Gateway", url: "https://story-sunshine-schools-grateful.trycloudflare.com", provider: "Google Cloud Shell" },
  { name: "Node 2 (Local Laptop)", role: "Local Development Validator", url: "http://127.0.0.1:3000", provider: "Localhost" },
  { name: "Node 3 (GitHub Codespaces)", role: "8GB Cloud Validator Node", url: "https://super-telegram-45967gpjj7rhjwj9-7100.app.github.dev", provider: "GitHub Codespaces (Zero Card)" }
];

// Check public endpoints
async function checkEndpoint(node) {
  if (!node.url) {
    return { ...node, status: "NOT_CONFIGURED", reachable: false, note: "Operator account setup pending" };
  }
  return new Promise((resolve) => {
    try {
      const client = node.url.startsWith("https") ? https : http;
      const req = client.get(`${node.url}/api/health`, { timeout: 4000 }, (res) => {
        let data = "";
        res.on("data", chunk => data += chunk);
        res.on("end", () => {
          const ok = res.statusCode === 200;
          resolve({ ...node, status: ok ? "HEALTHY" : `HTTP_${res.statusCode}`, reachable: ok, httpCode: res.statusCode });
        });
      });
      req.on("error", (e) => {
        resolve({ ...node, status: "UNREACHABLE", reachable: false, error: e.message });
      });
      req.on("timeout", () => {
        req.destroy();
        resolve({ ...node, status: "TIMEOUT", reachable: false });
      });
    } catch (err) {
      resolve({ ...node, status: "ERROR", reachable: false, error: err.message });
    }
  });
}

async function main() {
  const probedNodes = await Promise.all(nodes.map(checkEndpoint));

  for (const n of probedNodes) {
    const icon = n.reachable ? "🟢" : n.status === "NOT_CONFIGURED" ? "⚪" : "🟡";
    console.log(`  ${icon} ${n.name} [${n.provider}]: ${n.status} (${n.url || "none"})`);
  }

  // Write multi-node topology evidence
  const topologyReport = {
    generatedAt: new Date().toISOString(),
    mode: "REALITY_MODE",
    classification: "MULTI_REGION_DISTRIBUTED_TESTNET",
    governanceNotice: "Nodes operated under developer setup. Independent third-party validator consortium required before Mainnet.",
    nodes: probedNodes
  };
  writeFileSync("artifacts/multi-node-topology.json", JSON.stringify(topologyReport, null, 2));

  // 3. Summary & Final Verdict
  console.log("\n[3/3] REALITY VERDICT SUMMARY:");
  const localPassed = stages.every(s => s.status === "PASS");
  const reachableCount = probedNodes.filter(n => n.reachable).length;

  console.log(`- Local Machine Gates: ${localPassed ? "✅ ALL PASS" : "❌ FAILED"}`);
  console.log(`- Active Reachable Nodes: ${reachableCount} / ${probedNodes.length}`);
  console.log(`- Network Topology: Multi-Region Testnet (${reachableCount > 0 ? "LIVE" : "OFFLINE"})`);
  console.log(`- Mainnet Independence: PENDING (Multi-party independent validator keys required)\n`);

  console.log("📄 Evidence written to: artifacts/multi-node-topology.json");
  if (!localPassed) {
    process.exit(1);
  }
}

main();