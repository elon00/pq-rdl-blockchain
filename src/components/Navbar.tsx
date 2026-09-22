import React from 'react';
import {
  ShieldCheck, Cpu, Wallet, Boxes, Code2, Share2, Activity, Zap, Coins, Droplets, ArrowRightLeft, Terminal
} from 'lucide-react';
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
    { id: 'faucet', label: 'Demo Faucet', icon: Droplets },
    { id: 'swap', label: 'AMM Simulator', icon: ArrowRightLeft },
    { id: 'tokens', label: 'Token Demo Lab', icon: Coins },
    { id: 'conway', label: 'Conway Proof Simulator', icon: Cpu },
    { id: 'wallet', label: 'Post-Quantum Wallet', icon: Wallet },
    { id: 'explorer', label: 'Block Explorer', icon: Boxes },
    { id: 'contracts', label: 'Web 4.0 AI Smart Contracts', icon: Code2 },
    { id: 'nodes', label: 'Peer Mesh Simulator', icon: Share2 },
    { id: 'developer', label: 'Developer Platform & RPC', icon: Terminal },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-cyan-500/20 text-slate-100 shadow-lg shadow-cyan-950/30">
      <div className="bg-gradient-to-r from-slate-950 via-cyan-950/40 to-slate-950 px-4 py-1 text-xs border-b border-cyan-500/10 flex items-center justify-between text-slate-400">
        <div className="flex items-center gap-4 min-w-0 pq-horizontal-scroll whitespace-nowrap">
          <div className="flex items-center gap-1.5 text-cyan-400 font-mono shrink-0">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>PQ-RDL — Prototype / CI-verified local devnet; public testnet not verified</span>
          </div>
          <span className="text-slate-600 shrink-0">|</span>
          <span className="font-mono shrink-0">Height: <strong className="text-slate-200">{chainState?.height ?? 0}</strong></span>
          <span className="text-slate-600 shrink-0">|</span>
          <span className="font-mono shrink-0">Crypto: <strong className="text-cyan-300">ML-DSA-65 implementation</strong></span>
          <span className="text-slate-600 shrink-0">|</span>
          <span className="font-mono shrink-0">Consensus: <strong className="text-purple-300">Conway Proof-of-Automaton</strong></span>
          <span className="text-slate-600 shrink-0">|</span>
          <span className="font-mono shrink-0">Avg Entropy: <strong className="text-amber-300">{chainState?.averageEntropy ?? 0} H(x)</strong></span>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-3">
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] bg-cyan-950/80 border border-cyan-500/30 px-2 py-0.5 rounded text-cyan-300 font-mono">
            <Zap className="w-3 h-3 text-cyan-400" /> {chainState?.tps !== null && chainState?.tps !== undefined ? `${chainState.tps} TPS` : 'TPS not measured'}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4 min-w-0">
        <div onClick={() => setActiveTab('dashboard')} className="flex items-center gap-3 cursor-pointer group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-purple-600 to-indigo-600 p-0.5 shadow-md shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center"><ShieldCheck className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" /></div>
          </div>
          <div>
            <div className="flex items-center gap-2"><h1 className="font-bold text-lg tracking-wide text-white font-mono bg-gradient-to-r from-cyan-300 via-teal-200 to-purple-300 bg-clip-text text-transparent">PQ-RDL</h1><span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-900/50 border border-purple-500/30 text-purple-300 font-mono font-semibold">Web 4.0</span></div>
            <p className="text-[11px] text-slate-400 font-mono">PQC + consensus research prototype</p>
          </div>
        </div>

        <nav className="hidden lg:flex min-w-0 flex-1 items-center gap-1 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 pq-horizontal-scroll whitespace-nowrap">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium font-mono transition-all shrink-0 ${isActive ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'}`}><Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />{item.label}</button>;
          })}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          {activeWallet ? <button onClick={onOpenWalletModal} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 px-3 py-1.5 rounded-lg text-xs font-mono transition-all text-cyan-300"><div className="w-2 h-2 rounded-full bg-emerald-400" /><span className="hidden xl:inline">{activeWallet.algorithm}:</span><span className="text-slate-300">{activeWallet.address.substring(0, 8)}...{activeWallet.address.slice(-6)}</span></button> : <button onClick={onOpenWalletModal} className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white px-3 py-2 rounded-lg text-xs font-medium font-mono shadow-md shadow-cyan-900/30 transition-all"><Wallet className="w-4 h-4" /><span className="hidden xl:inline">Create PQ Wallet</span><span className="xl:hidden">PQ Wallet</span></button>}
        </div>
      </div>

      <div className="lg:hidden flex items-center gap-1 px-3 py-2 bg-slate-900/90 border-t border-slate-800 pq-horizontal-scroll whitespace-nowrap">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap shrink-0 transition-all ${isActive ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'}`}><Icon className="w-3.5 h-3.5" />{item.label}</button>;
        })}
      </div>
    </header>
  );
};
