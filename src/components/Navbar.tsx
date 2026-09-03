import React from 'react';
import {
  ShieldCheck,
  Cpu,
  Wallet,
  Boxes,
  Code2,
  Share2,
  Sparkles,
  Activity,
  Zap
} from 'lucide-react';
import { ChainState, PQKeypair } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  chainState: ChainState | null;
  activeWallet: PQKeypair | null;
  onOpenWalletModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  chainState,
  activeWallet,
  onOpenWalletModal,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Network & Overview', icon: Activity },
    { id: 'conway', label: 'Conway Consensus Miner', icon: Cpu },
    { id: 'wallet', label: 'Post-Quantum Wallet', icon: Wallet },
    { id: 'explorer', label: 'Block Explorer', icon: Boxes },
    { id: 'contracts', label: 'Web 4.0 AI Smart Contracts', icon: Code2 },
    { id: 'nodes', label: 'Peer Mesh Network', icon: Share2 },
    { id: 'token', label: 'QMS Token', icon: Sparkles },
    { id: 'staking', label: 'Staking', icon: Activity },
    { id: 'governance', label: 'Governance / DAO', icon: ShieldCheck },
    { id: 'analytics', label: 'Analytics', icon: Activity },
    { id: 'bridge', label: 'Cross-Chain Bridge', icon: Share2 },
    { id: 'identity', label: 'Digital Identity', icon: ShieldCheck },
    { id: 'settings', label: 'Network Settings', icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-cyan-500/20 text-slate-100 shadow-lg shadow-cyan-950/30">
      {/* Top Banner Ticker */}
      <div className="bg-gradient-to-r from-slate-950 via-cyan-950/40 to-slate-950 px-4 py-1 text-xs border-b border-cyan-500/10 flex items-center justify-between text-slate-400">
        <div className="flex items-center gap-4 overflow-x-auto whitespace-nowrap scrollbar-none">
          <div className="flex items-center gap-1.5 text-cyan-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>PQ-RDL Web 4.0 Mainnet</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="font-mono">
            Height: <strong className="text-slate-200">{chainState?.height ?? 0}</strong>
          </span>
          <span className="text-slate-600">|</span>
          <span className="font-mono">
            Crypto: <strong className="text-cyan-300">Dilithium / Falcon / SPHINCS+</strong>
          </span>
          <span className="text-slate-600">|</span>
          <span className="font-mono">
            Consensus: <strong className="text-purple-300">Conway Proof-of-Automaton</strong>
          </span>
          <span className="text-slate-600">|</span>
          <span className="font-mono">
            Avg Entropy: <strong className="text-amber-300">{chainState?.averageEntropy ?? 0} H(x)</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] bg-cyan-950/80 border border-cyan-500/30 px-2 py-0.5 rounded text-cyan-300 font-mono">
            <Zap className="w-3 h-3 text-cyan-400" /> {chainState?.tps ?? 1840} TPS
          </span>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-purple-600 to-indigo-600 p-0.5 shadow-md shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg tracking-wide text-white font-mono bg-gradient-to-r from-cyan-300 via-teal-200 to-purple-300 bg-clip-text text-transparent">
                PQ-RDL
              </h1>
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-900/50 border border-purple-500/30 text-purple-300 font-mono font-semibold">
                Web 4.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Post-Quantum Conway Automaton Chain
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium font-mono transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Active Wallet Control */}
        <div className="flex items-center gap-2">
          {activeWallet ? (
            <button
              onClick={onOpenWalletModal}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 px-3 py-1.5 rounded-lg text-xs font-mono transition-all text-cyan-300"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              <span className="hidden sm:inline">{activeWallet.algorithm}:</span>
              <span className="text-slate-300">
                {activeWallet.address.substring(0, 8)}...{activeWallet.address.slice(-6)}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenWalletModal}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white px-3.5 py-2 rounded-lg text-xs font-medium font-mono shadow-md shadow-cyan-900/30 transition-all"
            >
              <Wallet className="w-4 h-4" />
              <span>Create PQ Wallet</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Row */}
      <div className="lg:hidden flex items-center gap-1 px-3 py-2 overflow-x-auto bg-slate-900/90 border-t border-slate-800 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
