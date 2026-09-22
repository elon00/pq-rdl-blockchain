import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ConwayMinerView } from './components/ConwayMinerView';
import { PQWalletView } from './components/PQWalletView';
import { BlockExplorerView } from './components/BlockExplorerView';
import { SmartContractsView } from './components/SmartContractsView';
import { PeerMeshView } from './components/PeerMeshView';
import { TokenLaunchpadView } from './components/TokenLaunchpadView';
import { FaucetView } from './components/FaucetView';
import { RdlSwapView } from './components/RdlSwapView';
import { DeveloperView } from './components/DeveloperView';
import { ProjectQRCode } from './components/ProjectQRCode';
import { ChainState, Block, PQKeypair, SmartContract, Transaction } from './types';

const INITIAL_GENESIS_BLOCK: Block = {
  height: 0,
  previousHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
  hash: '0xd1ba8eb5003434c08d7f447c2a0f17fa297264c1254670ac811d7bf45b8d98a8',
  timestamp: 1726400000000,
  minerAddress: 'pq1dil2genesis00000000000000000000000000000',
  transactions: [
    {
      txHash: '0xgen_tx_001_qbits_distribution',
      senderAddress: 'pq1q00000000000000000000000000000000000000',
      receiverAddress: 'pq1dil2genesis00000000000000000000000000000',
      amount: 1000000,
      fee: 0,
      algorithm: 'Dilithium2',
      signatureHex: 'DEMO_FIXTURE_NOT_A_CRYPTOGRAPHIC_SIGNATURE',
      conwayStatePayload: 'GENESIS_QUANTUM_PATTERNS',
      timestamp: 1726400000000,
      status: 'simulated',
      blockHeight: 0,
    },
  ],
  miningProof: {
    initialSeed: [[0, 1, 0], [0, 0, 1], [1, 1, 1]],
    finalGrid: [[1, 0, 1], [0, 1, 1], [1, 1, 0]],
    generationsRun: 15,
    entropyScore: 42.8,
    nonce: 1042,
    hash: '0xd1ba8eb5003434c08d7f447c2a0f17fa297264c1254670ac811d7bf45b8d98a8',
  },
  pqSignature: {
    algorithm: 'Dilithium2',
    signatureHex: 'DEMO_FIXTURE_NOT_A_CRYPTOGRAPHIC_SIGNATURE',
    publicKeyHex: 'DEMO_FIXTURE_PUBLIC_KEY_NOT_REAL',
    hashMessage: 'DEMO_FIXTURE',
    timestamp: 1726400000000,
    valid: false,
  },
  quantumDifficulty: 4.8,
  entropyIndex: 42.8,
};

const INITIAL_CHAIN_STATE: ChainState = {
  height: 0,
  latestHash: '0xd1ba8eb5003434c08d7f447c2a0f17fa297264c1254670ac811d7bf45b8d98a8',
  quantumDifficulty: 4.8,
  totalTransactions: 1,
  pendingMempool: [],
  activeNodes: null,
  averageEntropy: 42.8,
  tps: null,
  networkHashrate: null,
  mode: 'DEMONSTRATION_IN_MEMORY',
  statusNote: 'Bundled local demonstration fixture. Public-network status and metrics are not verified.',
};

const INITIAL_CONTRACTS: SmartContract[] = [
  {
    id: 'sc_pq_escrow_001',
    name: 'Post-Quantum Escrow Vault',
    creatorAddress: 'pq1dil2genesis00000000000000000000000000000',
    code: '// Web 4.0 Quantum Escrow\ncontract PostQuantumEscrow {\n  state { owner: Address, balance: QBits, entropyMin: Number }\n  onConwayStep(entropy: Number) {\n    if (entropy > this.state.entropyMin && verifyPqSig(msg.sender)) {\n      releaseFunds(this.state.owner);\n    }\n  }\n}',
    abi: ['releaseFunds()', 'getVaultBalance()', 'verifyPqSig()'],
    type: 'Escrow',
    state: { owner: 'pq1dil2genesis00000000000000000000000000000', lockedQBits: 50000, minEntropy: 42.5 },
    createdBlock: 0,
    conwayTriggerRule: 'B3/S23 Entropy > 42.5',
    isAiAutonomous: true,
  },
  {
    id: 'sc_conway_yield_002',
    name: 'Conway Glider Yield Synthesizer',
    creatorAddress: 'pq1dil2genesis00000000000000000000000000000',
    code: '// Web 4.0 Autonomous Glider Yield\ncontract ConwayGliderYield {\n  state { totalStaked: QBits, gliderCount: Number }\n  onGliderFormed(grid: Grid) {\n    let yieldRate = computeShannonEntropy(grid) * 0.05;\n    distributeYield(yieldRate);\n  }\n}',
    abi: ['stakeQBits()', 'claimGliderYield()'],
    type: 'Yield',
    state: { totalStaked: 125000, gliderYieldMultiplier: 1.45 },
    createdBlock: 0,
    conwayTriggerRule: 'Glider Pattern Match in Block Grid',
    isAiAutonomous: true,
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [chainState, setChainState] = useState<ChainState | null>(INITIAL_CHAIN_STATE);
  const [blocks, setBlocks] = useState<Block[]>([INITIAL_GENESIS_BLOCK]);
  const [contracts, setContracts] = useState<SmartContract[]>(INITIAL_CONTRACTS);
  const [activeWallet, setActiveWallet] = useState<PQKeypair | null>(null);

  const fetchBlockchainData = async () => {
    try {
      const [statusRes, blocksRes, contractsRes] = await Promise.all([
        fetch('/api/blockchain/status'), fetch('/api/blockchain/blocks'), fetch('/api/blockchain/contracts'),
      ]);
      if (statusRes.ok) setChainState(await statusRes.json());
      if (blocksRes.ok) setBlocks(await blocksRes.json());
      if (contractsRes.ok) setContracts(await contractsRes.json());
    } catch (err) {
      // Graceful static mode fallback: keep local simulated state
    }
  };

  useEffect(() => {
    fetchBlockchainData();
    const interval = setInterval(fetchBlockchainData, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleBlockMined = (newBlock: Block) => {
    setBlocks((prev) => [...prev, newBlock]);
    setChainState((prev) => ({
      height: newBlock.height,
      latestHash: newBlock.hash,
      quantumDifficulty: newBlock.quantumDifficulty,
      totalTransactions: (prev?.totalTransactions ?? 1) + newBlock.transactions.length,
      pendingMempool: [],
      activeNodes: prev?.activeNodes ?? null,
      averageEntropy: Number((((prev?.averageEntropy ?? 42.8) + newBlock.entropyIndex) / 2).toFixed(2)),
      tps: prev?.tps ?? null,
      networkHashrate: prev?.networkHashrate ?? null,
      mode: prev?.mode || 'DEMONSTRATION_IN_MEMORY',
      statusNote: 'Block added to local chain state.',
    }));
    fetchBlockchainData();
  };

  const handleSendTransaction = async (txData: Partial<Transaction>): Promise<boolean> => {
    try {
      const res = await fetch('/api/blockchain/transaction', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(txData) });
      if (res.ok) {
        const data = await res.json();
        if (data.success) { fetchBlockchainData(); return true; }
      }
    } catch {
      // Static mode fallback
    }
    return false;
  };

  const handleDeployContract = async (contractData: {name:string;code:string;type:any;conwayTriggerRule:string;}) => {
    try {
      const res = await fetch('/api/blockchain/deploy-contract', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...contractData,creatorAddress:activeWallet ? activeWallet.address : 'pq1q_user_deployer'}) });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.contract) {
          setContracts((prev)=>[...prev,data.contract]);
          return;
        }
      }
    } catch {
      // Static mode fallback
    }
    const newContract: SmartContract = {
      id: `sc_pq_${Date.now()}`,
      name: contractData.name || 'Custom Quantum Automaton',
      creatorAddress: activeWallet ? activeWallet.address : 'pq1q_user_deployer',
      code: contractData.code || '// Custom Contract',
      abi: ['executeTrigger()', 'getContractState()'],
      type: contractData.type || 'Custom',
      state: { status: 'ACTIVE', deployedAt: Date.now() },
      createdBlock: chainState?.height ?? 0,
      conwayTriggerRule: contractData.conwayTriggerRule || 'Conway Entropy > 35',
      isAiAutonomous: true,
    };
    setContracts((prev) => [...prev, newContract]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} chainState={chainState} activeWallet={activeWallet} onOpenWalletModal={()=>setActiveTab('wallet')} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {activeTab === 'dashboard' && <DashboardView chainState={chainState} blocks={blocks} onNavigateTab={setActiveTab} />}
        {activeTab === 'faucet' && <FaucetView activeWallet={activeWallet} onOpenWallet={()=>setActiveTab('wallet')} />}
        {activeTab === 'swap' && <RdlSwapView activeWallet={activeWallet} onOpenWallet={()=>setActiveTab('wallet')} />}
        {activeTab === 'tokens' && <TokenLaunchpadView activeWallet={activeWallet} onOpenWallet={()=>setActiveTab('wallet')} />}
        {activeTab === 'conway' && <ConwayMinerView onBlockMined={handleBlockMined} activeWallet={activeWallet} />}
        {activeTab === 'wallet' && <PQWalletView activeWallet={activeWallet} onWalletGenerated={setActiveWallet} onSendTransaction={handleSendTransaction} />}
        {activeTab === 'explorer' && <BlockExplorerView blocks={blocks} />}
        {activeTab === 'contracts' && <SmartContractsView contracts={contracts} activeWallet={activeWallet} onDeployContract={handleDeployContract} />}
        {activeTab === 'nodes' && <PeerMeshView />}
        {activeTab === 'developer' && <DeveloperView />}
        <div className="mt-8 max-w-sm"><ProjectQRCode label="Scan PQ-RDL project" value="https://github.com/elon00/pq-rdl-blockchain" /></div>
      </main>
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center font-mono text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>PQ-RDL prototype • ML-DSA-65 cryptography experiments & Conway automaton simulation</div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400"><span className="text-cyan-400">ML-DSA-65 (FIPS 204 implementation)</span><span>•</span><span className="text-purple-400">Proof-of-Automaton</span></div>
        </div>
      </footer>
    </div>
  );
}
