import React, { useState } from 'react';
import {
  Code2,
  Terminal,
  Cpu,
  Layers,
  Copy,
  Check,
  Zap,
  BookOpen,
  FileCode,
  Globe,
  Lock,
  ExternalLink
} from 'lucide-react';

export const DeveloperView: React.FC = () => {
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const tsCode = `import { mlDsaEngine } from './crypto/pqc/ml-dsa';
import { rdlHybridSigner } from './crypto/rdl/rdl-hybrid-signer';

// 1. Generate NIST FIPS 204 ML-DSA-65 Keypair
const keypair = mlDsaEngine.keygen();
console.log('Public Key (1,952 bytes):', keypair.publicKeyHex);

// 2. Sign Transaction with Dual Hybrid Conjunction (Ed25519 + ML-DSA-65)
const message = new TextEncoder().encode('RDL_TRANSFER_50_COINS');
const hybridSig = rdlHybridSigner.signTransaction(message, edPrivKey, keypair.secretKey);

// 3. Broadcast to RDL Testnet RPC
const response = await fetch('https://elon00.github.io/pq-rdl-blockchain/api/blockchain/transaction', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ sender: keypair.commitmentHash, signature: hybridSig }),
});`;

  const curlCode = `# Claim Free Testnet Coins (50 RDL + 1,000 rUSD + 10M RLD)
curl -X POST http://localhost:3000/api/faucet/dispense \\
  -H "Content-Type: application/json" \\
  -d '{"recipientAddress":"pq1dil2testnet0000000000000000000000000000","dropType":"ALL"}'

# Query Chain Status & Genesis Hash
curl http://localhost:3000/api/blockchain/status`;

  const rustCode = `# Run Native RDL HotStuff BFT Node locally
cargo run --bin rdl-node -- \\
  --listen 0.0.0.0:7000 \\
  --bootstrap-peers 127.0.0.1:7001,127.0.0.1:7002`;

  return (
    <div className="space-y-8 font-mono text-xs">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 border border-cyan-500/30 p-6 sm:p-8 shadow-2xl shadow-cyan-950/40">
        <div className="relative z-10 space-y-3 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>RDL Developer Platform & JSON-RPC Gateway</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-mono leading-tight">
            Developer Documentation & APIs <br />
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-400 bg-clip-text text-transparent">
              Build on Web 4.0 Post-Quantum Conway Blockchain
            </span>
          </h2>

          <p className="text-slate-300 text-sm leading-relaxed font-sans">
            Comprehensive JSON-RPC endpoints, Rust consensus node specifications, NIST FIPS 203/204 wire invariants, and SDK integration guides for <strong className="text-cyan-300">RDL-TESTNET-001</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            <span className="px-3 py-1 rounded bg-slate-900 border border-cyan-500/30 text-cyan-300">
              Chain ID: RDL-TESTNET-001
            </span>
            <span className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
              Genesis SHA-256: d1ba8eb5003434c0...
            </span>
          </div>
        </div>
      </div>

      {/* Grid: RPC Endpoints & Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RPC Endpoints */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-white text-sm">JSON-RPC / REST Endpoints</h3>
            </div>
            <span className="text-[10px] text-cyan-400 font-bold">API v1</span>
          </div>

          <div className="space-y-2.5">
            {[
              { method: 'GET', path: '/api/blockchain/status', desc: 'Returns block height, latest hash, quantum difficulty, and entropy.' },
              { method: 'GET', path: '/api/blockchain/blocks', desc: 'Returns full block history with Conway automaton mining proofs.' },
              { method: 'POST', path: '/api/blockchain/transaction', desc: 'Submit post-quantum signed transaction to mempool.' },
              { method: 'POST', path: '/api/blockchain/mine', desc: 'Mine next block solving Conway entropy matrix generation.' },
              { method: 'GET', path: '/api/tokens', desc: 'List all RDL-20 tokens (rUSD, RLD, and custom tokens).' },
              { method: 'POST', path: '/api/tokens/create', desc: 'Deploy new Stablecoin or Meme Coin with optional unlimited supply.' },
              { method: 'POST', path: '/api/faucet/dispense', desc: 'Dispense free testnet coins (RDL, rUSD, RLD) with cooldown.' },
              { method: 'GET', path: '/api/faucet/status', desc: 'Query faucet reserves and recent dispensation telemetry.' },
            ].map((ep) => (
              <div key={ep.path} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    ep.method === 'GET' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {ep.method}
                  </span>
                  <span className="text-white font-bold">{ep.path}</span>
                </div>
                <div className="text-[11px] text-slate-400">{ep.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Post-Quantum Invariants & Rust Consensus */}
        <div className="space-y-6">
          {/* Wire Specs */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-3">
              <Lock className="w-4 h-4 text-purple-400" />
              <span>NIST FIPS 203/204 Wire Invariants</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div className="bg-slate-950 p-3 rounded-xl border border-purple-500/20 space-y-1">
                <div className="text-purple-300 font-bold">ML-DSA-65 (FIPS 204)</div>
                <div className="text-slate-400">Public Key: <strong className="text-white">1,952 bytes</strong></div>
                <div className="text-slate-400">Secret Key: <strong className="text-white">4,032 bytes</strong></div>
                <div className="text-slate-400">Signature: <strong className="text-white">3,309 bytes</strong></div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-cyan-500/20 space-y-1">
                <div className="text-cyan-300 font-bold">ML-KEM-768 (FIPS 203)</div>
                <div className="text-slate-400">Public Key: <strong className="text-white">1,184 bytes</strong></div>
                <div className="text-slate-400">Secret Key: <strong className="text-white">2,400 bytes</strong></div>
                <div className="text-slate-400">Ciphertext: <strong className="text-white">1,088 bytes</strong></div>
              </div>
            </div>
          </div>

          {/* cURL Example */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">cURL Faucet & RPC Example</span>
              <button
                onClick={() => handleCopy(curlCode, 'curl')}
                className="text-slate-400 hover:text-cyan-300 cursor-pointer flex items-center gap-1"
              >
                {copiedSnippet === 'curl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-cyan-300 overflow-x-auto text-[11px]">
              {curlCode}
            </pre>
          </div>
        </div>
      </div>

      {/* Code Integration Snippet */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">TypeScript SDK Integration</h3>
          </div>
          <button
            onClick={() => handleCopy(tsCode, 'ts')}
            className="text-slate-400 hover:text-cyan-300 cursor-pointer flex items-center gap-1"
          >
            {copiedSnippet === 'ts' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Snippet</span>
          </button>
        </div>
        <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 overflow-x-auto text-[11px] leading-relaxed">
          {tsCode}
        </pre>
      </div>
    </div>
  );
};
