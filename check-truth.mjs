import fs from "node:fs";
import path from "node:path";

// Reality-mode truth scanner: reject concrete fabricated runtime metrics/claims,
// not generic product/UI language such as "post-quantum".
const scanFiles = ["README.md", "server.ts", ...collectSourceFiles("src")];
const forbidden = [
  { pattern: /activeNodes\s*:\s*148\b/, reason: "hard-coded active-node metric" },
  { pattern: /tps\s*:\s*1840\b/, reason: "hard-coded TPS metric" },
  { pattern: /networkHashrate\s*:\s*['\"]14\.2 QFLOPS['\"]/, reason: "hard-coded hashrate metric" },
  { pattern: /(?:NIST\s+Level\s*[0-9]|security\s+level)\b[^\n]{0,120}CRYSTALS-Dilithium/i, reason: "unsupported legacy PQC security claim" },
  { pattern: /\b(?:[1-9][0-9]{2,}|[1-9][0-9]{3,})\s*(?:TPS|transactions?\s+per\s+second)\b/i, reason: "unsupported measured TPS claim" },
  { pattern: /\b(?:[1-9][0-9]{2,})\s+(?:active\s+nodes?|validators?)\b/i, reason: "unsupported live-node count" },
  { pattern: /\b(?:[1-9][0-9]?\.?[0-9]*)\s*QFLOPS\b/i, reason: "unsupported network hashrate claim" },
];

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