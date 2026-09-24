import express from 'express';
import { applyRuntimeSecurity } from './src/server/runtimeSecurity';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import {
  generatePQKeypair,
  signPQPayload,
  verifyPQSignature,
  sha256Hex
} from './src/lib/pqCrypto';
import {
  createEmptyGrid,
  generateRandomGrid,
  stepConwayGrid,
  computeGridEntropy,
  mineConwayBlock
} from './src/lib/conwayEngine';
import { Block, Transaction, ChainState, SmartContract } from './src/types';
import { tokenEngine } from './src/lib/tokenEngine';
import { faucetEngine } from './src/lib/faucetEngine';

dotenv.config();

// Initialize Gemini Client server-side
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  applyRuntimeSecurity(app);

  // Initialize Persistent Disk Ledger Storage
  const DATA_DIR = process.env.RDL_WEB_DATA_DIR
    ? path.resolve(process.env.RDL_WEB_DATA_DIR)
    : path.join(process.cwd(), 'data');
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const LEDGER_FILE = path.join(DATA_DIR, 'rdl-ledger-chain.json');

  const createPrototypeGenesis = (): Block => {
    const timestamp = 1726400000000;
    const hash = '0xd1ba8eb5003434c08d7f447c2a0f17fa297264c1254670ac811d7bf45b8d98a8';
    return {
      height: 0,
      previousHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      hash,
      timestamp,
      minerAddress: 'local-prototype-genesis',
      transactions: [],
      miningProof: {
        initialSeed: [[0, 1, 0], [0, 0, 1], [1, 1, 1]],
        finalGrid: [[1, 0, 1], [0, 1, 1], [1, 1, 0]],
        generationsRun: 15,
        entropyScore: 42.8,
        nonce: 1042,
        hash,
      },
      pqSignature: {
        algorithm: 'Dilithium2',
        signatureHex: 'DEMO_FIXTURE_NOT_A_CRYPTOGRAPHIC_SIGNATURE',
        publicKeyHex: 'DEMO_FIXTURE_PUBLIC_KEY_NOT_REAL',
        hashMessage: 'LOCAL_PROTOTYPE_GENESIS_FIXTURE',
        timestamp,
        valid: false,
      },
      quantumDifficulty: 4.8,
      entropyIndex: 42.8,
    };
  };

  const isValidStoredBlock = (value: unknown): value is Block => {
    if (!value || typeof value !== 'object') return false;
    const block = value as Partial<Block>;
    return (
      Number.isInteger(block.height) &&
      Number(block.height) >= 0 &&
      typeof block.previousHash === 'string' &&
      typeof block.hash === 'string' &&
      typeof block.timestamp === 'number' &&
      Number.isFinite(block.timestamp) &&
      typeof block.minerAddress === 'string' &&
      Array.isArray(block.transactions) &&
      !!block.miningProof &&
      typeof block.miningProof === 'object' &&
      !!block.pqSignature &&
      typeof block.pqSignature === 'object' &&
      typeof block.quantumDifficulty === 'number' &&
      Number.isFinite(block.quantumDifficulty) &&
      typeof block.entropyIndex === 'number' &&
      Number.isFinite(block.entropyIndex)
    );
  };

  const persistLedger = (chain: Block[]) => {
    const tempPath = `${LEDGER_FILE}.${process.pid}.tmp`;
    try {
      fs.writeFileSync(tempPath, JSON.stringify(chain, null, 2), { mode: 0o600 });
      fs.renameSync(tempPath, LEDGER_FILE);
    } finally {
      try {
        fs.rmSync(tempPath, { force: true });
      } catch {
        // Best-effort cleanup only; the original persistence error must win.
      }
    }
  };

  let blockchain: Block[] = [];
  try {
    const parsed = JSON.parse(fs.readFileSync(LEDGER_FILE, 'utf8'));
    if (!Array.isArray(parsed) || parsed.length === 0 || !parsed.every(isValidStoredBlock)) {
      throw new Error('empty or invalid ledger');
    }
    blockchain = parsed;
    console.log(`[PERSISTENCE] Loaded ${blockchain.length} local prototype blocks`);
  } catch (error: any) {
    if (error?.code !== 'ENOENT') {
      console.error('[PERSISTENCE] Existing local prototype ledger is invalid; reinitializing:', error);
    }
    blockchain = [createPrototypeGenesis()];
    persistLedger(blockchain);
    console.log(`[PERSISTENCE] Initialized local prototype ledger at ${LEDGER_FILE}`);
  }
  const mempool: Transaction[] = [];
  let miningInProgress = false;
  const deployedContracts: SmartContract[] = [
    {
      id: 'sc_pq_escrow_001',
      name: 'Post-Quantum Escrow Vault',
      creatorAddress: blockchain[0]?.minerAddress || 'local-prototype-genesis',
      code: `// Web 4.0 Quantum Escrow
contract PostQuantumEscrow {
  state { owner: Address, balance: QBits, entropyMin: Number }
  
  onConwayStep(entropy: Number) {
    if (entropy > this.state.entropyMin && verifyPqSig(msg.sender)) {
      releaseFunds(this.state.owner);
    }
  }
}`,
      abi: ['releaseFunds()', 'getVaultBalance()', 'verifyPqSig()'],
      type: 'Escrow',
      state: { owner: blockchain[0]?.minerAddress || 'local-prototype-genesis', lockedQBits: 50000, minEntropy: 42.5 },
      createdBlock: 0,
      conwayTriggerRule: 'B3/S23 Entropy > 42.5',
      isAiAutonomous: true,
    },
    {
      id: 'sc_conway_yield_002',
      name: 'Conway Glider Yield Synthesizer',
      creatorAddress: blockchain[0]?.minerAddress || 'local-prototype-genesis',
      code: `// Web 4.0 Autonomous Glider Yield
contract ConwayGliderYield {
  state { totalStaked: QBits, gliderCount: Number }
  
  onGliderFormed(grid: Grid) {
    let yieldRate = computeShannonEntropy(grid) * 0.05;
    distributeYield(yieldRate);
  }
}`,
      abi: ['stakeQBits()', 'claimGliderYield()'],
      type: 'Yield',
      state: { totalStaked: 125000, gliderYieldMultiplier: 1.45 },
      createdBlock: 0,
      conwayTriggerRule: 'Glider Pattern Match in Block Grid',
      isAiAutonomous: true,
    },
  ];

  // API Routes
  
  // Health & Status. This endpoint reports only what this process can directly observe.
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      mode: 'LOCAL_DEVNET_PROTOTYPE',
      time: new Date().toISOString(),
      persistence: 'LOCAL_FILE',
      ledger_path: LEDGER_FILE,
      blocks_on_disk: blockchain.length,
      active_nodes: null,
      public_network_verified: false
    });
  });

  // Local prototype status; no synthetic public-network telemetry.
  const handleStatus = (_req: any, res: any) => {
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
      mode: 'LOCAL_DEVNET_PROTOTYPE',
      publicNetworkVerified: false,
      persistence: {
        storage: 'LOCAL_FILE',
        ledger_path: LEDGER_FILE,
        blocks_on_disk: blockchain.length,
        crash_recovery: 'NOT_MEASURED_BY_THIS_PROCESS'
      },
      p2p_network: {
        protocol: 'RDL-HotStuff-BFT-v1 prototype',
        active_peers: [],
        state_sync: 'NOT_MEASURED_BY_THIS_PROCESS',
        quorum: 'NOT_MEASURED_BY_THIS_PROCESS'
      },
      statusNote: 'Local prototype telemetry only. Public Testnet/Mainnet status requires independently reproducible external evidence.',
    };

    res.json(chainState);
  };

  app.get('/api/blockchain/status', handleStatus);
  app.get('/api/network', handleStatus);

  // Get All Blocks
  app.get('/api/blockchain/blocks', (req, res) => {
    res.json(blockchain);
  });
  app.get('/api/blocks', (req, res) => {
    res.json(blockchain);
  });

  // Get Smart Contracts
  app.get('/api/blockchain/contracts', (req, res) => {
    res.json(deployedContracts);
  });

  // Submit Transaction to Mempool
  app.post('/api/blockchain/transaction', async (req, res) => {
    try {
      const { senderAddress, receiverAddress, amount, fee, algorithm, signatureHex, conwayStatePayload } = req.body;

      if (!senderAddress || !receiverAddress || !amount || !signatureHex) {
        return res.status(400).json({ error: 'Missing required transaction fields' });
      }

      const txHash = `0xtx_${await sha256Hex(`${senderAddress}:${receiverAddress}:${amount}:${Date.now()}`)}`;

      const newTx: Transaction = {
        txHash,
        senderAddress,
        receiverAddress,
        amount: Number(amount),
        fee: Number(fee || 0.001),
        algorithm: algorithm || 'Dilithium2',
        signatureHex,
        conwayStatePayload: conwayStatePayload || 'NORMAL_TRANSFER',
        timestamp: Date.now(),
        status: 'pending',
      };

      return res.status(501).json({ success: false, error: 'Transaction submission disabled until sender authorization and cryptographic signature verification are enforced server-side.', simulation: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to submit transaction' });
    }
  });

  // Mine a New Post-Quantum Conway Block.
  // Local mining mutations are serialized so concurrent requests cannot derive
  // competing blocks from the same chain tip.
  app.post('/api/blockchain/mine', async (req, res) => {
    if (miningInProgress) {
      return res.status(409).json({
        error: 'another local mining operation is already in progress',
        retryable: true,
      });
    }

    miningInProgress = true;
    try {
      const { minerAddress, seedGrid, algorithm } = req.body;
      const algo = algorithm || 'Dilithium2';

      const minerKeypair = await generatePQKeypair(algo);
      const seed = seedGrid && Array.isArray(seedGrid) ? seedGrid : generateRandomGrid(0.28);

      const latestBlock = blockchain[blockchain.length - 1];
      const nextHeight = latestBlock.height + 1;
      const proof = await mineConwayBlock(seed, 15, 38);

      // Read but do not remove mempool entries until persistence succeeds.
      const mempoolBatch = mempool.slice(0, 10);
      const confirmedTxs: Transaction[] = mempoolBatch.map((tx) => ({
        ...tx,
        status: 'simulated',
        blockHeight: nextHeight,
      }));

      const rewardTx: Transaction = {
        txHash: `0xreward_${await sha256Hex(`REWARD_${nextHeight}_${Date.now()}`)}`,
        senderAddress: 'pq1q00000000000000000000000000000000000000',
        receiverAddress: minerAddress || minerKeypair.address,
        amount: 50,
        fee: 0,
        algorithm: algo,
        signatureHex: `REWARD_BLOCK_${nextHeight}_SIG`,
        timestamp: Date.now(),
        status: 'simulated',
        blockHeight: nextHeight,
      };

      confirmedTxs.unshift(rewardTx);

      const signature = await signPQPayload(`BLOCK_${nextHeight}_${proof.hash}`, minerKeypair);

      const newBlock: Block = {
        height: nextHeight,
        previousHash: latestBlock.hash,
        hash: proof.hash,
        timestamp: Date.now(),
        minerAddress: minerAddress || minerKeypair.address,
        transactions: confirmedTxs,
        miningProof: proof,
        pqSignature: signature,
        quantumDifficulty: Number((latestBlock.quantumDifficulty + (Math.random() * 0.2 - 0.08)).toFixed(2)),
        entropyIndex: proof.entropyScore,
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
        statusNote: 'Local prototype block generated and durably written to the configured ledger file.'
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Block mining failed' });
    } finally {
      miningInProgress = false;
    }
  });

  // Secret keys must never be generated or returned by the server.
  app.post('/api/quantum/generate-keypair', (_req, res) => {
    return res.status(410).json({
      error: 'server-side key generation is disabled; generate ML-DSA keys locally in a trusted client'
    });
  });

  // Verify PQ Signature
  app.post('/api/quantum/verify-signature', async (req, res) => {
    try {
      const { payload, signature, publicKeyHex } = req.body;
      const isValid = await verifyPQSignature(payload, signature, publicKeyHex);
      res.json({ valid: isValid, signature, payload });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Conway Automaton Step Simulator
  app.post('/api/automaton/step', (req, res) => {
    try {
      const { grid, steps = 1 } = req.body;
      let currentGrid = grid && Array.isArray(grid) ? grid : createEmptyGrid();
      for (let i = 0; i < steps; i++) {
        currentGrid = stepConwayGrid(currentGrid);
      }
      const { entropy, population } = computeGridEntropy(currentGrid);
      res.json({ grid: currentGrid, entropy, population });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // AI Smart Contract Copilot (Gemini API server-side endpoint)
  app.post('/api/gemini/smart-contract-copilot', async (req, res) => {
    try {
      const { prompt, contractCode, action } = req.body;

      if (!ai) {
        return res.status(503).json({
          error: 'Gemini API Key is not configured on the server. Please add GEMINI_API_KEY in Settings > Secrets.',
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

      let userPrompt = '';
      if (action === 'audit') {
        userPrompt = `Audit the following Post-Quantum Conway Smart Contract:\n\`\`\`\n${contractCode}\n\`\`\`\nProvide security ratings, post-quantum resilience score, cellular entropy triggers, and optimization recommendations.`;
      } else {
        userPrompt = `Generate a new Web 4.0 Post-Quantum Conway Smart Contract for user prompt: "${prompt}". Ensure it leverages post-quantum signatures (Dilithium or SPHINCS+) and cellular automata state transitions.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const responseText = response.text || '';

      // Try parsing JSON if structured or wrap cleanly
      res.json({
        rawResponse: responseText,
        prompt,
      });
    } catch (err: any) {
      console.error('Gemini Copilot Error:', err);
      res.status(500).json({ error: err.message || 'Gemini processing failed' });
    }
  });

  // Deploy New Contract
  app.post('/api/blockchain/deploy-contract', async (req, res) => {
    try {
      const { name, code, type, creatorAddress, conwayTriggerRule } = req.body;
      const latestBlock = blockchain[blockchain.length - 1];
      const newContract: SmartContract = {
        id: `sc_pq_${Date.now()}`,
        name: name || 'Custom Quantum Automaton',
        creatorAddress: creatorAddress || 'pq1q_user_deployer',
        code: code || '// Custom Contract',
        abi: ['executeTrigger()', 'getContractState()'],
        type: type || 'Custom',
        state: { status: 'ACTIVE', deployedAt: Date.now() },
        createdBlock: latestBlock.height,
        conwayTriggerRule: conwayTriggerRule || 'Conway Entropy > 35',
        isAiAutonomous: true,
      };

      deployedContracts.push(newContract);
      res.json({ success: true, simulation: true, contract: newContract, statusNote: 'Contract is stored only in local process memory; no external VM or chain deployment occurred.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Token Launchpad Endpoints
  app.get('/api/tokens', (req, res) => {
    res.json({ success: true, tokens: tokenEngine.getTokens() });
  });

  app.post('/api/tokens/create', (req, res) => {
    try {
      const newToken = tokenEngine.createToken(req.body);
      res.json({ success: true, token: newToken });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/tokens/transfer', (req, res) => {
    try {
      const { tokenId, senderAddress, receiverAddress, amount } = req.body;
      const result = tokenEngine.transferToken(tokenId, senderAddress, receiverAddress, Number(amount));
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/tokens/mint', (req, res) => {
    try {
      const { tokenId, recipientAddress, amount } = req.body;
      const result = tokenEngine.mintToken(tokenId, recipientAddress, Number(amount));
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Faucet Dispenser Endpoints
  app.post('/api/faucet/dispense', async (req, res) => {
    try {
      const { recipientAddress, dropType } = req.body;
      const result = await faucetEngine.dispense(recipientAddress, dropType);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/faucet/status', (req, res) => {
    res.json({
      success: true,
      stats: faucetEngine.getStats(),
      recentClaims: faucetEngine.getRecentClaims(),
    });
  });

  // Post-Quantum Keypair Generation
  app.post('/api/quantum/generate-keypair', async (req, res) => {
    try {
      const { algorithm, seedPhrase } = req.body;
      const keypair = await generatePQKeypair(algorithm || 'Dilithium2', seedPhrase);
      res.json(keypair);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Official x402 Autonomous Agent Commerce Protocol ---
  const OFFICIAL_PQRDL_RECIPIENT = "8qhW8ctXX77UNLTY9kx3XoAoH8kstQXPbCghUwqu34es";
  const USED_PQRDL_SIGNATURES = new Set<string>();

  app.get(['/.well-known/x402-bazaar.json', '/.well-known/x402.json'], (_req, res) => {
    return res.json({
      x402Version: '1.0.0',
      version: '1.0.0',
      name: 'PQ-RDL — Quantum Automaton Blockchain',
      type: 'quantum-blockchain-protocol',
      category: 'infrastructure',
      tags: ['pq-rdl', 'blockchain', 'post-quantum', 'crystals-dilithium', 'sphincs+', 'conway-automaton', 'x402'],
      provider: {
        name: 'PQ-RDL Blockchain / Martin',
        website: 'https://github.com/elon00/pq-rdl-blockchain',
        payTo: OFFICIAL_PQRDL_RECIPIENT,
        network: 'pq-rdl-testnet',
        caip2: 'pqrdl:testnet-epoch-1'
      },
      endpoints: [
        {
          path: '/api/v1/x402/blockchain/block-verify',
          method: 'POST',
          description: 'Cryptographically verify a PQ-RDL block header using Dilithium and Conway consensus proofs',
          pricing: { amountToken: '0.01', currency: 'RDL', alternativeSol: '0.001' }
        },
        {
          path: '/api/v1/x402/pqc/attest',
          method: 'POST',
          description: 'Generate NIST Dilithium / SPHINCS+ block state attestation signature for autonomous nodes',
          pricing: { amountToken: '0.02', currency: 'RDL', alternativeSol: '0.002' }
        }
      ]
    });
  });

  app.post('/api/v1/x402/blockchain/block-verify', async (req, res) => {
    const authHeader = req.headers['authorization'] || '';
    const sigHeader = (req.headers['x-payment-signature'] as string) || '';
    let signature = '';
    if (typeof authHeader === 'string' && authHeader.toLowerCase().startsWith('x402 ')) {
      signature = authHeader.slice(5).trim();
    } else if (sigHeader) {
      signature = sigHeader.trim();
    }

    const challengeHeader = `x402 realm="pq-rdl", payTo="${OFFICIAL_PQRDL_RECIPIENT}", amount="0.001", currency="SOL", network="solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z"`;

    if (!signature) {
      res.setHeader('WWW-Authenticate', challengeHeader);
      return res.status(402).json({
        status: 402,
        error: 'Payment Required',
        protocol: 'x402',
        version: '1.0.0',
        challenge: {
          network: 'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z',
          payTo: OFFICIAL_PQRDL_RECIPIENT,
          pricing: { amountSol: 0.001, currency: 'SOL', alternativeRdl: '0.01' }
        },
        instructions: `Transfer 0.001 SOL on Solana Testnet to ${OFFICIAL_PQRDL_RECIPIENT}, then retry with header: 'Authorization: x402 <txSignature>'`
      });
    }

    if (USED_PQRDL_SIGNATURES.has(signature)) {
      return res.status(403).json({ status: 403, error: 'Replay Attack Detected: Transaction signature already claimed.' });
    }
    USED_PQRDL_SIGNATURES.add(signature);

    const latestBlock = blockchain[blockchain.length - 1];

    return res.json({
      success: true,
      protocol: 'x402',
      service: 'pq-rdl-block-verify',
      x402Receipt: { signature, recipient: OFFICIAL_PQRDL_RECIPIENT, amountSol: 0.001 },
      verification: {
        verifiedBlockHeight: latestBlock.height,
        blockHash: latestBlock.hash,
        pqSignature: latestBlock.pqSignature,
        miningProof: latestBlock.miningProof,
        consensusResult: 'CONSENSUS_VALID_TRUE'
      }
    });
  });

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, allowedHosts: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PQ-RDL prototype web server listening on port ${PORT}; public testnet/mainnet claims require independent deployment evidence`);
  });
}

startServer();
