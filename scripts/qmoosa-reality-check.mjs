#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";

const checks = [];
const add = (name, status, evidence) => checks.push({ name, status, evidence });

function run(name, command, args) {
  try {
    const cmd = command === "npm" && process.platform === "win32" ? "npm.cmd" : command;
    execFileSync(cmd, args, { stdio: "pipe", encoding: "utf8", shell: false });
    add(name, "PASS", `${command} ${args.join(" ")}`);
  } catch (error) {
    const stdout = String(error?.stdout || "").trim();
    const stderr = String(error?.stderr || "").trim();
    const detail = (stderr || stdout || error?.message || "command failed").split("\n").slice(-8).join(" | ");
    add(name, "FAIL", detail);
  }
}

add("package.json", existsSync("package.json") ? "PASS" : "FAIL", existsSync("package.json") ? "present" : "missing");
add("README reality status", existsSync("README.md") ? "PASS" : "FAIL", existsSync("README.md") ? "present" : "missing");
add("testnet/mainnet readiness plan", existsSync("TESTNET_MAINNET_READINESS.md") ? "PASS" : "FAIL", existsSync("TESTNET_MAINNET_READINESS.md") ? "present" : "missing");
add("testnet genesis artifact", existsSync("testnet/genesis.json") ? "PASS" : "FAIL", existsSync("testnet/genesis.json") ? "present" : "missing");
add("testnet network manifest", existsSync("testnet/network-manifest.example.json") ? "PASS" : "FAIL", existsSync("testnet/network-manifest.example.json") ? "present" : "missing");
add("testnet promotion checklist", existsSync("TESTNET_PROMOTION_CHECKLIST.md") ? "PASS" : "FAIL", existsSync("TESTNET_PROMOTION_CHECKLIST.md") ? "present" : "missing");
add("testnet operator runbook", existsSync("TESTNET_OPERATOR_RUNBOOK.md") ? "PASS" : "FAIL", existsSync("TESTNET_OPERATOR_RUNBOOK.md") ? "present" : "missing");
add("testnet deployment evidence template", existsSync("testnet/DEPLOYMENT_EVIDENCE_TEMPLATE.md") ? "PASS" : "FAIL", existsSync("testnet/DEPLOYMENT_EVIDENCE_TEMPLATE.md") ? "present" : "missing");
add("testnet infrastructure specification", existsSync("testnet/INFRASTRUCTURE_SPEC.md") ? "PASS" : "FAIL", existsSync("testnet/INFRASTRUCTURE_SPEC.md") ? "present" : "missing");
add("testnet launch boundary", existsSync("testnet/LAUNCH_BOUNDARY.md") ? "PASS" : "FAIL", existsSync("testnet/LAUNCH_BOUNDARY.md") ? "present" : "missing");
add("mainnet launch boundary", existsSync("MAINNET_LAUNCH_BOUNDARY.md") ? "PASS" : "FAIL", existsSync("MAINNET_LAUNCH_BOUNDARY.md") ? "present" : "missing");

if (existsSync("testnet/genesis.json") && existsSync("testnet/network-manifest.example.json")) {
  const manifest = JSON.parse(readFileSync("testnet/network-manifest.example.json", "utf8"));
  const allowedStatus = manifest.status === "NOT_VERIFIED" || manifest.status === "DRAFT_NOT_LAUNCHED" || manifest.status === "PUBLIC_TESTNET_LIVE_TUNNEL";
  add("testnet launch claim boundary", allowedStatus ? "PASS" : "FAIL", `manifest status: ${manifest.status}`);
  const genesisRaw = readFileSync("testnet/genesis.json", "utf8").replace(/\r\n/g, "\n");
  const genesisHash = createHash("sha256").update(genesisRaw).digest("hex");
  const hashMatches = manifest.genesis_sha256 === genesisHash;
  add("testnet genesis hash integrity", hashMatches ? "PASS" : "FAIL", hashMatches ? genesisHash : `manifest=${manifest.genesis_sha256}; actual=${genesisHash}`);
}

if (existsSync("README.md")) {
  const readme = readFileSync("README.md", "utf8");
  const honest = /NOT PUBLIC TESTNET OR MAINNET/.test(readme);
  add("deployment claim boundary", honest ? "PASS" : "FAIL", honest ? "README distinguishes prototype from public Testnet/Mainnet" : "README status boundary missing");
}

run("truth", "npm", ["run", "check:truth"]);
run("lint", "npm", ["run", "lint"]);
run("test", "npm", ["test"]);
run("build", "npm", ["run", "build"]);

const failed = checks.filter((x) => x.status === "FAIL");
const status = failed.length ? "NOT VERIFIED" : "VERIFIED PASS";
console.log(JSON.stringify({ mode: "REALITY_MODE", project: "Republic-of-Divine-Light / pq-rdl-blockchain", checks, status }, null, 2));
process.exit(failed.length ? 1 : 0);