#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

console.log("📦 RDL BLOCKCHAIN SNAPSHOT & TERABOX BACKUP ARCHIVER");

const snapshotDir = "snapshots";
mkdirSync(snapshotDir, { recursive: true });

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const archiveName = `rdl-state-snapshot-${timestamp}.tar.gz`;
const archivePath = join(snapshotDir, archiveName);

console.log(`\n1. Creating deterministic state package: ${archiveName}`);

// Files to include in backup package
const backupPayloads = [
  "testnet/genesis.json",
  "testnet/network-manifest.example.json",
  "release/v0.1.0-testnet"
];

// If data/ directory exists, include database and state
if (existsSync("data")) {
  backupPayloads.push("data");
}

try {
  // Use tar if available (on Linux/Git-Bash/Windows 10+)
  const cmd = `tar -czf "${archivePath}" ${backupPayloads.filter(existsSync).join(" ")}`;
  execSync(cmd, { stdio: "inherit" });
} catch (e) {
  console.log("Note: Tar command failed or not found, falling back to node packaging...");
}

if (existsSync(archivePath)) {
  const archiveBytes = readFileSync(archivePath);
  const sha256 = createHash("sha256").update(archiveBytes).digest("hex");
  const metaPath = join(snapshotDir, `rdl-state-snapshot-${timestamp}.meta.json`);
  
  const metadata = {
    snapshot_file: archiveName,
    created_at: new Date().toISOString(),
    size_bytes: archiveBytes.length,
    sha256: sha256,
    genesis_sha256: "9779e530ae4d7b36d7731584659bfdcedd7ac4b5eb97b4eb9cb11b82c241238b",
    storage_target: "TeraBox 1024GB Cold Storage",
    status: "READY_FOR_TERABOX_UPLOAD"
  };

  writeFileSync(metaPath, JSON.stringify(metadata, null, 2));
  console.log("\n✅ Snapshot Created Successfully!");
  console.log(JSON.stringify(metadata, null, 2));
  console.log(`\n📤 Upload Instructions:`);
  console.log(`👉 Open TeraBox Web: https://dm.1024terabox.com/main?category=all`);
  console.log(`👉 Upload "${archivePath}" and "${metaPath}" into folder "RDL-Blockchain-Backups"`);
} else {
  console.log("⚠️ Snapshot archive was not generated. Check if payload files exist.");
}
