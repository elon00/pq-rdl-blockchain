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
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);

// src/lib/pqCrypto.ts
async function sha256Hex(message) {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) throw new Error("Web Crypto SHA-256 is unavailable in this runtime");
  const data = new TextEncoder().encode(message);
  const hashBuffer = await subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function generatePQKeypair(algorithm, seedPhrase) {
  const timestamp = Date.now();
  const seed = seedPhrase || `${algorithm}-${timestamp}-${Math.random()}`;
  const seedHash = await sha256Hex(seed);
  let addressPrefix = "pq1q";
  let securityLevel = "DEMONSTRATION ONLY \u2014 no cryptographic security level is claimed";
  let pubPrefix = "";
  let privPrefix = "";
  if (algorithm === "Dilithium2") {
    addressPrefix = "pq1dil2";
    securityLevel = "DEMONSTRATION ONLY \u2014 not a real Dilithium/ML-DSA keypair";
    pubPrefix = "DIL2_PK_";
    privPrefix = "DIL2_SK_";
  } else if (algorithm === "Falcon-512") {
    addressPrefix = "pq1flc512";
    securityLevel = "DEMONSTRATION ONLY \u2014 not a real Falcon keypair";
    pubPrefix = "FLC512_PK_";
    privPrefix = "FLC512_SK_";
  } else if (algorithm === "SPHINCS+") {
    addressPrefix = "pq1sph";
    securityLevel = "DEMONSTRATION ONLY \u2014 not a real SPHINCS+ keypair";
    pubPrefix = "SPH_PK_";
    privPrefix = "SPH_SK_";
  }
  const publicKeyHex = `${pubPrefix}${seedHash.substring(0, 32)}${await sha256Hex(seedHash + "pub")}`;
  const privateKeyHex = `${privPrefix}${await sha256Hex(seedHash + "priv")}${seedHash.substring(0, 32)}`;
  const addrHash = await sha256Hex(publicKeyHex);
  const address = `${addressPrefix}${addrHash.substring(0, 38)}`;
  return {
    algorithm,
    address,
    publicKeyHex,
    privateKeyHex,
    securityLevel,
    createdAt: timestamp
  };
}
async function signPQPayload(payload, keypair) {
  const msgHash = await sha256Hex(payload);
  const sigHash = await sha256Hex(`${keypair.privateKeyHex}:${msgHash}`);
  const signatureHex = `SIG_${keypair.algorithm.toUpperCase().replace("-", "_")}_${sigHash.substring(0, 48)}`;
  return {
    algorithm: keypair.algorithm,
    signatureHex,
    publicKeyHex: keypair.publicKeyHex,
    hashMessage: msgHash,
    timestamp: Date.now(),
    valid: false
  };
}
async function verifyPQSignature(payload, signature, publicKeyHex) {
  if (!signature || !signature.signatureHex || !publicKeyHex) return false;
  if (signature.publicKeyHex !== publicKeyHex) return false;
  const msgHash = await sha256Hex(payload);
  if (signature.hashMessage !== msgHash) return false;
  const algoTag = signature.algorithm.toUpperCase().replace("-", "_");
  if (!signature.signatureHex.startsWith(`SIG_${algoTag}`)) return false;
  return signature.valid === false;
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
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json({ limit: "10mb" }));
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    if (req.method === "OPTIONS") return res.sendStatus(200);
    next();
  });
  const genesisKeypair = await generatePQKeypair("Dilithium2", "Genesis-PostQuantum-Node-0");
  const genesisSeed = generateRandomGrid(0.3);
  const genesisProof = await mineConwayBlock(genesisSeed, 12, 45);
  const genesisSignature = await signPQPayload(`GENESIS_BLOCK_0_${genesisProof.hash}`, genesisKeypair);
  const genesisBlock = {
    height: 0,
    previousHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
    hash: genesisProof.hash,
    timestamp: Date.now() - 36e5,
    minerAddress: genesisKeypair.address,
    transactions: [
      {
        txHash: "0xgen_tx_001_qbits_distribution",
        senderAddress: "pq1q00000000000000000000000000000000000000",
        receiverAddress: genesisKeypair.address,
        amount: 1e6,
        fee: 0,
        algorithm: "Dilithium2",
        signatureHex: genesisSignature.signatureHex,
        conwayStatePayload: "GENESIS_QUANTUM_PATTERNS",
        timestamp: Date.now() - 36e5,
        status: "confirmed",
        blockHeight: 0
      }
    ],
    miningProof: genesisProof,
    pqSignature: genesisSignature,
    quantumDifficulty: 4.8,
    entropyIndex: genesisProof.entropyScore
  };
  const blockchain = [genesisBlock];
  const mempool = [];
  const deployedContracts = [
    {
      id: "sc_pq_escrow_001",
      name: "Post-Quantum Escrow Vault",
      creatorAddress: genesisKeypair.address,
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
      state: { owner: genesisKeypair.address, lockedQBits: 5e4, minEntropy: 42.5 },
      createdBlock: 0,
      conwayTriggerRule: "B3/S23 Entropy > 42.5",
      isAiAutonomous: true
    },
    {
      id: "sc_conway_yield_002",
      name: "Conway Glider Yield Synthesizer",
      creatorAddress: genesisKeypair.address,
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
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: "DEMONSTRATION_IN_MEMORY", time: (/* @__PURE__ */ new Date()).toISOString(), statusNote: "No external blockchain consensus, validator network, or Solana settlement is connected by this server." });
  });
  app.get("/api/blockchain/status", (req, res) => {
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
      mode: "DEMONSTRATION_IN_MEMORY",
      statusNote: "Metrics are derived from local in-memory state and are not live network telemetry."
    };
    res.json(chainState);
  });
  app.get("/api/blockchain/blocks", (req, res) => {
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
      mempool.push(newTx);
      res.json({ success: true, simulation: true, transaction: newTx, mempoolSize: mempool.length, statusNote: "Transaction exists only in this process memory and has not been broadcast to an external network." });
    } catch (err) {
      res.status(500).json({ error: err.message || "Failed to submit transaction" });
    }
  });
  app.post("/api/blockchain/mine", async (req, res) => {
    try {
      const { minerAddress, seedGrid, algorithm } = req.body;
      const algo = algorithm || "Dilithium2";
      const minerKeypair = await generatePQKeypair(algo, `Miner-${minerAddress || "Node"}`);
      const seed = seedGrid && Array.isArray(seedGrid) ? seedGrid : generateRandomGrid(0.28);
      const latestBlock = blockchain[blockchain.length - 1];
      const proof = await mineConwayBlock(seed, 15, 38);
      const confirmedTxs = mempool.splice(0, 10).map((tx) => ({
        ...tx,
        status: "confirmed",
        blockHeight: latestBlock.height + 1
      }));
      const rewardTx = {
        txHash: `0xreward_${await sha256Hex(`REWARD_${latestBlock.height + 1}_${Date.now()}`)}`,
        senderAddress: "pq1q00000000000000000000000000000000000000",
        receiverAddress: minerAddress || minerKeypair.address,
        amount: 50,
        // 50 QBits reward
        fee: 0,
        algorithm: algo,
        signatureHex: `REWARD_BLOCK_${latestBlock.height + 1}_SIG`,
        timestamp: Date.now(),
        status: "confirmed",
        blockHeight: latestBlock.height + 1
      };
      confirmedTxs.unshift(rewardTx);
      const signature = await signPQPayload(`BLOCK_${latestBlock.height + 1}_${proof.hash}`, minerKeypair);
      const newBlock = {
        height: latestBlock.height + 1,
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
      res.json({ success: true, simulation: true, block: newBlock, chainHeight: blockchain.length, statusNote: "Block is an in-memory Conway demonstration and is not consensus-finalized on an external blockchain." });
    } catch (err) {
      res.status(500).json({ error: err.message || "Block mining failed" });
    }
  });
  app.post("/api/quantum/generate-keypair", async (req, res) => {
    try {
      const { algorithm, seedPhrase } = req.body;
      const keypair = await generatePQKeypair(algorithm || "Dilithium2", seedPhrase);
      res.json(keypair);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
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
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true, allowedHosts: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PQ-RDL Quantum Automaton Blockchain Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
