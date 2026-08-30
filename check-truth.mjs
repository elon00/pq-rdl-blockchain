import fs from "node:fs";
const files=["README.md","server.ts"];
const forbidden=[
  /activeNodes:\s*148/,
  /tps:\s*1840/,
  /networkHashrate:\s*'14\.2 QFLOPS'/,
  /NIST Level [0-9].*CRYSTALS-Dilithium/,
  /Sign a payload with Post-Quantum signature/,
  /Verify a Post-Quantum signature/
];
let failed=false;
for(const file of files){if(!fs.existsSync(file))continue;const body=fs.readFileSync(file,"utf8");for(const rule of forbidden){if(rule.test(body)){console.error(`TRUTH CHECK FAIL: ${file} matches ${rule}`);failed=true}}}
if(failed)process.exit(1);
console.log("TRUTH CHECK PASS");
