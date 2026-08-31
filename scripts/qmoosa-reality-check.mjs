#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
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

if (existsSync("README.md")) {
  const readme = readFileSync("README.md", "utf8");
  const honest = /NOT PUBLIC TESTNET OR MAINNET/.test(readme);
  add("deployment claim boundary", honest ? "PASS" : "FAIL", honest ? "README distinguishes devnet from public Testnet/Mainnet" : "README status boundary missing");
}

run("truth", "npm", ["run", "check:truth"]);
run("lint", "npm", ["run", "lint"]);
run("test", "npm", ["test"]);
run("build", "npm", ["run", "build"]);

const failed = checks.filter((x) => x.status === "FAIL");
const status = failed.length ? "NOT VERIFIED" : "VERIFIED PASS";
console.log(JSON.stringify({ mode: "REALITY_MODE", project: "Republic-of-Divine-Light / pq-rdl-blockchain", checks, status }, null, 2));
process.exit(failed.length ? 1 : 0);
