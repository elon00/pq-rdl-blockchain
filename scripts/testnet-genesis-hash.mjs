#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const path = "testnet/genesis.json";
const bytes = readFileSync(path);
const sha256 = createHash("sha256").update(bytes).digest("hex");
console.log(JSON.stringify({ artifact: path, sha256 }, null, 2));
