import fs from "node:fs";
const files=["README.md","server.ts"];
const forbidden=[/activeNodes:\s*148/,/tps:\s*1840/,/networkHashrate:\s*'14\.2 QFLOPS'/];
let failed=false;
for(const file of files){if(!fs.existsSync(file))continue;const body=fs.readFileSync(file,"utf8");for(const rule of forbidden){if(rule.test(body)){console.error(`TRUTH CHECK FAIL: ${file} matches ${rule}`);failed=true}}}
if(failed)process.exit(1);
console.log("TRUTH CHECK PASS");
