import React from 'react';
import { ShieldCheck, Cpu, Wallet, Boxes, Code2, Share2, Activity, Zap, Vote, Coins } from 'lucide-react';
import { ChainState, PQKeypair } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  chainState: ChainState | null;
  activeWallet: PQKeypair | null;
  onOpenWalletModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, chainState, activeWallet, onOpenWalletModal }) => {
  const navItems = [
    { id: 'dashboard', label: 'Network & Overview', icon: Activity },
    { id: 'conway', label: 'Conway Consensus Miner', icon: Cpu },
    { id: 'wallet', label: 'Post-Quantum Wallet', icon: Wallet },
    { id: 'explorer', label: 'Block Explorer', icon: Boxes },
    { id: 'contracts', label: 'AI Smart Contracts', icon: Code2 },
    { id: 'nodes', label: 'Peer Mesh Network', icon: Share2 },
    { id: 'governance', label: 'DAO Governance', icon: Vote },
    { id: 'tokenomics', label: 'Tokenomics', icon: Coins },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-cyan-500/20 bg-slate-950/90 text-slate-100 shadow-lg shadow-cyan-950/30 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-cyan-500/10 bg-gradient-to-r from-slate-950 via-cyan-950/40 to-slate-950 px-4 py-1 text-xs text-slate-400">
        <div className="flex items-center gap-4 overflow-x-auto whitespace-nowrap">
          <div className="flex items-center gap-1.5 text-cyan-400 font-mono"><span className="h-2 w-2 rounded-full bg-amber-400"></span><span>{chainState?.mode === 'DEMONSTRATION_IN_MEMORY' ? 'PQ-RDL Demonstration Mode' : 'PQ-RDL Network'}</span></div>
          <span className="font-mono">Height: <strong className="text-slate-200">{chainState?.height ?? 0}</strong></span>
          <span className="font-mono">Crypto: <strong className="text-cyan-300">Dilithium / Falcon / SPHINCS+</strong></span>
          <span className="font-mono">Consensus: <strong className="text-purple-300">Conway Proof-of-Automaton</strong></span>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 rounded border border-cyan-500/30 bg-cyan-950/80 px-2 py-0.5 font-mono text-[11px] text-cyan-300"><Zap className="h-3 w-3"/>TPS: {chainState?.tps ?? 'N/A'}</span>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <button onClick={() => setActiveTab('dashboard')} className="flex items-center gap-3 text-left">
          <div className="rounded-xl bg-gradient-to-br from-cyan-500 via-purple-600 to-indigo-600 p-0.5"><div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-slate-950"><ShieldCheck className="h-6 w-6 text-cyan-400"/></div></div>
          <div><h1 className="bg-gradient-to-r from-cyan-300 via-teal-200 to-purple-300 bg-clip-text font-mono text-lg font-bold text-transparent">PQ-RDL</h1><p className="text-[11px] font-mono text-slate-400">Post-Quantum Conway Automaton Chain</p></div>
        </button>
        <nav className="hidden items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/80 p-1.5 lg:flex">
          {navItems.map(item => { const Icon=item.icon; const active=activeTab===item.id; return <button key={item.id} onClick={()=>setActiveTab(item.id)} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium font-mono transition-all ${active?'border border-cyan-500/40 bg-cyan-500/15 text-cyan-300':'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}><Icon className="h-4 w-4"/>{item.label}</button>; })}
        </nav>
        <button onClick={onOpenWalletModal} className="rounded-lg bg-gradient-to-r from-cyan-600 to-purple-600 px-3.5 py-2 text-xs font-medium font-mono text-white">
          <Wallet className="mr-2 inline h-4 w-4"/>{activeWallet ? `${activeWallet.address.substring(0,8)}...` : 'Create PQ Wallet'}
        </button>
      </div>
      <div className="flex items-center gap-1 overflow-x-auto border-t border-slate-800 bg-slate-900/90 px-3 py-2 lg:hidden">
        {navItems.map(item => { const Icon=item.icon; return <button key={item.id} onClick={()=>setActiveTab(item.id)} className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-mono ${activeTab===item.id?'border border-cyan-500/40 bg-cyan-500/20 text-cyan-300':'text-slate-400'}`}><Icon className="h-3.5 w-3.5"/>{item.label}</button>; })}
      </div>
    </header>
  );
};