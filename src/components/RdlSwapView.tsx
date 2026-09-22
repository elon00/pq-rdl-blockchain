import React, { useState } from 'react';
import {
  ArrowRightLeft,
  Coins,
  TrendingUp,
  RefreshCw,
  Zap,
  ShieldCheck,
  Percent,
  Layers,
  Sparkles,
  DollarSign,
  Flame,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { PQKeypair, Token } from '../types';
import { tokenEngine } from '../lib/tokenEngine';

interface RdlSwapViewProps {
  activeWallet: PQKeypair | null;
  onOpenWallet: () => void;
}

interface LiquidityPool {
  pair: string;
  token0: string; // Symbol
  token1: string; // Symbol
  reserve0: number;
  reserve1: number;
  feeRate: number; // 0.003 for 0.3%
}

export const RdlSwapView: React.FC<RdlSwapViewProps> = ({
  activeWallet,
  onOpenWallet,
}) => {
  const [pools, setPools] = useState<LiquidityPool[]>([
    {
      pair: 'RDL/rUSD',
      token0: 'RDL',
      token1: 'rUSD',
      reserve0: 100000,
      reserve1: 50000,
      feeRate: 0.003,
    },
    {
      pair: 'RDL/RLD',
      token0: 'RDL',
      token1: 'RLD',
      reserve0: 50000,
      reserve1: 5000000000,
      feeRate: 0.003,
    },
    {
      pair: 'rUSD/RLD',
      token0: 'rUSD',
      token1: 'RLD',
      reserve0: 25000,
      reserve1: 5000000000,
      feeRate: 0.003,
    },
  ]);

  const [fromToken, setFromToken] = useState<string>('RDL');
  const [toToken, setToToken] = useState<string>('rUSD');
  const [fromAmount, setFromAmount] = useState<number>(10);
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const activeAddress = activeWallet ? activeWallet.address : 'pq1dil2genesis00000000000000000000000000000';

  // Find pool matching selected pair
  const currentPool = pools.find(
    p => (p.token0 === fromToken && p.token1 === toToken) || (p.token0 === toToken && p.token1 === fromToken)
  ) || pools[0];

  // AMM formula: dy = (y * dx * 0.997) / (x + dx * 0.997)
  const isToken0From = currentPool.token0 === fromToken;
  const reserveIn = isToken0From ? currentPool.reserve0 : currentPool.reserve1;
  const reserveOut = isToken0From ? currentPool.reserve1 : currentPool.reserve0;

  const amountWithFee = fromAmount * (1 - currentPool.feeRate);
  const estimatedOutput = Number(((reserveOut * amountWithFee) / (reserveIn + amountWithFee)).toFixed(4));
  const rate = fromAmount > 0 ? (estimatedOutput / fromAmount).toFixed(4) : '0';
  const priceImpact = fromAmount > 0 ? ((fromAmount / (reserveIn + fromAmount)) * 100).toFixed(2) : '0.00';

  const handleFlipPair = () => {
    setFromToken(toToken);
    setToToken(fromToken);
  };

  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fromAmount <= 0) {
      setStatusMessage({ type: 'error', text: 'Enter a valid amount to swap.' });
      return;
    }

    setIsSwapping(true);
    setStatusMessage({ type: 'info', text: 'Running local constant-product AMM calculation...' });

    setTimeout(() => {
      // Execute swap state update
      currentPool.reserve0 = isToken0From ? currentPool.reserve0 + fromAmount : currentPool.reserve0 - estimatedOutput;
      currentPool.reserve1 = isToken0From ? currentPool.reserve1 - estimatedOutput : currentPool.reserve1 + fromAmount;
      setPools([...pools]);

      // Credit tokens in tokenEngine if applicable
      const toTokenObj = tokenEngine.getTokenById(toToken);
      if (toTokenObj) {
        toTokenObj.balances[activeAddress] = (toTokenObj.balances[activeAddress] || 0) + estimatedOutput;
      }

      setStatusMessage({
        type: 'success',
        text: `✅ AMM simulation completed: ${fromAmount} ${fromToken} → ${estimatedOutput.toLocaleString()} ${toToken}. No blockchain transaction was submitted.`,
      });
      setIsSwapping(false);
    }, 600);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-purple-950 to-slate-950 border border-purple-500/30 p-6 sm:p-8 shadow-2xl shadow-purple-950/40">
        <div className="relative z-10 space-y-3 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-mono">
            <ArrowRightLeft className="w-4 h-4 text-purple-400" />
            <span>RDL Constant-Product AMM Simulator</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-mono leading-tight">
            AMM Exchange Simulation <br />
            <span className="bg-gradient-to-r from-purple-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
              Swap RDL Native, rUSD Stablecoin & RLD Meme Coin
            </span>
          </h2>

          <p className="text-slate-300 text-sm leading-relaxed">
            Explore constant-product pool math (<span className="text-cyan-300 font-mono">x • y = k</span>) using local in-memory fixtures. This screen is not a deployed DEX and does not settle transactions on a public network.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono">
            <span className="px-3 py-1 rounded bg-slate-900 border border-purple-500/30 text-purple-300">
              LP Fee: 0.3%
            </span>
            <span className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
              Settlement: local simulation only
            </span>
            <span className="px-3 py-1 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-300">
              Slippage Tolerance: 0.5%
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
              : 'bg-purple-950/80 border-purple-500/40 text-purple-300'
          }`}
        >
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Main Grid: Swap Box (6 cols) | Liquidity Pools (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Swap Box */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-white text-sm">Instant Swap</h3>
            </div>
            <span className="text-[11px] text-slate-400">AMM demo • in-memory</span>
          </div>

          <form onSubmit={handleSwap} className="space-y-4">
            {/* Pay Input Box */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>You Pay</span>
                <span>Active Account</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(Math.max(0, Number(e.target.value)))}
                  step="any"
                  className="flex-1 bg-transparent text-xl font-bold text-white outline-none"
                  placeholder="0.0"
                />
                <select
                  value={fromToken}
                  onChange={(e) => setFromToken(e.target.value)}
                  className="bg-slate-900 border border-purple-500/30 rounded-lg px-3 py-1.5 text-purple-300 font-bold outline-none cursor-pointer"
                >
                  <option value="RDL">RDL (Native)</option>
                  <option value="rUSD">rUSD (Stablecoin)</option>
                  <option value="RLD">RLD (Meme Coin)</option>
                </select>
              </div>
            </div>

            {/* Flip Button */}
            <div className="flex justify-center -my-1">
              <button
                type="button"
                onClick={handleFlipPair}
                className="p-2 rounded-full bg-slate-900 border border-purple-500/40 text-purple-300 hover:text-white hover:border-purple-400 transition-all cursor-pointer shadow-md"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Receive Output Box */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>You Receive (Estimated)</span>
                <span>Includes 0.3% LP Fee</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 text-xl font-bold text-emerald-400 truncate">
                  {estimatedOutput.toLocaleString()}
                </div>
                <select
                  value={toToken}
                  onChange={(e) => setToToken(e.target.value)}
                  className="bg-slate-900 border border-emerald-500/30 rounded-lg px-3 py-1.5 text-emerald-300 font-bold outline-none cursor-pointer"
                >
                  <option value="rUSD">rUSD (Stablecoin)</option>
                  <option value="RLD">RLD (Meme Coin)</option>
                  <option value="RDL">RDL (Native)</option>
                </select>
              </div>
            </div>

            {/* Swap Details Summary */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
              <div className="flex justify-between">
                <span>Exchange Rate:</span>
                <span className="text-white font-bold">1 {fromToken} ≈ {rate} {toToken}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Price Impact:</span>
                <span className="text-cyan-400 font-bold">&lt; {priceImpact}%</span>
              </div>
              <div className="flex justify-between">
                <span>Liquidity Provider Fee:</span>
                <span className="text-purple-300 font-bold">{(fromAmount * 0.003).toFixed(4)} {fromToken}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSwapping}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 hover:opacity-90 font-bold text-slate-950 cursor-pointer shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>{isSwapping ? 'Running Simulation...' : `Swap ${fromToken} to ${toToken}`}</span>
            </button>
          </form>
        </div>

        {/* Liquidity Pools Telemetry */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-white text-sm">Demo Liquidity Pool Fixtures</h3>
            </div>
            <span className="text-[11px] text-emerald-400 font-bold">3 Demo Pools</span>
          </div>

          <div className="space-y-3">
            {pools.map((pool) => (
              <div
                key={pool.pair}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 hover:border-purple-500/30 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{pool.pair}</span>
                  <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30 text-[10px]">
                    0.3% Fee Tier
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                  <div>
                    <span>Reserve {pool.token0}:</span>
                    <div className="text-white font-bold">{pool.reserve0.toLocaleString()} {pool.token0}</div>
                  </div>
                  <div>
                    <span>Reserve {pool.token1}:</span>
                    <div className="text-white font-bold">{pool.reserve1.toLocaleString()} {pool.token1}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-[11px] text-purple-200/90 leading-relaxed">
            💡 <strong>Sovereign RDL Liquidity</strong>: Automated market makers on RDL are executed via deterministic state transitions recorded on-chain, allowing frictionless swaps between the native gas coin, algorithmic stablecoin (rUSD), and meme coin (RLD).
          </div>
        </div>
      </div>
    </div>
  );
};
