import React, { useMemo, useState } from 'react';
import { Vote, FileText, ShieldCheck, Users, Clock } from 'lucide-react';
import { PQKeypair } from '../types';

interface Props { activeWallet: PQKeypair | null; }
type Proposal = { id:number; title:string; description:string; status:'Discussion'|'Voting'|'Passed'; forVotes:number; againstVotes:number; };

export const GovernanceView: React.FC<Props> = ({ activeWallet }) => {
  const [proposals, setProposals] = useState<Proposal[]>([
    { id: 1, title: 'Testnet validator admission policy', description: 'Define transparent eligibility and evidence requirements for public testnet operators.', status: 'Voting', forVotes: 0, againstVotes: 0 },
    { id: 2, title: 'Treasury reporting standard', description: 'Adopt reproducible public reporting and versioned governance records.', status: 'Discussion', forVotes: 0, againstVotes: 0 },
  ]);
  const [draft, setDraft] = useState('');
  const voter = activeWallet ? activeWallet.address : null;
  const totalVotes = useMemo(() => proposals.reduce((n,p)=>n+p.forVotes+p.againstVotes,0), [proposals]);

  const vote = (id:number, side:'forVotes'|'againstVotes') => {
    if (!voter) return;
    setProposals(items => items.map(p => p.id === id ? { ...p, [side]: p[side] + 1 } : p));
  };
  const submit = () => {
    const title = draft.trim();
    if (!title) return;
    setProposals(items => [...items, { id: Date.now(), title, description: 'Community proposal draft. Off-chain demonstration record only until governance is connected to a verified network.', status:'Discussion', forVotes:0, againstVotes:0 }]);
    setDraft('');
  };

  return <div className="space-y-6">
    <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950/40 to-slate-900 p-6">
      <div className="flex items-start gap-4"><div className="rounded-xl bg-purple-500/15 p-3"><Vote className="text-purple-300" /></div><div><h2 className="text-2xl font-bold">QMoosa DAO Governance</h2><p className="mt-2 text-slate-400">Transparent proposal workflow designed for the protocol roadmap.</p></div></div>
      <div className="mt-4 flex flex-wrap gap-3 text-sm"><span className="rounded-lg border border-slate-700 px-3 py-2"><Users className="mr-2 inline h-4 w-4"/>Votes: {totalVotes}</span><span className="rounded-lg border border-amber-500/30 px-3 py-2 text-amber-200"><ShieldCheck className="mr-2 inline h-4 w-4"/>Demo UI — not on-chain governance</span></div>
    </div>

    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <h3 className="font-semibold">Create proposal</h3>
      <div className="mt-3 flex gap-3"><input value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Proposal title" className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-purple-400"/><button onClick={submit} className="rounded-lg bg-purple-600 px-4 py-2 font-medium hover:bg-purple-500">Submit</button></div>
      {!voter && <p className="mt-3 text-xs text-amber-300">Create a PQ wallet before voting.</p>}
    </div>

    <div className="grid gap-4">
      {proposals.map(p => <article key={p.id} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold">{p.title}</h3><p className="mt-2 max-w-3xl text-sm text-slate-400">{p.description}</p></div><span className="rounded-full border border-cyan-500/30 px-3 py-1 text-xs text-cyan-300"><Clock className="mr-1 inline h-3 w-3"/>{p.status}</span></div>
        <div className="mt-4 flex gap-3"><button disabled={!voter || p.status!=='Voting'} onClick={()=>vote(p.id,'forVotes')} className="rounded-lg bg-emerald-600/80 px-4 py-2 disabled:opacity-40">For {p.forVotes}</button><button disabled={!voter || p.status!=='Voting'} onClick={()=>vote(p.id,'againstVotes')} className="rounded-lg bg-rose-600/80 px-4 py-2 disabled:opacity-40">Against {p.againstVotes}</button></div>
      </article>)}
    </div>
    <p className="text-xs text-slate-500"><FileText className="mr-1 inline h-3 w-3"/>Votes and proposals are currently browser-session demonstration state; they are not settlement evidence and are not written to the blockchain.</p>
  </div>;
};