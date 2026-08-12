import express from 'express';
import path from 'path';
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
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize In-Memory Genesis Blockchain State
  const genesisKeypair = await generatePQKeypair('Dilithium2', 'Genesis-PostQuantum-Node-0');
  const genesisSeed = generateRandomGrid(0.3);
  const genesisProof = await mineConwayBlock(genesisSeed, 12, 45);
  const genesisSignature = await signPQPayload(`GENESIS_BLOCK_0_${genesisProof.hash}`, genesisKeypair);

  const genesisBlock: Block = {
    height: 0,
    previousHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    hash: genesisProof.hash,
    timestamp: Date.now() - 3600000,
    minerAddress: genesisKeypair.address,
    transactions: [
      {
        txHash: '0xgen_tx_001_qbits_distribution',
        senderAddress: 'pq1q00000000000000000000000000000000000000',
        receiverAddress: genesisKeypair.address,
        amount: 1000000,
        fee: 0,
        algorithm: 'Dilithium2',
        signatureHex: genesisSignature.signatureHex,
        conwayStatePayload: 'GENESIS_QUANTUM_PATTERNS',
        timestamp: Date.now() - 3600000,
        status: 'confirmed',
        blockHeight: 0,
      },
    ],
    miningProof: genesisProof,
    pqSignature: genesisSignature,
    quantumDifficulty: 4.8,
    entropyIndex: genesisProof.entropyScore,
  };

  const blockchain: Block[] = [genesisBlock];
  const mempool: Transaction[] = [];
  const deployedContracts: SmartContract[] = [
    {
      id: 'sc_pq_escrow_001',
      name: 'Post-Quantum Escrow Vault',
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
      abi: ['releaseFunds()', 'getVaultBalance()', 'verifyPqSig()'],
      type: 'Escrow',
      state: { owner: genesisKeypair.address, lockedQBits: 50000, minEntropy: 42.5 },
      createdBlock: 0,
      conwayTriggerRule: 'B3/S23 Entropy > 42.5',
      isAiAutonomous: true,
    },
    {
      id: 'sc_conway_yield_002',
      name: 'Conway Glider Yield Synthesizer',
      creatorAddress: genesisKeypair.address,
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
  
  // Health & Status
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Get Chain Status & Network Metrics
  app.get('/api/blockchain/status', (req, res) => {
    const latestBlock = blockchain[blockchain.length - 1];
    const totalTx = blockchain.reduce((sum, b) => sum + b.transactions.length, 0);
    const avgEntropy = Number(
      (blockchain.reduce((sum, b) => sum + b.entropyIndex, 0) / blockchain.length).toFixed(2)
    );

    const chainState: ChainState = {
      height: latestBlock.height,
      latestHash: latestBlock.hash,
      quantumDifficulty: latestBlock.quantumDifficulty,
      totalTransactions: totalTx,
      pendingMempool: mempool,
      activeNodes: 148,
      averageEntropy: avgEntropy,
      tps: 1840,
      networkHashrate: '14.2 QFLOPS (Lattice Entropy Rate)',
    };

    res.json(chainState);
  });

  // Get All Blocks
  app.get('/api/blockchain/blocks', (req, res) => {
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

      mempool.push(newTx);
      res.json({ success: true, transaction: newTx, mempoolSize: mempool.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to submit transaction' });
    }
  });

  // Mine a New Post-Quantum Conway Block
  app.post('/api/blockchain/mine', async (req, res) => {
    try {
      const { minerAddress, seedGrid, algorithm } = req.body;
      const algo = algorithm || 'Dilithium2';

      const minerKeypair = await generatePQKeypair(algo, `Miner-${minerAddress || 'Node'}`);
      const seed = seedGrid && Array.isArray(seedGrid) ? seedGrid : generateRandomGrid(0.28);

      const latestBlock = blockchain[blockchain.length - 1];
      const proof = await mineConwayBlock(seed, 15, 38);

      // Confirm transactions from mempool
      const confirmedTxs: Transaction[] = mempool.splice(0, 10).map((tx) => ({
        ...tx,
        status: 'confirmed',
        blockHeight: latestBlock.height + 1,
      }));

      // Add mining reward transaction
      const rewardTx: Transaction = {
        txHash: `0xreward_${await sha256Hex(`REWARD_${latestBlock.height + 1}_${Date.now()}`)}`,
        senderAddress: 'pq1q00000000000000000000000000000000000000',
        receiverAddress: minerAddress || minerKeypair.address,
        amount: 50, // 50 QBits reward
        fee: 0,
        algorithm: algo,
        signatureHex: `REWARD_BLOCK_${latestBlock.height + 1}_SIG`,
        timestamp: Date.now(),
        status: 'confirmed',
        blockHeight: latestBlock.height + 1,
      };

      confirmedTxs.unshift(rewardTx);

      const signature = await signPQPayload(`BLOCK_${latestBlock.height + 1}_${proof.hash}`, minerKeypair);

      const newBlock: Block = {
        height: latestBlock.height + 1,
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

      res.json({ success: true, block: newBlock, chainHeight: blockchain.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Block mining failed' });
    }
  });

  // Generate PQ Keypair
  app.post('/api/quantum/generate-keypair', async (req, res) => {
    try {
      const { algorithm, seedPhrase } = req.body;
      const keypair = await generatePQKeypair(algorithm || 'Dilithium2', seedPhrase);
      res.json(keypair);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
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
      res.json({ success: true, contract: newContract });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
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
    console.log(`PQ-RDL Quantum Automaton Blockchain Server running on http://localhost:${PORT}`);
  });
}

startServer();
