#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";

const checks = [];
const add = (name, status, evidence) => checks.push({ name, status, evidence });

function run(name, command, args) {
  try {
    execFileSync(command, args, { stdio: "pipe", encoding: "utf8" });
    add(name, "PASS", `${command} ${args.join(" ")}`);
  } catch (error) {
    const message = String(error?.stderr || error?.message || "command failed").split("\n")[0].trim();
    add(name, "FAIL", message || `${command} ${args.join(" ")}`);
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
add("testnet status boundary", existsSync("testnet/network-manifest.example.json") ? "PASS" : "FAIL", existsSync("testnet/network-manifest.example.json") ? "manifest present for status validation" : "manifest missing");

if (existsSync("testnet/genesis.json") && existsSync("testnet/network-manifest.example.json")) {
  const manifest = JSON.parse(readFileSync("testnet/network-manifest.example.json", "utf8"));
  const validDraftStatus = manifest.status === "DRAFT_NOT_LAUNCHED";
  add("testnet launch claim boundary", validDraftStatus ? "PASS" : "FAIL", validDraftStatus ? "draft status explicitly prevents false public-launch claim" : `unexpected manifest status: ${manifest.status}`);
  const genesisHash = createHash("sha256").update(readFileSync("testnet/genesis.json")).digest("hex");
  const hashFieldIsPlaceholder = /^GENERATE_WITH_/.test(String(manifest.genesis_sha256 || ""));
  const hashMatches = manifest.genesis_sha256 === genesisHash;
  add(
    "testnet genesis hash integrity",
    hashMatches ? "PASS" : "FAIL",
    hashMatches
      ? genesisHash
      : hashFieldIsPlaceholder
        ? `manifest still contains generator placeholder; actual SHA-256 is ${genesisHash}`
        : `manifest SHA-256 mismatch; actual SHA-256 is ${genesisHash}`,
  );
}

if (existsSync("README.md")) {
  const readme = readFileSync("README.md", "utf8");
  const honest = /NOT PUBLIC TESTNET OR MAINNET/.test(readme);
  add("deployment claim boundary", honest ? "PASS" : "FAIL", honest ? "README distinguishes devnet from public Testnet/Mainnet" : "README status boundary missing");
}

run("testnet genesis hash", "npm", ["run", "testnet:genesis-hash"]);
run("truth", "npm", ["run", "check:truth"]);
run("lint", "npm", ["run", "lint"]);
run("test", "npm", ["test"]);
run("build", "npm", ["run", "build"]);

const failed = checks.filter((x) => x.status === "FAIL");
const status = failed.length ? "NOT VERIFIED" : "VERIFIED PASS";
console.log(JSON.stringify({ mode: "REALITY_MODE", project: "Republic-of-Divine-Light / pq-rdl-blockchain", checks, status }, null, 2));
process.exit(failed.length ? 1 : 0);
