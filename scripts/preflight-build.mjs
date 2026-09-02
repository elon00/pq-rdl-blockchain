#!/usr/bin/env node
import { execFileSync } from "node:child_process";

function run(command, args) {
  const executable = command === "npm" && process.platform === "win32" ? "npm.cmd" : command;
  try {
    execFileSync(executable, args, { stdio: "inherit", shell: false });
    return true;
  } catch {
    return false;
  }
}

console.log("RDL BUILD PREFLIGHT");
const truth = run("npm", ["run", "check:truth"]);
if (!truth) process.exit(2);

// TypeScript/lint remains the authoritative type gate.
const lint = run("npm", ["run", "lint"]);
if (!lint) process.exit(2);

const build = run("npm", ["run", "build"]);
process.exit(build ? 0 : 2);