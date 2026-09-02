#!/usr/bin/env node
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

console.log("📦 Building RDL Versioned Release Artifacts (v0.1.0-testnet)...");

execSync("cargo build --release --workspace", { stdio: "inherit" });

const outDir = "release/v0.1.0-testnet";
mkdirSync(outDir, { recursive: true });

const targetDir = "target/release";
const binaryNames = ["rdl-node", "rdl-node.exe"];
const copiedFiles = [];

for (const name of binaryNames) {
  const p = join(targetDir, name);
  if (existsSync(p)) {
    const dest = join(outDir, name);
    const data = readFileSync(p);
    writeFileSync(dest, data);
    copiedFiles.push(name);
  }
}

const genesisData = readFileSync("testnet/genesis.json");
writeFileSync(join(outDir, "genesis.json"), genesisData);
copiedFiles.push("genesis.json");

const checksums = [];
for (const f of copiedFiles) {
  const data = readFileSync(join(outDir, f));
  const hash = createHash("sha256").update(data).digest("hex");
  checksums.push(`${hash}  ${f}`);
}

const checksumFile = join(outDir, "SHA256SUMS");
writeFileSync(checksumFile, checksums.join("\n") + "\n");

console.log("\n✅ Release artifacts generated in " + outDir + ":");
console.log(readFileSync(checksumFile, "utf8"));
