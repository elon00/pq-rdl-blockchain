import React, { useState } from 'react';
import {
  Share2,
  Globe2,
  Activity,
  Plus,
  Radio,
  CheckCircle2,
  Zap,
  Server
} from 'lucide-react';
import { NetworkNode, PQAlgorithm } from '../types';

export const PeerMeshView: React.FC = () => {
  const [nodes, setNodes] = useState<NetworkNode[]>([
    {
      id: 'node_tokyo_01',
      name: 'Tokyo Quantum Lattice Node',
      address: 'pq1q_tokyo_node_883',
      region: 'Asia-Pacific (Tokyo)',
      status: 'active',
      algorithm: 'Dilithium2',
      latencyMs: 18,
      blocksValidated: 412,
      isMiner: true,
    },
    {
      id: 'node_frankfurt_02',
      name: 'Frankfurt SPHINCS Validator',
      address: 'pq1q_frankfurt_sph_119',
      region: 'Europe (Frankfurt)',
      status: 'active',
      algorithm: 'SPHINCS+',
      latencyMs: 34,
      blocksValidated: 389,
      isMiner: true,
    },
    {
      id: 'node_sf_03',
      name: 'San Francisco Falcon Node',
      address: 'pq1q_sf_falcon_992',
      region: 'North America (US-West)',
      status: 'active',
      algorithm: 'Falcon-512',
      latencyMs: 12,
      blocksValidated: 520,
      isMiner: true,
    },
    {
      id: 'node_singapore_04',
      name: 'Singapore Conway Automaton Hub',
      address: 'pq1q_singapore_conway_302',
      region: 'Asia-Pacific (Singapore)',
      status: 'validating',
      algorithm: 'Dilithium2',
      latencyMs: 22,
      blocksValidated: 290,
      isMiner: false,
    },
  ]);

  const [broadcastMsg, setBroadcastMsg] = useState<string>('');
  const [newNodeName, setNewNodeName] = useState<string>('');
  const [newNodeRegion, setNewNodeRegion] = useState<string>('Europe (London)');
  const [newNodeAlgo, setNewNodeAlgo] = useState<PQAlgorithm>('Dilithium2');

  const handleBroadcast = () => {
    setBroadcastMsg('Broadcasting Post-Quantum Transaction across Web 4.0 Mesh Network...');
    setTimeout(() => {
      setBroadcastMsg('Transaction propagated to 100% of Web 4.0 Peer Nodes in 184ms!');
    }, 1200);
  };

  const handleAddNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeName) return;

    const newNode: NetworkNode = {
      id: `node_${Date.now()}`,
      name: newNodeName,
      address: `pq1q_peer_${Math.random().toString(16).substring(2, 10)}`,
      region: newNodeRegion,
      status: 'active',
      algorithm: newNodeAlgo,
      latencyMs: Math.floor(Math.random() * 30) + 10,
      blocksValidated: 0,
      isMiner: true,
    };

    setNodes([...nodes, newNode]);
    setNewNodeName('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold">
            <Share2 className="w-4 h-4 text-cyan-400" />
            <span>Autonomous Web 4.0 Peer Topology</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-mono text-white">
            Peer-to-Peer Quantum Mesh Simulator
          </h2>
          <p className="text-slate-400 text-xs">
            Decentralized node mesh communicating via zero-knowledge post-quantum protocols.
          </p>
        </div>

        <button
          onClick={handleBroadcast}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold font-mono px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-cyan-900/30 cursor-pointer transition-all"
        >
          <Radio className="w-4 h-4 text-slate-950" />
          <span>Broadcast Quantum Payload to Mesh</span>
        </button>
      </div>

      {broadcastMsg && (
        <div className="bg-cyan-950/80 border border-cyan-500/40 p-3 rounded-xl flex items-center gap-2 text-xs font-mono text-cyan-300">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{broadcastMsg}</span>
        </div>
      )}

      {/* Mesh Network Visual Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {nodes.map((node) => (
          <div
            key={node.id}
            className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-4 space-y-3 font-mono text-xs transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 text-[10px] border border-purple-500/30">
                {node.algorithm}
              </span>
            </div>

            <div>
              <div className="font-bold text-white text-sm truncate">{node.name}</div>
              <div className="text-slate-400 text-[11px] flex items-center gap-1 mt-1">
                <Globe2 className="w-3 h-3 text-cyan-400" />
                <span>{node.region}</span>
              </div>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-[11px] space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span>Latency:</span>
                <span className="text-cyan-300 font-bold">{node.latencyMs} ms</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Validated:</span>
                <span className="text-emerald-400 font-bold">{node.blocksValidated} Blocks</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Role:</span>
                <span className="text-amber-300">{node.isMiner ? 'Miner & Validator' : 'Full Node'}</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 truncate">
              Addr: <span className="text-slate-300">{node.address}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Web 4.0 Peer Node Drawer */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="font-bold font-mono text-white text-sm flex items-center gap-2">
          <Plus className="w-4 h-4 text-cyan-400" />
          <span>Add Custom Web 4.0 Node to Network</span>
        </h3>

        <form onSubmit={handleAddNode} className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Node Identifier Name:</label>
            <input
              type="text"
              required
              value={newNodeName}
              onChange={(e) => setNewNodeName(e.target.value)}
              placeholder="London Quantum Hub"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Region Location:</label>
            <input
              type="text"
              value={newNodeRegion}
              onChange={(e) => setNewNodeRegion(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">PQ Crypto Scheme:</label>
            <select
              value={newNodeAlgo}
              onChange={(e) => setNewNodeAlgo(e.target.value as PQAlgorithm)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="Dilithium2">Dilithium2 (Lattice)</option>
              <option value="Falcon-512">Falcon-512 (NTRU)</option>
              <option value="SPHINCS+">SPHINCS+ (Hash Tree)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-2 rounded-xl cursor-pointer"
            >
              Connect Node to Mesh
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
