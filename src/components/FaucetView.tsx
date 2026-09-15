import React, { useState } from 'react';
import {
  Droplets,
  Coins,
  ShieldCheck,
  Zap,
  Flame,
  DollarSign,
  Send,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { PQKeypair } from '../types';
import { faucetEngine, FaucetClaim } from '../lib/faucetEngine';

interface FaucetViewProps {
  activeWallet: PQKeypair | null;
  onOpenWallet: () => void;
  onFaucetClaimed?: (claim: FaucetClaim) => void;
}

export const FaucetView: React.FC<FaucetViewProps> = ({
  activeWallet,
  onOpenWallet,
  onFaucetClaimed,
}) => {
  const [recipient, setRecipient] = useState<string>(activeWallet ? activeWallet.address : '');
  const [dropType, setDropType] = useState<'ALL' | 'NATIVE' | 'STABLECOIN' | 'MEMECOIN'>('ALL');
  const [isDispensing, setIsDispensing] = useState<boolean>(false);
  const [recentClaims, setRecentClaims] = useState<FaucetClaim[]>(faucetEngine.getRecentClaims());
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const stats = faucetEngine.getStats();

  const handleDispense = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetAddress = recipient.trim() || (activeWallet ? activeWallet.address : '');

    if (!targetAddress) {
      setStatusMessage({ type: 'error', text: 'Please enter a post-quantum wallet address or connect your wallet.' });
      return;
    }

    setIsDispensing(true);
    setStatusMessage({ type: 'info', text: 'Validating Conway Proof-of-Automaton entropy and preparing post-quantum drop...' });

    try {
      const result = await faucetEngine.dispense(targetAddress, dropType);

      if (result.success && result.claim) {
        setRecentClaims(faucetEngine.getRecentClaims());
        if (onFaucetClaimed) onFaucetClaimed(result.claim);
        setStatusMessage({
          type: 'success',
          text: `🎉 Faucet Drop Confirmed! 50 RDL, ${result.claim.stablecoinAmount.toLocaleString()} RDL-USD, and ${result.claim.memecoinAmount.toLocaleString()} RDL-MEME credited to ${targetAddress.slice(0, 16)}... Tx: ${result.claim.txHash.slice(0, 18)}...`,
        });
      } else {
        setStatusMessage({ type: 'error', text: result.error || 'Faucet dispensation failed.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Dispensation error.' });
    } finally {
      setIsDispensing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-950 border border-teal-500/30 p-6 sm:p-8 shadow-2xl shadow-teal-950/40">
        <div className="relative z-10 space-y-3 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/80 border border-teal-500/40 text-teal-300 text-xs font-mono">
            <Droplets className="w-4 h-4 text-teal-400" />
            <span>RDL Testnet Public Faucet Dispenser</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-mono leading-tight">
            Free Devnet & Testnet Faucet <br />
            <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-amber-400 bg-clip-text text-transparent">
              Claim Free Native RDL, RDL Stablecoin & RDL Meme Coin
            </span>
          </h2>

          <p className="text-slate-300 text-sm leading-relaxed">
            Get instant free testnet coins on <strong className="text-teal-300">RDL-TESTNET-001</strong> to pay for gas, test smart contracts, execute transfers, or experiment with Conway cellular automaton mining.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono">
            <span className="px-3 py-1 rounded bg-slate-900 border border-teal-500/30 text-teal-300">
              Chain ID: RDL-TESTNET-001
            </span>
            <span className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
              Rate Limit: 1 request / 60 seconds
            </span>
            <span className="px-3 py-1 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-300">
              Cost: 100% Free
            </span>
          </div>
        </div>
      </div>

      {/* Notification */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border flex items-start justify-between gap-3 text-xs font-mono ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
              : statusMessage.type === 'error'
              ? 'bg-red-950/80 border-red-500/40 text-red-300'
              : 'bg-teal-950/80 border-teal-500/40 text-teal-300'
          }`}
        >
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Main Faucet Card & Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Dispenser Form (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-teal-400" />
              <h3 className="font-bold text-white font-mono text-sm">
                Request Testnet Faucet Drop
              </h3>
            </div>
            {activeWallet && (
              <button
                type="button"
                onClick={() => setRecipient(activeWallet.address)}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 cursor-pointer underline"
              >
                Use Connected Wallet
              </button>
            )}
          </div>

          <form onSubmit={handleDispense} className="space-y-5 font-mono text-xs">
            <div>
              <label className="block text-slate-400 mb-1.5">Recipient Post-Quantum Address</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="e.g. pq1dil2... or pq1flc..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none"
                required
              />
              {!activeWallet && (
                <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                  <span>Don't have an address yet?</span>
                  <button
                    type="button"
                    onClick={onOpenWallet}
                    className="text-purple-400 hover:underline cursor-pointer"
                  >
                    Generate Post-Quantum Keypair
                  </button>
                </div>
              )}
            </div>

            {/* Drop Package Selection */}
            <div>
              <label className="block text-slate-400 mb-2">Select Faucet Drop Package</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setDropType('ALL')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    dropType === 'ALL'
                      ? 'bg-teal-950/60 border-teal-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-teal-300 flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span>Developer Starter Pack (Recommended)</span>
                  </div>
                  <div className="text-[11px] text-slate-300 space-y-0.5">
                    <div>• 50 RDL Native Gas</div>
                    <div>• 1,000 RDL-USD Stablecoin</div>
                    <div>• 10,000,000 RDL-MEME Coin</div>
                  </div>
                </div>

                <div
                  onClick={() => setDropType('STABLECOIN')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    dropType === 'STABLECOIN'
                      ? 'bg-emerald-950/60 border-emerald-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span>RDL Stablecoin Only</span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    <div>• 1,000 RDL-USD (100% Vault Pegged)</div>
                    <div className="text-slate-500">For DeFi & escrow testing</div>
                  </div>
                </div>

                <div
                  onClick={() => setDropType('MEMECOIN')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    dropType === 'MEMECOIN'
                      ? 'bg-amber-950/60 border-amber-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-amber-400 flex items-center gap-1.5 mb-1">
                    <Flame className="w-4 h-4" />
                    <span>RDL Meme Coin Only</span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    <div>• 10,000,000 RDL-MEME</div>
                    <div className="text-slate-500">1.5% Conway cellular burn</div>
                  </div>
                </div>

                <div
                  onClick={() => setDropType('NATIVE')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    dropType === 'NATIVE'
                      ? 'bg-cyan-950/60 border-cyan-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-cyan-400 flex items-center gap-1.5 mb-1">
                    <Coins className="w-4 h-4" />
                    <span>Native RDL Gas Only</span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    <div>• 50 RDL / QBits</div>
                    <div className="text-slate-500">For transaction & contract fees</div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isDispensing}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 hover:opacity-90 font-bold text-slate-950 cursor-pointer shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Droplets className="w-4 h-4" />
              <span>{isDispensing ? 'Dispensing Testnet Coins...' : 'Dispense Free Testnet Drop'}</span>
            </button>
          </form>
        </div>

        {/* Faucet Reserves & Network Telemetry (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 font-mono text-xs">
            <h4 className="font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Testnet Faucet Treasury Status</span>
            </h4>

            <div className="space-y-3">
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">Total Drops Dispensed:</span>
                <span className="text-white font-bold">{stats.totalDispensations} Drops</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">Total RDL Native Dropped:</span>
                <span className="text-cyan-300 font-bold">{stats.totalNativeDispensed.toLocaleString()} RDL</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">Total RDL-USD Dropped:</span>
                <span className="text-emerald-400 font-bold">${stats.totalStablecoinDispensed.toLocaleString()} USDR</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">Total RDL-MEME Dropped:</span>
                <span className="text-amber-400 font-bold">{stats.totalMemecoinDispensed.toLocaleString()} MEME</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-teal-950/30 border border-teal-500/20 text-[11px] text-teal-200/90 leading-relaxed">
              💡 <strong>Proof-of-Automaton Protection</strong>: Faucet requests are backed by deterministic nonces verified through Conway's cellular automaton entropy rules to prevent Sybil bot exhaustion while keeping claims completely free.
            </div>
          </div>
        </div>
      </div>

      {/* Recent Dispensation History */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 font-mono text-xs">
        <h4 className="font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>Recent Testnet Faucet Dispensations</span>
        </h4>

        {recentClaims.length === 0 ? (
          <div className="text-slate-500 py-6 text-center">No recent faucet claims in this session yet. Request a drop above!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="pb-2">Tx Hash</th>
                  <th className="pb-2">Recipient Address</th>
                  <th className="pb-2">Native RDL</th>
                  <th className="pb-2">RDL-USD</th>
                  <th className="pb-2">RDL-MEME</th>
                  <th className="pb-2">Time</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {recentClaims.map((claim) => (
                  <tr key={claim.txHash} className="hover:bg-slate-800/30">
                    <td className="py-2.5 text-cyan-400">{claim.txHash.slice(0, 14)}...</td>
                    <td className="py-2.5 text-slate-400">{claim.recipientAddress.slice(0, 16)}...</td>
                    <td className="py-2.5 text-cyan-300 font-bold">{claim.nativeCoins > 0 ? `+${claim.nativeCoins}` : '-'}</td>
                    <td className="py-2.5 text-emerald-400 font-bold">{claim.stablecoinAmount > 0 ? `+${claim.stablecoinAmount.toLocaleString()}` : '-'}</td>
                    <td className="py-2.5 text-amber-400 font-bold">{claim.memecoinAmount > 0 ? `+${claim.memecoinAmount.toLocaleString()}` : '-'}</td>
                    <td className="py-2.5 text-slate-500">{new Date(claim.timestamp).toLocaleTimeString()}</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] border border-emerald-500/30">
                        {claim.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
