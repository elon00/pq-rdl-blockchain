import React from 'react';
import { Coins, Infinity, ShieldAlert, Database } from 'lucide-react';

export const TokenomicsView: React.FC = () => {
  return <div className="space-y-6">
    <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 to-slate-900 p-6">
      <div className="flex items-start gap-4"><div className="rounded-xl bg-cyan-500/15 p-3"><Coins className="text-cyan-300"/></div><div><h2 className="text-2xl font-bold">Native Asset & Tokenomics</h2><p className="mt-2 text-slate-400">Protocol economics workspace with truth-first status labels.</p></div></div>
    </div>
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5"><Infinity className="h-6 w-6 text-cyan-300"/><p className="mt-3 text-sm text-slate-400">Supply policy</p><p className="text-lg font-semibold">Unlimited / uncapped — proposed</p></div>
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5"><Database className="h-6 w-6 text-purple-300"/><p className="mt-3 text-sm text-slate-400">On-chain asset</p><p className="text-lg font-semibold">Not deployed</p></div>
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5"><ShieldAlert className="h-6 w-6 text-amber-300"/><p className="mt-3 text-sm text-slate-400">Public testnet</p><p className="text-lg font-semibold">Not verified</p></div>
    </div>
    <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6"><h3 className="font-semibold">Truth-first implementation status</h3><ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-400"><li>The UI records the requested uncapped-supply policy as a design decision, not as an already-minted blockchain fact.</li><li>Final token name, symbol, emission rules, validator rewards, fees, and governance authority must be implemented in protocol code and verified before public claims.</li><li>Unlimited supply requires explicit monetary-policy controls and governance rules before mainnet launch.</li></ul></section>
  </div>;
};