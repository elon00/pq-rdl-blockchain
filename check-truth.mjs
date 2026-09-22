import fs from "node:fs";
import path from "node:path";

// Reality-mode truth scanner: reject concrete fabricated runtime metrics/claims,
// not generic product/UI language such as "post-quantum".
function collectSourceFiles(root) {
  const result = [];
  if (!fs.existsSync(root)) return result;
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(?:ts|tsx|js|jsx|mjs|md)$/.test(entry.name)) result.push(full);
    }
  };
  walk(root);
  return result;
}

const scanFiles = [
  "README.md",
  "server.ts",
  ...collectSourceFiles("src"),
  ...collectSourceFiles("services"),
];
const forbidden = [
  { pattern: /activeNodes\s*:\s*148\b/, reason: "hard-coded active-node metric" },
  { pattern: /tps\s*:\s*1840\b/, reason: "hard-coded TPS metric" },
  { pattern: /networkHashrate\s*:\s*['"]14\.2 QFLOPS['"]/, reason: "hard-coded hashrate metric" },
  { pattern: /(?:NIST\s+Level\s*[0-9]|security\s+level)\b[^\n]{0,120}CRYSTALS-Dilithium/i, reason: "unsupported legacy PQC security claim" },
  { pattern: /\b(?:[1-9][0-9]{2,}|[1-9][0-9]{3,})\s*(?:TPS|transactions?\s+per\s+second)\b/i, reason: "unsupported measured TPS claim" },
  { pattern: /\b(?:[1-9][0-9]{2,})\s+(?:active\s+nodes?|validators?)\b/i, reason: "unsupported live-node count" },
  { pattern: /\b(?:[1-9][0-9]?\.?[0-9]*)\s*QFLOPS\b/i, reason: "unsupported network hashrate claim" },
  { pattern: /\b1840\s*TPS\b/i, reason: "fabricated TPS fallback" },
  { pattern: /\b3\s+Verified\s+Pools\b/i, reason: "synthetic pools presented as verified" },
  { pattern: /Confirmed\s+on\s+[`'"]?RDL-TESTNET-001/i, reason: "local simulation presented as public-testnet settlement" },
  { pattern: /Transaction\s+propagated\s+to\s+100%[^\n]{0,80}184ms/i, reason: "synthetic propagation metric" },
  { pattern: /TLS\s+Handshake[^\n]{0,80}PASS/i, reason: "plaintext authenticated transport presented as TLS" },
  { pattern: /Security\s+Guarantee\s*:/i, reason: "unaudited cryptographic implementation presented as a guarantee" },
  { pattern: /status\s*:\s*['"]CONFIRMED['"]/i, reason: "in-memory simulation state presented as confirmed settlement" },
  { pattern: /\bPUBLIC\s+TESTNET\s+VERIFIED\b/i, reason: "public-testnet claim requires independent deployment evidence" }
];

let failed = false;
for (const file of scanFiles) {
  if (!fs.existsSync(file)) continue;
  const body = fs.readFileSync(file, "utf8");
  for (const rule of forbidden) {
    if (rule.pattern.test(body)) {
      console.error(`TRUTH CHECK FAIL: ${file}: ${rule.reason}`);
      console.error(`  pattern: ${rule.pattern}`);
      failed = true;
    }
  }
}

if (failed) process.exit(1);
console.log(`TRUTH CHECK PASS (${scanFiles.length} files scanned)`);