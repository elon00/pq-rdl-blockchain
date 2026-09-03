import React from 'react';
import { Coins, Landmark, Vote, ServerCog, BarChart3, GitFork, Fingerprint, Settings } from 'lucide-react';
import { Block, ChainState, PQKeypair, SmartContract } from '../types';

type Props={kind:string;chainState:ChainState|null;blocks:Block[];contracts:SmartContract[];wallet:PQKeypair|null;};

const meta:any={
 token:{title:'QMS Token & Coin',icon:Coins,description:'Network-native token interface. Supply and issuance are shown only from verified chain configuration.',metrics:['Chain height','TPS','Wallet']},
 staking:{title:'Staking',icon:Landmark,description:'Staking dashboard shell synchronized with wallet and network state. No fake rewards are generated.',metrics:['Wallet','Blocks','Contracts']},
 governance:{title:'Governance / DAO',icon:Vote,description:'Proposal and governance interface backed by the existing contract model when governance contracts are available.',metrics:['Contracts','Chain height','Blocks']},
 nodes:{title:'Node Operator',icon:ServerCog,description:'Operational view synchronized with Peer Mesh and current chain status.',metrics:['Chain height','TPS','Blocks']},
 analytics:{title:'Network Analytics',icon:BarChart3,description:'Live derived analytics from fetched chain state and block data.',metrics:['Blocks','TPS','Entropy']},
 bridge:{title:'Cross-Chain / Bridge',icon:GitFork,description:'Bridge UI is an interface only until real bridge endpoints and settlement evidence are configured.',metrics:['Wallet','Contracts','Blocks']},
 identity:{title:'Digital Identity',icon:Fingerprint,description:'Identity interface for supported identity smart-contract types.',metrics:['Wallet','Contracts','Chain height']},
 settings:{title:'Settings & Network Control',icon:Settings,description:'Read-only network control panel for the current client configuration.',metrics:['Chain height','TPS','Wallet']}
};

export function QMoosaModuleView({kind,chainState,blocks,contracts,wallet}:Props){
 const m=meta[kind]; const Icon=m?.icon||Settings;
 const values:any={
  'Chain height':chainState?.height??0,'TPS':chainState?.tps??0,'Wallet':wallet?wallet.address.slice(0,12)+'…':'Not connected',
  'Blocks':blocks.length,'Contracts':contracts.length,'Entropy':chainState?.averageEntropy??0
 };
 return <section className="space-y-6">
  <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/60 p-6 shadow-xl">
   <div className="flex items-center gap-4"><div className="rounded-xl bg-cyan-500/10 p-3"><Icon className="w-7 h-7 text-cyan-300"/></div><div><h2 className="text-2xl font-bold">{m.title}</h2><p className="text-slate-400 mt-1">{m.description}</p></div></div>
   <div className="mt-6 grid gap-4 sm:grid-cols-3">{m.metrics.map((x:string)=><div key={x} className="rounded-xl border border-slate-800 bg-slate-950/70 p-4"><div className="text-xs text-slate-500 uppercase">{x}</div><div className="mt-2 font-mono text-cyan-300 break-all">{String(values[x])}</div></div>)}</div>
  </div>
  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-200">Reality mode: this UI is synchronized with available local API state. Features requiring an independently deployed token, staking contract, DAO, bridge, or public network remain unverified until real backend evidence exists.</div>
 </section>
}
