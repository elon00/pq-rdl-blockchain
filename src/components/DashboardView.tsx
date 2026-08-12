import React from 'react';
import {
  ShieldCheck,
  Cpu,
  Layers,
  Activity,
  Zap,
  Lock,
  Radio,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  FileCode2,
  Database
} from 'lucide-react';
import { ChainState, Block } from '../types';

interface DashboardViewProps {
  chainState: ChainState | null;
  blocks: Block[];
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  chainState,
  blocks,
  onNavigateTab,
}) => {
  const latestBlock = blocks[blocks.length - 1];

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 border border-cyan-500/30 p-6 sm:p-8 shadow-2xl shadow-cyan-950/40">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono">
            <BrainCircuit className="w-4 h-4 text-cyan-400" />
            <span>Web 4.0 Post-Quantum Cellular Engine</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-mono leading-tight">
            PQ-RDL Blockchain <br />
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-400 bg-clip-text text-transparent">
              Post-Quantum Crypto & Conway Automaton Consensus
            </span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            A next-generation Web 4.0 decentralized ledger secured by NIST Post-Quantum lattice cryptography
            (<strong className="text-cyan-300">CRYSTALS-Dilithium</strong> & <strong className="text-purple-300">SPHINCS+</strong>)
            and validated by <strong className="text-amber-300">Conway's Game of Life Proof-of-Automaton</strong> entropy evolution.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigateTab('conway')}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold font-mono px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <Cpu className="w-4 h-4" />
              <span>Launch Conway Automaton Miner</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigateTab('wallet')}
              className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-purple-500/40 font-mono px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-all cursor-pointer"
            >
              <Lock className="w-4 h-4 text-purple-400" />
              <span>Generate Quantum Keypair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Block Height */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2 hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Block Height</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            #{chainState?.height ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between pt-1 border-t border-slate-800/60">
            <span>Latest Hash:</span>
            <span className="text-cyan-300 font-mono">
              {chainState?.latestHash.substring(0, 8)}...
            </span>
          </div>
        </div>

        {/* Metric 2: Quantum Difficulty */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2 hover:border-purple-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Post-Quantum Security</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-300">
            NIST L5 Lattice
          </div>
          <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between pt-1 border-t border-slate-800/60">
            <span>Algorithms:</span>
            <span className="text-purple-300">Dilithium2 / Falcon / SPHINCS+</span>
          </div>
        </div>

        {/* Metric 3: Conway Entropy Rate */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2 hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Conway Entropy Index</span>
            <BrainCircuit className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300">
            {chainState?.averageEntropy ?? 0} H(x)
          </div>
          <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between pt-1 border-t border-slate-800/60">
            <span>Consensus Engine:</span>
            <span className="text-amber-300">B3/S23 Automaton</span>
          </div>
        </div>

        {/* Metric 4: Network TPS */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2 hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Network Throughput</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-300">
            {chainState?.tps ?? 1840} TPS
          </div>
          <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between pt-1 border-t border-slate-800/60">
            <span>Active Mesh Nodes:</span>
            <span className="text-emerald-300">{chainState?.activeNodes ?? 148} Peers</span>
          </div>
        </div>
      </div>

      {/* Feature Comparison Grid: Classical vs Web 4.0 Post-Quantum Conway */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quantum Security Matrix */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-white font-mono text-base">
                Quantum Threat Resistance Analysis
              </h3>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-mono">
              Quantum Secure
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {/* RSA / ECDSA Vulnerability row */}
            <div className="bg-slate-950/60 p-3 rounded-lg border border-red-500/20 flex items-center justify-between">
              <div>
                <div className="text-red-400 font-semibold">Classical ECDSA / RSA-2048</div>
                <div className="text-slate-400 text-[11px]">Shor's Quantum Algorithm Threat</div>
              </div>
              <span className="px-2 py-1 rounded bg-red-950 text-red-400 text-[11px] font-bold">
                VULNERABLE (0 Bits)
              </span>
            </div>

            {/* CRYSTALS-Dilithium row */}
            <div className="bg-slate-950/60 p-3 rounded-lg border border-cyan-500/30 flex items-center justify-between">
              <div>
                <div className="text-cyan-300 font-semibold">CRYSTALS-Dilithium2 / 3 / 5</div>
                <div className="text-slate-400 text-[11px]">Module Lattice Hardness (ML-DSA)</div>
              </div>
              <span className="px-2 py-1 rounded bg-cyan-950 text-cyan-300 text-[11px] font-bold">
                RESISTANT (128-256 Bits)
              </span>
            </div>

            {/* Falcon-512 row */}
            <div className="bg-slate-950/60 p-3 rounded-lg border border-purple-500/30 flex items-center justify-between">
              <div>
                <div className="text-purple-300 font-semibold">Falcon-512</div>
                <div className="text-slate-400 text-[11px]">NTRU Lattice Compact Signatures</div>
              </div>
              <span className="px-2 py-1 rounded bg-purple-950 text-purple-300 text-[11px] font-bold">
                RESISTANT (NIST Level 1)
              </span>
            </div>

            {/* SPHINCS+ row */}
            <div className="bg-slate-950/60 p-3 rounded-lg border border-amber-500/30 flex items-center justify-between">
              <div>
                <div className="text-amber-300 font-semibold">SPHINCS+ Stateless Hash Trees</div>
                <div className="text-slate-400 text-[11px]">Hash-Based Merkle Signature Scheme</div>
              </div>
              <span className="px-2 py-1 rounded bg-amber-950 text-amber-300 text-[11px] font-bold">
                RESISTANT (NIST Level 5)
              </span>
            </div>
          </div>
        </div>

        {/* Conway Proof-of-Automaton Consensus Mechanics */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-white font-mono text-base">
                Conway Proof-of-Automaton (PoA)
              </h3>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30 font-mono">
              Cellular Engine
            </span>
          </div>

          <p className="text-slate-300 text-xs leading-relaxed">
            Unlike classical PoW energy wasting or simple PoS stake concentration, PQ-RDL blocks are validated
            through <strong className="text-cyan-300">Conway's Cellular Automaton state propagation</strong>.
            Miners solve matrix entropy seeds (Gliders, Pulsars, Chaos Seeds) that must sustain entropy levels
            across <span className="text-amber-300 font-mono">N=15 generations</span>.
          </p>

          {/* Conway State Preview Grid */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Latest Genesis Grid Seed:</span>
              <span className="text-cyan-400 font-mono">B3/S23 Topological Matrix</span>
            </div>
            <div className="grid grid-cols-12 gap-1 p-2 bg-slate-900/60 rounded-lg">
              {Array.from({ length: 36 }).map((_, i) => {
                const isAlive = (i * 7 + 3) % 5 < 2;
                return (
                  <div
                    key={i}
                    className={`aspect-square rounded-xs transition-all ${
                      isAlive ? 'bg-cyan-400 shadow-sm shadow-cyan-400/50' : 'bg-slate-800/40'
                    }`}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
              <span>Grid Population: <strong className="text-white">16 Cells</strong></span>
              <span>Grid Shannon Entropy: <strong className="text-amber-300">{latestBlock?.entropyIndex ?? 42.8} H(x)</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Blocks Table Preview */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-white font-mono text-base">
              Latest Post-Quantum Blocks
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('explorer')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 cursor-pointer"
          >
            <span>View Full Explorer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800">
                <th className="pb-2">Height</th>
                <th className="pb-2">Block Hash</th>
                <th className="pb-2">Miner Address</th>
                <th className="pb-2">PQ Signature</th>
                <th className="pb-2">Conway Entropy</th>
                <th className="pb-2">TXs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {blocks.slice(-5).reverse().map((block) => (
                <tr key={block.height} className="hover:bg-slate-800/30">
                  <td className="py-2.5 font-bold text-cyan-400">#{block.height}</td>
                  <td className="py-2.5 text-slate-300">{block.hash.substring(0, 12)}...</td>
                  <td className="py-2.5 text-slate-400">
                    {block.minerAddress.substring(0, 10)}...
                  </td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 text-[10px] border border-purple-500/30">
                      {block.pqSignature.algorithm}
                    </span>
                  </td>
                  <td className="py-2.5 text-amber-300 font-bold">{block.entropyIndex} H(x)</td>
                  <td className="py-2.5 text-emerald-400">{block.transactions.length} txs</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
