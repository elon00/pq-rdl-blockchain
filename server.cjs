var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express2 = __toESM(require("express"), 1);

// src/server/runtimeSecurity.ts
var import_express = __toESM(require("express"), 1);
var import_node_crypto = require("node:crypto");
var PROTECTED_POSTS = /* @__PURE__ */ new Set([
  "/api/blockchain/mine",
  "/api/blockchain/deploy-contract",
  "/api/tokens/create",
  "/api/tokens/transfer",
  "/api/tokens/mint",
  "/api/faucet/dispense",
  "/api/gemini/smart-contract-copilot",
  "/api/automaton/step"
]);
var SERVER_KEYGEN_PATH = "/api/quantum/generate-keypair";
function secureTokenEquals(header, token) {
  const expected = Buffer.from(`Bearer ${token}`);
  const actual = Buffer.from(header || "");
  return expected.length === actual.length && (0, import_node_crypto.timingSafeEqual)(expected, actual);
}
function allowedOrigins() {
  const configured = (process.env.RDL_CORS_ALLOWED_ORIGINS || "").split(",").map((x) => x.trim()).filter(Boolean);
  if (process.env.APP_URL?.trim()) configured.push(process.env.APP_URL.trim());
  return new Set(configured);
}
function positiveInt(raw, fallback, min, max) {
  const value = Number(raw);
  return Number.isInteger(value) && value >= min && value <= max ? value : fallback;
}
function applyRuntimeSecurity(app) {
  const production = process.env.NODE_ENV === "production";
  const simulationEnabled = process.env.RDL_ENABLE_SIMULATION_API === "true";
  const adminToken = process.env.RDL_ADMIN_TOKEN?.trim() || "";
  const origins = allowedOrigins();
  const maxBodyKb = positiveInt(process.env.RDL_MAX_JSON_BODY_KB, 256, 16, 1024);
  const requestsPerMinute = positiveInt(process.env.RDL_API_REQUESTS_PER_MINUTE, 120, 10, 1e4);
  if (production && simulationEnabled && (adminToken.length < 32 || /^change[_-]?me/i.test(adminToken))) {
    throw new Error("RDL_ADMIN_TOKEN must be a non-placeholder secret of at least 32 characters when production simulation APIs are enabled");
  }
  app.disable("x-powered-by");
  app.use(import_express.default.json({ limit: `${maxBodyKb}kb` }));
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    const origin = req.headers.origin;
    if (origin) {
      if (origins.has(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Vary", "Origin");
        res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      } else if (production) {
        return res.status(403).json({ error: "origin not allowed" });
      }
    }
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });
  const buckets = /* @__PURE__ */ new Map();
  let lastBucketSweep = 0;
  app.use("/api", (req, res, next) => {
    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || "unknown";
    if (now - lastBucketSweep >= 6e4) {
      for (const [entryKey, entry] of buckets) {
        if (now - entry.startedAt >= 12e4) buckets.delete(entryKey);
      }
      lastBucketSweep = now;
    }
    let bucket = buckets.get(key);
    if (!bucket) {
      if (buckets.size >= 1e4) {
        return res.status(429).json({ error: "rate-limit capacity reached; retry later" });
      }
      bucket = { startedAt: now, count: 0 };
      buckets.set(key, bucket);
    } else if (now - bucket.startedAt >= 6e4) {
      bucket = { startedAt: now, count: 0 };
      buckets.set(key, bucket);
    }
    bucket.count += 1;
    if (bucket.count > requestsPerMinute) {
      return res.status(429).json({ error: "rate limit exceeded" });
    }
    next();
  });
  app.use((req, res, next) => {
    if (!production || req.method !== "POST") return next();
    const path2 = req.path.replace(/\/+$/, "") || "/";
    if (path2 === SERVER_KEYGEN_PATH) {
      return res.status(403).json({
        error: "server-side private-key generation is disabled in production; generate keys in a trusted client or offline environment"
      });
    }
    if (!PROTECTED_POSTS.has(path2)) return next();
    if (!simulationEnabled) {
      return res.status(503).json({
        error: "simulation mutation API is disabled in production",
        mode: "READ_ONLY_PRODUCTION_PREVIEW"
      });
    }
    if (!secureTokenEquals(req.headers.authorization, adminToken)) {
      return res.status(401).json({ error: "unauthorized" });
    }
    next();
  });
}

// server.ts
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);

// src/lib/pqCrypto.ts
var import_ml_dsa = require("@noble/post-quantum/ml-dsa.js");
var import_sha2 = require("@noble/hashes/sha2.js");
var te = new TextEncoder();
var hex = (b) => Array.from(b, (byte) => byte.toString(16).padStart(2, "0")).join("");
var bytes = (h) => {
  const normalized = h.replace(/^0x/, "").toLowerCase();
  if (normalized.length % 2 !== 0 || !/^[0-9a-f]*$/.test(normalized)) {
    throw new Error("invalid hexadecimal input");
  }
  const out = new Uint8Array(normalized.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = Number.parseInt(normalized.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
};
async function sha256Hex(message) {
  return hex((0, import_sha2.sha256)(te.encode(message)));
}
function requireMLDSA(algorithm) {
  if (algorithm !== "Dilithium2") {
    throw new Error(`${algorithm} is disabled: this API currently supports only real NIST FIPS 204 ML-DSA-65. Legacy names Falcon-512/SPHINCS+ are not silently simulated.`);
  }
}
async function generatePQKeypair(algorithm, _seedPhrase) {
  requireMLDSA(algorithm);
  if (_seedPhrase) throw new Error("Seed phrases are disabled for real key generation; CSPRNG entropy is required.");
  const k = import_ml_dsa.ml_dsa65.keygen();
  const publicKeyHex = hex(k.publicKey);
  const privateKeyHex = hex(k.secretKey);
  const address = `pq1mldsa65${hex((0, import_sha2.sha256)(k.publicKey)).slice(0, 38)}`;
  return {
    algorithm,
    address,
    publicKeyHex,
    privateKeyHex,
    securityLevel: "NIST FIPS 204 ML-DSA-65 (algorithm implementation; not a FIPS 140 module validation claim)",
    createdAt: Date.now()
  };
}
async function signPQPayload(payload, keypair) {
  requireMLDSA(keypair.algorithm);
  const message = te.encode(payload);
  const signature = import_ml_dsa.ml_dsa65.sign(message, bytes(keypair.privateKeyHex));
  return {
    algorithm: keypair.algorithm,
    signatureHex: hex(signature),
    publicKeyHex: keypair.publicKeyHex,
    hashMessage: hex((0, import_sha2.sha256)(message)),
    timestamp: Date.now(),
    valid: true
  };
}
async function verifyPQSignature(payload, signature, publicKeyHex) {
  try {
    requireMLDSA(signature.algorithm);
    if (signature.publicKeyHex.replace(/^0x/, "").toLowerCase() !== publicKeyHex.replace(/^0x/, "").toLowerCase()) return false;
    const message = te.encode(payload);
    if (signature.hashMessage.replace(/^0x/, "").toLowerCase() !== hex((0, import_sha2.sha256)(message))) return false;
    return import_ml_dsa.ml_dsa65.verify(bytes(signature.signatureHex), message, bytes(publicKeyHex));
  } catch {
    return false;
  }
}

// src/lib/conwayEngine.ts
var GRID_ROWS = 24;
var GRID_COLS = 32;
function createEmptyGrid(rows = GRID_ROWS, cols = GRID_COLS) {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
}
function computeGridEntropy(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  let population = 0;
  let activeTransitions = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 1) {
        population++;
      }
      if (c < cols - 1 && grid[r][c] !== grid[r][c + 1]) activeTransitions++;
      if (r < rows - 1 && grid[r][c] !== grid[r + 1][c]) activeTransitions++;
    }
  }
  const totalCells = rows * cols;
  const p1 = population / totalCells;
  const p0 = 1 - p1;
  let shannon = 0;
  if (p1 > 0) shannon -= p1 * Math.log2(p1);
  if (p0 > 0) shannon -= p0 * Math.log2(p0);
  const transitionRate = activeTransitions / (2 * totalCells);
  const totalEntropy = Number((shannon * 50 + transitionRate * 50).toFixed(2));
  return { entropy: totalEntropy, population };
}
function stepConwayGrid(currentGrid) {
  const rows = currentGrid.length;
  const cols = currentGrid[0].length;
  const nextGrid = createEmptyGrid(rows, cols);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let liveNeighbors = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = (r + dr + rows) % rows;
          const nc = (c + dc + cols) % cols;
          liveNeighbors += currentGrid[nr][nc];
        }
      }
      const currentState = currentGrid[r][c];
      if (currentState === 1) {
        if (liveNeighbors === 2 || liveNeighbors === 3) {
          nextGrid[r][c] = 1;
        } else {
          nextGrid[r][c] = 0;
        }
      } else {
        if (liveNeighbors === 3) {
          nextGrid[r][c] = 1;
        } else {
          nextGrid[r][c] = 0;
        }
      }
    }
  }
  return nextGrid;
}
function generateRandomGrid(density = 0.25, rows = GRID_ROWS, cols = GRID_COLS) {
  const grid = createEmptyGrid(rows, cols);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      grid[r][c] = Math.random() < density ? 1 : 0;
    }
  }
  return grid;
}
async function mineConwayBlock(seedGrid, requiredGenerations = 10, targetEntropyThreshold = 35) {
  let currentGrid = seedGrid.map((row) => [...row]);
  let totalEntropy = 0;
  let nonce = Math.floor(Math.random() * 1e6);
  for (let gen = 0; gen < requiredGenerations; gen++) {
    currentGrid = stepConwayGrid(currentGrid);
    const { entropy } = computeGridEntropy(currentGrid);
    totalEntropy += entropy;
  }
  const avgEntropy = Number((totalEntropy / requiredGenerations).toFixed(2));
  const proofString = JSON.stringify({
    seed: seedGrid.slice(0, 5),
    final: currentGrid.slice(0, 5),
    generations: requiredGenerations,
    entropy: avgEntropy,
    nonce
  });
  const hash = await sha256Hex(proofString);
  return {
    initialSeed: seedGrid,
    finalGrid: currentGrid,
    generationsRun: requiredGenerations,
    entropyScore: avgEntropy >= targetEntropyThreshold ? avgEntropy : avgEntropy + 15.5,
    nonce,
    hash: `0x${hash}`
  };
}

// src/lib/tokenEngine.ts
var CANONICAL_TESTNET_TOKENS = [
  {
    id: "tok_rdl_stablecoin_001",
    name: "RDL Stablecoin",
    symbol: "rUSD",
    decimals: 6,
    totalSupply: 1e7,
    isUnlimitedSupply: true,
    // Mintable via reserve vault deposit
    type: "STABLECOIN",
    creatorAddress: "pq1dil2genesis00000000000000000000000000000",
    contractAddress: "pq1sc_rdl_usd_stable_vault_v1",
    balances: {
      "pq1dil2genesis00000000000000000000000000000": 8e6,
      "testnet_faucet": 2e6
    },
    createdAt: 17264e8,
    pegCurrency: "USD",
    oraclePriceUsd: 1,
    reserveRatio: 100,
    collateralVault: "0xrdl_sovereign_treasury_vault_dilithium",
    automatonEvolutionYield: 5
  },
  {
    id: "tok_rdl_memecoin_002",
    name: "RDL Meme Coin",
    symbol: "RLD",
    decimals: 0,
    totalSupply: 1e12,
    isUnlimitedSupply: false,
    // Deflationary fixed supply
    type: "MEMECOIN",
    creatorAddress: "pq1dil2genesis00000000000000000000000000000",
    contractAddress: "pq1sc_rdl_meme_conway_burn_v1",
    balances: {
      "pq1dil2genesis00000000000000000000000000000": 7e11,
      "testnet_faucet": 3e11
    },
    createdAt: 17264e8,
    burnRatePercentage: 1.5,
    memeLore: "Official Sovereign RDL Meme Coin with Conway cellular automaton deflation.",
    conwayPatternSeed: "RDL-Living-Lattice-Glider-B3/S23",
    automatonEvolutionYield: 2.718
  }
];
var TokenEngine = class {
  constructor(initialTokens = CANONICAL_TESTNET_TOKENS) {
    this.tokens = structuredClone(initialTokens);
  }
  getTokens() {
    return structuredClone(this.tokens);
  }
  getTokenById(id) {
    const token = this.findToken(id);
    return token ? structuredClone(token) : void 0;
  }
  findToken(id) {
    const q = (id || "").toUpperCase();
    return this.tokens.find(
      (t) => t.id === id || t.symbol.toUpperCase() === q || t.contractAddress === id || q === "RDL-USD" && t.symbol === "rUSD" || q === "RDL-MEME" && t.symbol === "RLD"
    );
  }
  createToken(params) {
    if (!this.validAmount(params.totalSupply) || !this.validAddress(params.creatorAddress) || !Number.isInteger(params.decimals) || params.decimals < 0 || params.decimals > 18 || params.burnRatePercentage !== void 0 && (!Number.isFinite(params.burnRatePercentage) || params.burnRatePercentage < 0 || params.burnRatePercentage > 100)) {
      throw new Error("Invalid token supply, address, decimals or burn rate");
    }
    const id = `tok_${params.symbol.toLowerCase()}_${Date.now().toString(16)}`;
    const contractAddress = `pq1sc_${params.symbol.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Math.random().toString(16).slice(2, 10)}`;
    const balances = {
      [params.creatorAddress]: params.totalSupply
    };
    const newToken = {
      id,
      name: params.name,
      symbol: params.symbol.toUpperCase(),
      decimals: params.decimals,
      totalSupply: params.totalSupply,
      isUnlimitedSupply: Boolean(params.isUnlimitedSupply),
      type: params.type,
      creatorAddress: params.creatorAddress,
      contractAddress,
      balances,
      createdAt: Date.now(),
      pegCurrency: params.pegCurrency,
      oraclePriceUsd: params.oraclePriceUsd ?? (params.type === "STABLECOIN" ? 1 : void 0),
      reserveRatio: params.reserveRatio ?? (params.type === "STABLECOIN" ? 100 : void 0),
      collateralVault: params.collateralVault,
      burnRatePercentage: params.burnRatePercentage,
      memeLore: params.memeLore,
      conwayPatternSeed: params.conwayPatternSeed || "B3/S23-Living-Matrix",
      automatonEvolutionYield: params.type === "STABLECOIN" ? 5 : 1.414
    };
    this.tokens.push(newToken);
    return structuredClone(newToken);
  }
  validAmount(amount) {
    return Number.isFinite(amount) && amount > 0 && amount <= Number.MAX_SAFE_INTEGER;
  }
  validAddress(address) {
    return typeof address === "string" && address.trim().length > 0 && !["__proto__", "constructor", "prototype"].includes(address);
  }
  mintToken(tokenId, recipientAddress, amount) {
    const token = this.findToken(tokenId);
    if (!token) return { success: false, error: "Token not found" };
    if (!token.isUnlimitedSupply) {
      return { success: false, error: "Token has fixed supply; minting is disabled." };
    }
    if (!this.validAmount(amount) || !this.validAddress(recipientAddress)) return { success: false, error: "Invalid amount or recipient" };
    if (!this.validAmount(token.totalSupply + amount) || !this.validAmount((token.balances[recipientAddress] || 0) + amount)) return { success: false, error: "Balance or supply overflow" };
    token.totalSupply += amount;
    token.balances[recipientAddress] = (token.balances[recipientAddress] || 0) + amount;
    return { success: true, newTotalSupply: token.totalSupply };
  }
  transferToken(tokenId, senderAddress, receiverAddress, amount) {
    const token = this.findToken(tokenId);
    if (!token) return { success: false, error: "Token not found" };
    if (!this.validAmount(amount) || !this.validAddress(senderAddress) || !this.validAddress(receiverAddress)) return { success: false, error: "Invalid amount or address" };
    if (senderAddress !== receiverAddress && !this.validAmount((token.balances[receiverAddress] || 0) + amount)) return { success: false, error: "Balance overflow" };
    if (token.burnRatePercentage !== void 0 && (!Number.isFinite(token.burnRatePercentage) || token.burnRatePercentage < 0 || token.burnRatePercentage > 100)) return { success: false, error: "Invalid burn rate" };
    const senderBalance = token.balances[senderAddress] || 0;
    if (senderBalance < amount) {
      return { success: false, error: `Insufficient balance. Available: ${senderBalance} ${token.symbol}` };
    }
    let transferAmount = amount;
    let burnedAmount = 0;
    if (token.type === "MEMECOIN" && token.burnRatePercentage && token.burnRatePercentage > 0) {
      burnedAmount = amount * token.burnRatePercentage / 100;
      transferAmount = amount - burnedAmount;
      token.totalSupply -= burnedAmount;
    }
    token.balances[senderAddress] = senderBalance - amount;
    token.balances[receiverAddress] = (token.balances[receiverAddress] || 0) + transferAmount;
    return { success: true, transferredAmount: transferAmount, burnedAmount };
  }
  claimFaucet(tokenId, recipientAddress, amount) {
    const token = this.findToken(tokenId);
    if (!token) return { success: false, amountClaimed: 0, error: "Token not found" };
    if (!this.validAmount(amount) || !this.validAddress(recipientAddress) || recipientAddress === "testnet_faucet") {
      return { success: false, amountClaimed: 0, error: "Invalid amount or recipient" };
    }
    const faucetBalance = token.balances["testnet_faucet"] || 0;
    if (faucetBalance < amount) return { success: false, amountClaimed: 0, error: "Faucet has insufficient funds" };
    const nextBalance = (token.balances[recipientAddress] || 0) + amount;
    if (!this.validAmount(nextBalance)) return { success: false, amountClaimed: 0, error: "Balance overflow" };
    const claimAmount = amount;
    token.balances["testnet_faucet"] -= claimAmount;
    token.balances[recipientAddress] = nextBalance;
    return { success: true, amountClaimed: claimAmount };
  }
  getBalancesForAddress(address) {
    return this.tokens.map((t) => ({
      token: structuredClone(t),
      balance: t.balances[address] || 0
    }));
  }
  updateConwayEntropy(entropy) {
    for (const t of this.tokens) {
      if (t.type === "STABLECOIN") {
        t.reserveRatio = Number((100 + (entropy - 42) * 0.05).toFixed(2));
      } else if (t.type === "MEMECOIN") {
        t.automatonEvolutionYield = Number((entropy * 0.1).toFixed(3));
      }
    }
  }
};
var tokenEngine = new TokenEngine();

// src/lib/faucetEngine.ts
var FaucetEngine = class {
  constructor(tokens = tokenEngine) {
    this.tokens = tokens;
    this.claims = [];
    this.lastClaimByAddress = /* @__PURE__ */ new Map();
    this.pending = /* @__PURE__ */ new Set();
    this.COOLDOWN_MS = 60 * 1e3;
  }
  // Local demo cooldown; not a production abuse-control system
  async dispense(recipientAddress, dropType = "ALL") {
    if (!recipientAddress || recipientAddress.trim().length < 8) {
      return { success: false, error: "Please specify a valid post-quantum recipient address (e.g. pq1dil2...)" };
    }
    recipientAddress = recipientAddress.trim();
    if (!["ALL", "NATIVE", "STABLECOIN", "MEMECOIN"].includes(dropType) || recipientAddress === "testnet_faucet") {
      return { success: false, error: "Invalid faucet request" };
    }
    if (this.pending.has(recipientAddress)) return { success: false, error: "Claim already pending" };
    const now = Date.now();
    const lastClaim = this.lastClaimByAddress.get(recipientAddress);
    if (lastClaim && now - lastClaim < this.COOLDOWN_MS) {
      const waitSecs = Math.ceil((this.COOLDOWN_MS - (now - lastClaim)) / 1e3);
      return { success: false, error: `Anti-spam cooldown active: please wait ${waitSecs} seconds before requesting another faucet drop.` };
    }
    let nativeCoins = 0;
    let stablecoinAmount = 0;
    let memecoinAmount = 0;
    if (dropType === "ALL" || dropType === "NATIVE") {
      nativeCoins = 50;
    }
    if (dropType === "ALL" || dropType === "STABLECOIN") {
      stablecoinAmount = 1e3;
    }
    if (dropType === "ALL" || dropType === "MEMECOIN") {
      memecoinAmount = 1e7;
    }
    this.pending.add(recipientAddress);
    try {
      const conwayNonce = Math.floor(Math.random() * 1e5);
      const hashPayload = `FAUCET_DROP_${recipientAddress}_${nativeCoins}_${stablecoinAmount}_${memecoinAmount}_${now}_${conwayNonce}`;
      const txHash = `0xfaucet_${await sha256Hex(hashPayload)}`;
      const drops = [
        ["tok_rdl_stablecoin_001", stablecoinAmount],
        ["tok_rdl_memecoin_002", memecoinAmount]
      ];
      for (const [id, amount] of drops) {
        if (!amount) continue;
        const token = this.tokens.getTokenById(id);
        if (!token || (token.balances.testnet_faucet || 0) < amount || (token.balances[recipientAddress] || 0) + amount > Number.MAX_SAFE_INTEGER) {
          return { success: false, error: "Faucet has insufficient funds or recipient balance overflow" };
        }
      }
      for (const [id, amount] of drops) {
        if (amount) {
          const result = this.tokens.claimFaucet(id, recipientAddress, amount);
          if (!result.success) return { success: false, error: result.error };
        }
      }
      const claim = {
        txHash,
        recipientAddress,
        nativeCoins,
        stablecoinAmount,
        memecoinAmount,
        timestamp: now,
        conwayProofNonce: conwayNonce,
        status: "SIMULATED"
      };
      this.claims.unshift(claim);
      this.lastClaimByAddress.set(recipientAddress, now);
      return { success: true, claim };
    } finally {
      this.pending.delete(recipientAddress);
    }
  }
  getRecentClaims() {
    return this.claims.slice(0, 10);
  }
  getStats() {
    return {
      totalDispensations: this.claims.length,
      totalNativeDispensed: this.claims.reduce((acc, c) => acc + c.nativeCoins, 0),
      totalStablecoinDispensed: this.claims.reduce((acc, c) => acc + c.stablecoinAmount, 0),
      totalMemecoinDispensed: this.claims.reduce((acc, c) => acc + c.memecoinAmount, 0),
      remainingDailyAllowance: 0
      // No daily allowance accounting is implemented.
    };
  }
};
var faucetEngine = new FaucetEngine();

// server.ts
import_dotenv.default.config();
var ai = process.env.GEMINI_API_KEY ? new import_genai.GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
}) : null;
async function startServer() {
  const app = (0, import_express2.default)();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
  applyRuntimeSecurity(app);
  const DATA_DIR = process.env.RDL_WEB_DATA_DIR ? import_path.default.resolve(process.env.RDL_WEB_DATA_DIR) : import_path.default.join(process.cwd(), "data");
  import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
  const LEDGER_FILE = import_path.default.join(DATA_DIR, "rdl-ledger-chain.json");
  const createPrototypeGenesis = () => {
    const timestamp = 17264e8;
    const hash = "0xd1ba8eb5003434c08d7f447c2a0f17fa297264c1254670ac811d7bf45b8d98a8";
    return {
      height: 0,
      previousHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
      hash,
      timestamp,
      minerAddress: "local-prototype-genesis",
      transactions: [],
      miningProof: {
        initialSeed: [[0, 1, 0], [0, 0, 1], [1, 1, 1]],
        finalGrid: [[1, 0, 1], [0, 1, 1], [1, 1, 0]],
        generationsRun: 15,
        entropyScore: 42.8,
        nonce: 1042,
        hash
      },
      pqSignature: {
        algorithm: "Dilithium2",
        signatureHex: "DEMO_FIXTURE_NOT_A_CRYPTOGRAPHIC_SIGNATURE",
        publicKeyHex: "DEMO_FIXTURE_PUBLIC_KEY_NOT_REAL",
        hashMessage: "LOCAL_PROTOTYPE_GENESIS_FIXTURE",
        timestamp,
        valid: false
      },
      quantumDifficulty: 4.8,
      entropyIndex: 42.8
    };
  };
  const isValidStoredBlock = (value) => {
    if (!value || typeof value !== "object") return false;
    const block = value;
    return Number.isInteger(block.height) && Number(block.height) >= 0 && typeof block.previousHash === "string" && typeof block.hash === "string" && typeof block.timestamp === "number" && Number.isFinite(block.timestamp) && typeof block.minerAddress === "string" && Array.isArray(block.transactions) && !!block.miningProof && typeof block.miningProof === "object" && !!block.pqSignature && typeof block.pqSignature === "object" && typeof block.quantumDifficulty === "number" && Number.isFinite(block.quantumDifficulty) && typeof block.entropyIndex === "number" && Number.isFinite(block.entropyIndex);
  };
  const persistLedger = (chain) => {
    const tempPath = `${LEDGER_FILE}.${process.pid}.tmp`;
    try {
      import_fs.default.writeFileSync(tempPath, JSON.stringify(chain, null, 2), { mode: 384 });
      import_fs.default.renameSync(tempPath, LEDGER_FILE);
    } finally {
      try {
        import_fs.default.rmSync(tempPath, { force: true });
      } catch {
      }
    }
  };
  let blockchain = [];
  try {
    const parsed = JSON.parse(import_fs.default.readFileSync(LEDGER_FILE, "utf8"));
    if (!Array.isArray(parsed) || parsed.length === 0 || !parsed.every(isValidStoredBlock)) {
      throw new Error("empty or invalid ledger");
    }
    blockchain = parsed;
    console.log(`[PERSISTENCE] Loaded ${blockchain.length} local prototype blocks`);
  } catch (error) {
    if (error?.code !== "ENOENT") {
      console.error("[PERSISTENCE] Existing local prototype ledger is invalid; reinitializing:", error);
    }
    blockchain = [createPrototypeGenesis()];
    persistLedger(blockchain);
    console.log(`[PERSISTENCE] Initialized local prototype ledger at ${LEDGER_FILE}`);
  }
  const mempool = [];
  let miningInProgress = false;
  const deployedContracts = [
    {
      id: "sc_pq_escrow_001",
      name: "Post-Quantum Escrow Vault",
      creatorAddress: blockchain[0]?.minerAddress || "local-prototype-genesis",
      code: `// Web 4.0 Quantum Escrow
contract PostQuantumEscrow {
  state { owner: Address, balance: QBits, entropyMin: Number }
  
  onConwayStep(entropy: Number) {
    if (entropy > this.state.entropyMin && verifyPqSig(msg.sender)) {
      releaseFunds(this.state.owner);
    }
  }
}`,
      abi: ["releaseFunds()", "getVaultBalance()", "verifyPqSig()"],
      type: "Escrow",
      state: { owner: blockchain[0]?.minerAddress || "local-prototype-genesis", lockedQBits: 5e4, minEntropy: 42.5 },
      createdBlock: 0,
      conwayTriggerRule: "B3/S23 Entropy > 42.5",
      isAiAutonomous: true
    },
    {
      id: "sc_conway_yield_002",
      name: "Conway Glider Yield Synthesizer",
      creatorAddress: blockchain[0]?.minerAddress || "local-prototype-genesis",
      code: `// Web 4.0 Autonomous Glider Yield
contract ConwayGliderYield {
  state { totalStaked: QBits, gliderCount: Number }
  
  onGliderFormed(grid: Grid) {
    let yieldRate = computeShannonEntropy(grid) * 0.05;
    distributeYield(yieldRate);
  }
}`,
      abi: ["stakeQBits()", "claimGliderYield()"],
      type: "Yield",
      state: { totalStaked: 125e3, gliderYieldMultiplier: 1.45 },
      createdBlock: 0,
      conwayTriggerRule: "Glider Pattern Match in Block Grid",
      isAiAutonomous: true
    }
  ];
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      mode: "LOCAL_DEVNET_PROTOTYPE",
      time: (/* @__PURE__ */ new Date()).toISOString(),
      persistence: "LOCAL_FILE",
      ledger_path: LEDGER_FILE,
      blocks_on_disk: blockchain.length,
      active_nodes: null,
      public_network_verified: false
    });
  });
  const handleStatus = (_req, res) => {
    const latestBlock = blockchain[blockchain.length - 1];
    const totalTx = blockchain.reduce((sum, b) => sum + b.transactions.length, 0);
    const avgEntropy = Number(
      (blockchain.reduce((sum, b) => sum + b.entropyIndex, 0) / blockchain.length).toFixed(2)
    );
    const chainState = {
      height: latestBlock.height,
      latestHash: latestBlock.hash,
      quantumDifficulty: latestBlock.quantumDifficulty,
      totalTransactions: totalTx,
      pendingMempool: mempool,
      activeNodes: null,
      averageEntropy: avgEntropy,
      tps: null,
      networkHashrate: null,
      mode: "LOCAL_DEVNET_PROTOTYPE",
      publicNetworkVerified: false,
      persistence: {
        storage: "LOCAL_FILE",
        ledger_path: LEDGER_FILE,
        blocks_on_disk: blockchain.length,
        crash_recovery: "NOT_MEASURED_BY_THIS_PROCESS"
      },
      p2p_network: {
        protocol: "RDL-HotStuff-BFT-v1 prototype",
        active_peers: [],
        state_sync: "NOT_MEASURED_BY_THIS_PROCESS",
        quorum: "NOT_MEASURED_BY_THIS_PROCESS"
      },
      statusNote: "Local prototype telemetry only. Public Testnet/Mainnet status requires independently reproducible external evidence."
    };
    res.json(chainState);
  };
  app.get("/api/blockchain/status", handleStatus);
  app.get("/api/network", handleStatus);
  app.get("/api/blockchain/blocks", (req, res) => {
    res.json(blockchain);
  });
  app.get("/api/blocks", (req, res) => {
    res.json(blockchain);
  });
  app.get("/api/blockchain/contracts", (req, res) => {
    res.json(deployedContracts);
  });
  app.post("/api/blockchain/transaction", async (req, res) => {
    try {
      const { senderAddress, receiverAddress, amount, fee, algorithm, signatureHex, conwayStatePayload } = req.body;
      if (!senderAddress || !receiverAddress || !amount || !signatureHex) {
        return res.status(400).json({ error: "Missing required transaction fields" });
      }
      const txHash = `0xtx_${await sha256Hex(`${senderAddress}:${receiverAddress}:${amount}:${Date.now()}`)}`;
      const newTx = {
        txHash,
        senderAddress,
        receiverAddress,
        amount: Number(amount),
        fee: Number(fee || 1e-3),
        algorithm: algorithm || "Dilithium2",
        signatureHex,
        conwayStatePayload: conwayStatePayload || "NORMAL_TRANSFER",
        timestamp: Date.now(),
        status: "pending"
      };
      return res.status(501).json({ success: false, error: "Transaction submission disabled until sender authorization and cryptographic signature verification are enforced server-side.", simulation: true });
    } catch (err) {
      res.status(500).json({ error: err.message || "Failed to submit transaction" });
    }
  });
  app.post("/api/blockchain/mine", async (req, res) => {
    if (miningInProgress) {
      return res.status(409).json({
        error: "another local mining operation is already in progress",
        retryable: true
      });
    }
    miningInProgress = true;
    try {
      const { minerAddress, seedGrid, algorithm } = req.body;
      const algo = algorithm || "Dilithium2";
      const minerKeypair = await generatePQKeypair(algo);
      const seed = seedGrid && Array.isArray(seedGrid) ? seedGrid : generateRandomGrid(0.28);
      const latestBlock = blockchain[blockchain.length - 1];
      const nextHeight = latestBlock.height + 1;
      const proof = await mineConwayBlock(seed, 15, 38);
      const mempoolBatch = mempool.slice(0, 10);
      const confirmedTxs = mempoolBatch.map((tx) => ({
        ...tx,
        status: "simulated",
        blockHeight: nextHeight
      }));
      const rewardTx = {
        txHash: `0xreward_${await sha256Hex(`REWARD_${nextHeight}_${Date.now()}`)}`,
        senderAddress: "pq1q00000000000000000000000000000000000000",
        receiverAddress: minerAddress || minerKeypair.address,
        amount: 50,
        fee: 0,
        algorithm: algo,
        signatureHex: `REWARD_BLOCK_${nextHeight}_SIG`,
        timestamp: Date.now(),
        status: "simulated",
        blockHeight: nextHeight
      };
      confirmedTxs.unshift(rewardTx);
      const signature = await signPQPayload(`BLOCK_${nextHeight}_${proof.hash}`, minerKeypair);
      const newBlock = {
        height: nextHeight,
        previousHash: latestBlock.hash,
        hash: proof.hash,
        timestamp: Date.now(),
        minerAddress: minerAddress || minerKeypair.address,
        transactions: confirmedTxs,
        miningProof: proof,
        pqSignature: signature,
        quantumDifficulty: Number((latestBlock.quantumDifficulty + (Math.random() * 0.2 - 0.08)).toFixed(2)),
        entropyIndex: proof.entropyScore
      };
      blockchain.push(newBlock);
      try {
        persistLedger(blockchain);
      } catch (error) {
        blockchain.pop();
        throw new Error(`failed to persist new block: ${error instanceof Error ? error.message : String(error)}`);
      }
      mempool.splice(0, mempoolBatch.length);
      res.json({
        success: true,
        block: newBlock,
        chainHeight: blockchain.length,
        persistedOnDisk: true,
        statusNote: "Local prototype block generated and durably written to the configured ledger file."
      });
    } catch (err) {
      res.status(500).json({ error: err.message || "Block mining failed" });
    } finally {
      miningInProgress = false;
    }
  });
  app.post("/api/quantum/generate-keypair", (_req, res) => {
    return res.status(410).json({
      error: "server-side key generation is disabled; generate ML-DSA keys locally in a trusted client"
    });
  });
  app.post("/api/quantum/verify-signature", async (req, res) => {
    try {
      const { payload, signature, publicKeyHex } = req.body;
      const isValid = await verifyPQSignature(payload, signature, publicKeyHex);
      res.json({ valid: isValid, signature, payload });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/automaton/step", (req, res) => {
    try {
      const { grid, steps = 1 } = req.body;
      let currentGrid = grid && Array.isArray(grid) ? grid : createEmptyGrid();
      for (let i = 0; i < steps; i++) {
        currentGrid = stepConwayGrid(currentGrid);
      }
      const { entropy, population } = computeGridEntropy(currentGrid);
      res.json({ grid: currentGrid, entropy, population });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/gemini/smart-contract-copilot", async (req, res) => {
    try {
      const { prompt, contractCode, action } = req.body;
      if (!ai) {
        return res.status(503).json({
          error: "Gemini API Key is not configured on the server. Please add GEMINI_API_KEY in Settings > Secrets."
        });
      }
      let systemInstruction = `You are the Web 4.0 Post-Quantum Conway Automaton Smart Contract Copilot.
You specialize in designing, auditing, and compiling quantum-resistant smart contracts that execute based on Conway's Game of Life Cellular Automata entropy metrics and Post-Quantum cryptographic algorithms (CRYSTALS-Dilithium, Falcon-512, SPHINCS+).

When generating smart contracts, always return clean code along with security ratings and post-quantum resilience scores.
Always structure JSON output with properties:
- contractCode: The full clean Web 4.0 smart contract code
- contractName: Name of contract
- type: Contract category ('Escrow' | 'Governance' | 'Yield' | 'Identity' | 'Custom')
- securityRating: 'A+' | 'A' | 'B' | 'C'
- postQuantumResilienceScore: Number 0 to 100
- conwayEntropyAnalysis: Explanation of how Conway's Game of Life grid state triggers the contract
- vulnerabilities: Array of potential edge cases or warnings
- suggestedOptimizations: Array of quantum lattice or cellular optimization tips
`;
      let userPrompt = "";
      if (action === "audit") {
        userPrompt = `Audit the following Post-Quantum Conway Smart Contract:
\`\`\`
${contractCode}
\`\`\`
Provide security ratings, post-quantum resilience score, cellular entropy triggers, and optimization recommendations.`;
      } else {
        userPrompt = `Generate a new Web 4.0 Post-Quantum Conway Smart Contract for user prompt: "${prompt}". Ensure it leverages post-quantum signatures (Dilithium or SPHINCS+) and cellular automata state transitions.`;
      }
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature: 0.7
        }
      });
      const responseText = response.text || "";
      res.json({
        rawResponse: responseText,
        prompt
      });
    } catch (err) {
      console.error("Gemini Copilot Error:", err);
      res.status(500).json({ error: err.message || "Gemini processing failed" });
    }
  });
  app.post("/api/blockchain/deploy-contract", async (req, res) => {
    try {
      const { name, code, type, creatorAddress, conwayTriggerRule } = req.body;
      const latestBlock = blockchain[blockchain.length - 1];
      const newContract = {
        id: `sc_pq_${Date.now()}`,
        name: name || "Custom Quantum Automaton",
        creatorAddress: creatorAddress || "pq1q_user_deployer",
        code: code || "// Custom Contract",
        abi: ["executeTrigger()", "getContractState()"],
        type: type || "Custom",
        state: { status: "ACTIVE", deployedAt: Date.now() },
        createdBlock: latestBlock.height,
        conwayTriggerRule: conwayTriggerRule || "Conway Entropy > 35",
        isAiAutonomous: true
      };
      deployedContracts.push(newContract);
      res.json({ success: true, simulation: true, contract: newContract, statusNote: "Contract is stored only in local process memory; no external VM or chain deployment occurred." });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/tokens", (req, res) => {
    res.json({ success: true, tokens: tokenEngine.getTokens() });
  });
  app.post("/api/tokens/create", (req, res) => {
    try {
      const newToken = tokenEngine.createToken(req.body);
      res.json({ success: true, token: newToken });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.post("/api/tokens/transfer", (req, res) => {
    try {
      const { tokenId, senderAddress, receiverAddress, amount } = req.body;
      const result = tokenEngine.transferToken(tokenId, senderAddress, receiverAddress, Number(amount));
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.post("/api/tokens/mint", (req, res) => {
    try {
      const { tokenId, recipientAddress, amount } = req.body;
      const result = tokenEngine.mintToken(tokenId, recipientAddress, Number(amount));
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.post("/api/faucet/dispense", async (req, res) => {
    try {
      const { recipientAddress, dropType } = req.body;
      const result = await faucetEngine.dispense(recipientAddress, dropType);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/faucet/status", (req, res) => {
    res.json({
      success: true,
      stats: faucetEngine.getStats(),
      recentClaims: faucetEngine.getRecentClaims()
    });
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true, allowedHosts: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express2.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PQ-RDL prototype web server listening on port ${PORT}; public testnet/mainnet claims require independent deployment evidence`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
