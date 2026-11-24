import React, { useState } from 'react';
import {
  Boxes,
  Search,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
  Clock
} from 'lucide-react';
import { Block, Transaction } from '../types';

interface BlockExplorerViewProps {
  blocks: Block[];
}

export const BlockExplorerView: React.FC<BlockExplorerViewProps> = ({ blocks }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedBlockHeight, setExpandedBlockHeight] = useState<number | null>(null);

  // Filter blocks
  const filteredBlocks = blocks.filter((b) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      b.height.toString() === term ||
      b.hash.toLowerCase().includes(term) ||
      b.minerAddress.toLowerCase().includes(term)
    );
  });

  const toggleExpand = (height: number) => {
    setExpandedBlockHeight(expandedBlockHeight === height ? null : height);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold">
            <Boxes className="w-4 h-4 text-cyan-400" />
            <span>Immutable Post-Quantum Ledger</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-mono text-white">
            Web 4.0 Block Explorer
          </h2>
          <p className="text-slate-400 text-xs">
            Inspect post-quantum block signatures, transactions, and Conway automaton cell states.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search height or block hash..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Block List */}
      <div className="space-y-4">
        {filteredBlocks.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 font-mono text-sm">
            No blocks matched search term "{searchTerm}"
          </div>
        ) : (
          filteredBlocks
            .slice()
            .reverse()
            .map((block) => {
              const isExpanded = expandedBlockHeight === block.height;
              const dateStr = new Date(block.timestamp).toLocaleString();

              return (
                <div
                  key={block.height}
                  className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 transition-all space-y-4"
                >
                  {/* Block Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-sm">
                        #{block.height}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold text-sm">
                            Hash: {block.hash.substring(0, 16)}...
                          </span>
                          <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 text-[10px] border border-purple-500/30">
                            {block.pqSignature.algorithm}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{dateStr}</span>
                          <span>•</span>
                          <span>Miner: {block.minerAddress.substring(0, 10)}...</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right text-xs">
                        <div className="text-amber-300 font-bold">
                          {block.entropyIndex} H(x)
                        </div>
                        <div className="text-slate-400 text-[10px]">
                          {block.transactions.length} Transactions
                        </div>
                      </div>

                      <button
                        onClick={() => toggleExpand(block.height)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Block Details */}
                  {isExpanded && (
                    <div className="pt-4 border-t border-slate-800 space-y-4 text-xs font-mono">
                      {/* Grid State & Proof */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <div className="space-y-2">
                          <div className="text-slate-400 font-bold flex items-center gap-2">
                            <Cpu className="w-4 h-4 text-cyan-400" />
                            <span>Conway Final Matrix State:</span>
                          </div>
                          <div className="grid grid-cols-8 gap-1 p-2 bg-slate-900 rounded-lg">
                            {block.miningProof.finalGrid.slice(0, 4).flatMap((row, r) =>
                              row.slice(0, 8).map((cell, c) => (
                                <div
                                  key={`${r}-${c}`}
                                  className={`aspect-square rounded-xs ${
                                    cell === 1 ? 'bg-cyan-400 shadow-xs shadow-cyan-400/50' : 'bg-slate-800'
                                  }`}
                                />
                              ))
                            )}
                          </div>
                        </div>

                        <div className="space-y-2 text-slate-300 text-[11px]">
                          <div>
                            Previous Block Hash:{' '}
                            <span className="text-slate-400">{block.previousHash.substring(0, 20)}...</span>
                          </div>
                          <div>
                            Proof Nonce: <span className="text-cyan-300">{block.miningProof.nonce}</span>
                          </div>
                          <div>
                            Generations Evolved:{' '}
                            <span className="text-amber-300">{block.miningProof.generationsRun}</span>
                          </div>
                          <div>
                            PQ Signature Hex:{' '}
                            <span className="text-purple-300 break-all">{block.pqSignature.signatureHex}</span>
                          </div>
                        </div>
                      </div>

                      {/* Transaction Ledger Table inside Block */}
                      <div className="space-y-2">
                        <div className="text-slate-300 font-bold">Confirmed Transactions ({block.transactions.length}):</div>
                        <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto">
                          <table className="w-full text-left text-[11px]">
                            <thead>
                              <tr className="text-slate-400 border-b border-slate-800">
                                <th className="p-2.5">Tx Hash</th>
                                <th className="p-2.5">Sender</th>
                                <th className="p-2.5">Receiver</th>
                                <th className="p-2.5">Amount</th>
                                <th className="p-2.5">Payload Attachment</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 text-slate-300">
                              {block.transactions.map((tx) => (
                                <tr key={tx.txHash}>
                                  <td className="p-2.5 text-cyan-400">{tx.txHash.substring(0, 12)}...</td>
                                  <td className="p-2.5">{tx.senderAddress.substring(0, 10)}...</td>
                                  <td className="p-2.5">{tx.receiverAddress.substring(0, 10)}...</td>
                                  <td className="p-2.5 font-bold text-emerald-400">{tx.amount} QBits</td>
                                  <td className="p-2.5 text-amber-300">{tx.conwayStatePayload || 'N/A'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
        )}
      </div>
    </div>
  );
};
