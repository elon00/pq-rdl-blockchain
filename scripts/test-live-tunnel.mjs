import https from "node:https";
import { readFileSync, existsSync } from "node:fs";

let url = null;
if (existsSync("artifacts/active-tunnel-url.txt")) {
  url = readFileSync("artifacts/active-tunnel-url.txt", "utf8").trim();
} else if (existsSync("artifacts/public-rpc-evidence.json")) {
  try {
    const ev = JSON.parse(readFileSync("artifacts/public-rpc-evidence.json", "utf8"));
    url = ev.endpoint_url;
  } catch (e) {}
}

if (!url) {
  console.log("❌ No active tunnel URL found. Please start the tunnel first!");
  console.log("👉 Run: npm run start:tunnel OR double-click START-PQ-RDL-TUNNEL.bat");
  process.exit(1);
}

console.log("==============================================================");
console.log("🧪 TESTING LIVE PQ-RDL PUBLIC TESTNET GATEWAY");
console.log(`🔗 Target URL: ${url}`);
console.log("==============================================================\n");

function fetchJson(path) {
  return new Promise((resolve, reject) => {
    https.get(`${url}${path}`, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          if (data.includes("1033") || data.includes("Tunnel error")) {
            reject(new Error(`HTTP ${res.statusCode} (Error 1033: Tunnel is OFFLINE - please start npm run start:tunnel in another window)`));
          } else {
            resolve({ status: res.statusCode, raw: data.slice(0, 150) });
          }
        }
      });
    }).on("error", reject);
  });
}

async function runTests() {
  const tests = [
    { name: "Faucet Status", path: "/api/faucet/status" },
    { name: "Tokens Engine", path: "/api/tokens" },
    { name: "Blockchain Blocks", path: "/api/blocks" },
    { name: "Network Telemetry", path: "/api/network" },
  ];

  for (const t of tests) {
    try {
      const res = await fetchJson(t.path);
      console.log(`✅ [${t.name}] HTTP ${res.status} SUCCESS:`);
      if (res.data) {
        console.log("   " + JSON.stringify(res.data).slice(0, 120) + "...\n");
      } else {
        console.log("   " + res.raw + "...\n");
      }
    } catch (err) {
      console.log(`❌ [${t.name}] FAILED: ${err.message}\n`);
    }
  }

  console.log("==============================================================");
  console.log("🎉 Test completed.");
  console.log("==============================================================");
}

runTests();
