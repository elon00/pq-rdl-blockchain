import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ConwayMinerView } from './components/ConwayMinerView';
import { PQWalletView } from './components/PQWalletView';
import { BlockExplorerView } from './components/BlockExplorerView';
import { SmartContractsView } from './components/SmartContractsView';
import { PeerMeshView } from './components/PeerMeshView';
import { ProjectQRCode } from './components/ProjectQRCode';
import { ChainState, Block, PQKeypair, SmartContract, Transaction } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [chainState, setChainState] = useState<ChainState | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [contracts, setContracts] = useState<SmartContract[]>([]);
  const [activeWallet, setActiveWallet] = useState<PQKeypair | null>(null);

  const fetchBlockchainData = async () => {
    try {
      const [statusRes, blocksRes, contractsRes] = await Promise.all([
        fetch('/api/blockchain/status'), fetch('/api/blockchain/blocks'), fetch('/api/blockchain/contracts'),
      ]);
      if (statusRes.ok) setChainState(await statusRes.json());
      if (blocksRes.ok) setBlocks(await blocksRes.json());
      if (contractsRes.ok) setContracts(await contractsRes.json());
    } catch (err) { console.error('Failed to fetch blockchain data:', err); }
  };

  useEffect(() => {
    fetchBlockchainData();
    const interval = setInterval(fetchBlockchainData, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleBlockMined = (newBlock: Block) => { setBlocks((prev) => [...prev, newBlock]); fetchBlockchainData(); };

  const handleSendTransaction = async (txData: Partial<Transaction>): Promise<boolean> => {
    try {
      const res = await fetch('/api/blockchain/transaction', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(txData) });
      const data = await res.json();
      if (data.success) { fetchBlockchainData(); return true; }
      return false;
    } catch (err) { console.error(err); return false; }
  };

  const handleDeployContract = async (contractData: {name:string;code:string;type:any;conwayTriggerRule:string;}) => {
    try {
      const res = await fetch('/api/blockchain/deploy-contract', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...contractData,creatorAddress:activeWallet ? activeWallet.address : 'pq1q_user_deployer'}) });
      const data = await res.json();
      if (data.success && data.contract) setContracts((prev)=>[...prev,data.contract]);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} chainState={chainState} activeWallet={activeWallet} onOpenWalletModal={()=>setActiveTab('wallet')} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {activeTab === 'dashboard' && <DashboardView chainState={chainState} blocks={blocks} onNavigateTab={setActiveTab} />}
        {activeTab === 'conway' && <ConwayMinerView onBlockMined={handleBlockMined} activeWallet={activeWallet} />}
        {activeTab === 'wallet' && <PQWalletView activeWallet={activeWallet} onWalletGenerated={setActiveWallet} onSendTransaction={handleSendTransaction} />}
        {activeTab === 'explorer' && <BlockExplorerView blocks={blocks} />}
        {activeTab === 'contracts' && <SmartContractsView contracts={contracts} activeWallet={activeWallet} onDeployContract={handleDeployContract} />}
        {activeTab === 'nodes' && <PeerMeshView />}
        <div className="mt-8 max-w-sm"><ProjectQRCode label="Scan PQ-RDL project" value="https://github.com/elon00/pq-rdl-blockchain" /></div>
      </main>
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center font-mono text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>PQ-RDL Web 4.0 Blockchain Protocol • Post-Quantum Cryptography & Conway Automaton AI</div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400"><span className="text-cyan-400">Dilithium / Falcon / SPHINCS+</span><span>•</span><span className="text-purple-400">Proof-of-Automaton</span></div>
        </div>
      </footer>
    </div>
  );
}
