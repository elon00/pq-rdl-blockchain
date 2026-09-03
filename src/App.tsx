import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ConwayMinerView } from './components/ConwayMinerView';
import { PQWalletView } from './components/PQWalletView';
import { BlockExplorerView } from './components/BlockExplorerView';
import { SmartContractsView } from './components/SmartContractsView';
import { PeerMeshView } from './components/PeerMeshView';
import { ProjectQRCode } from './components/ProjectQRCode';
import { QMoosaModuleView } from './components/QMoosaModuleView';
import { ChainState, Block, PQKeypair, SmartContract, Transaction } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [chainState, setChainState] = useState<ChainState | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [contracts, setContracts] = useState<SmartContract[]>([]);
  const [activeWallet, setActiveWallet] = useState<PQKeypair | null>(null);
  const fetchBlockchainData = async () => { try {
    const [statusRes, blocksRes, contractsRes] = await Promise.all([fetch('/api/blockchain/status'),fetch('/api/blockchain/blocks'),fetch('/api/blockchain/contracts')]);
    if(statusRes.ok)setChainState(await statusRes.json()); if(blocksRes.ok)setBlocks(await blocksRes.json()); if(contractsRes.ok)setContracts(await contractsRes.json());
  } catch(err){console.error('Failed to fetch blockchain data:',err);} };
  useEffect(()=>{fetchBlockchainData();const i=setInterval(fetchBlockchainData,8000);return()=>clearInterval(i);},[]);
  const handleBlockMined=(b:Block)=>{setBlocks(p=>[...p,b]);fetchBlockchainData();};
  const handleSendTransaction=async(txData:Partial<Transaction>):Promise<boolean>=>{try{const r=await fetch('/api/blockchain/transaction',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(txData)});const d=await r.json();if(d.success){fetchBlockchainData();return true;}return false;}catch(err){console.error(err);return false;}};
  const handleDeployContract=async(contractData:{name:string;code:string;type:any;conwayTriggerRule:string;})=>{try{const r=await fetch('/api/blockchain/deploy-contract',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...contractData,creatorAddress:activeWallet?activeWallet.address:'pq1q_user_deployer'})});const d=await r.json();if(d.success&&d.contract)setContracts(p=>[...p,d.contract]);}catch(err){console.error(err);}};
  const moduleTabs=['token','staking','governance','nodes','analytics','bridge','identity','settings'];
  return <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
    <Navbar activeTab={activeTab} setActiveTab={setActiveTab} chainState={chainState} activeWallet={activeWallet} onOpenWalletModal={()=>setActiveTab('wallet')} />
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
      {activeTab==='dashboard'&&<DashboardView chainState={chainState} blocks={blocks} onNavigateTab={setActiveTab}/>}
      {activeTab==='conway'&&<ConwayMinerView onBlockMined={handleBlockMined} activeWallet={activeWallet}/>}
      {activeTab==='wallet'&&<PQWalletView activeWallet={activeWallet} onWalletGenerated={setActiveWallet} onSendTransaction={handleSendTransaction}/>}
      {activeTab==='explorer'&&<BlockExplorerView blocks={blocks}/>}
      {activeTab==='contracts'&&<SmartContractsView contracts={contracts} activeWallet={activeWallet} onDeployContract={handleDeployContract}/>}
      {activeTab==='nodes'&&<PeerMeshView/>}
      {moduleTabs.includes(activeTab)&&activeTab!=='nodes'&&<QMoosaModuleView kind={activeTab} chainState={chainState} blocks={blocks} contracts={contracts} wallet={activeWallet}/>}
      <div className="mt-8 max-w-sm"><ProjectQRCode label="Scan PQ-RDL project" value="https://github.com/elon00/pq-rdl-blockchain"/></div>
    </main>
    <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center font-mono text-xs text-slate-500">PQ-RDL Web 4.0 Blockchain Protocol • Reality-verified UI state</footer>
  </div>;
}