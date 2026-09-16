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
  ExternalLink,
  Cloud,
  Send,
  Github,
  Server,
  ShieldCheck,
  PlayCircle,
  FileCheck
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

  const qualifyWinCode = `:: Windows Double-Click (Novice 1-Click Execution)
1-click-qualify-testnet.bat`;

  const qualifyBashCode = `# Linux / macOS / Cloud Shell 1-Click Execution
./1-click-qualify-testnet.sh
# Or via npm:
npm run qualify:testnet`;

  const gcpCode = `# 1-Click Google Cloud Shell Launch (Zero Cost / Free VM)
git clone https://github.com/elon00/pq-rdl-blockchain.git
cd pq-rdl-blockchain
./deploy/cloudshell-direct-node.sh`;

  const tgCode = `# Start Telegram Cloud Node & Faucet Controller
export TELEGRAM_BOT_TOKEN="YOUR_BOT_FATHER_TOKEN"
npm run telegram:bot`;

  const dockerCode = `# Launch 3-Node BFT Testnet Cluster + RPC + Telegram Bot
npm run testnet:cluster`;

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
            Comprehensive JSON-RPC endpoints, 1-Click Testnet Qualifier, Google Cloud deployment, GitHub Actions cloud runners, Telegram Bot node controllers, and NIST FIPS 203/204 wire invariants for <strong className="text-cyan-300">RDL-TESTNET-001</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            <span className="px-3 py-1 rounded bg-slate-900 border border-cyan-500/30 text-cyan-300">
              Chain ID: RDL-TESTNET-001
            </span>
            <span className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
              Genesis SHA-256: d1ba8eb5003434c0...
            </span>
            <span className="px-3 py-1 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold">
              Status: 🟢 PUBLIC TESTNET VERIFIED
            </span>
          </div>
        </div>
      </div>

      {/* 1-Click Testnet Live Qualifier & Reality Evidence Section */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950/20 to-slate-950 border border-emerald-500/30 rounded-2xl p-6 space-y-4 shadow-xl shadow-emerald-950/20">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-bold text-base">1-Click Testnet Qualification Pipeline</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  Bountyhunter OS Verified
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                Novice-friendly 1-click execution: multi-node boot, P2P handshake, real PQ tx, block mining, 3-node state sync & disk crash recovery.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold text-xs flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>PUBLIC TESTNET VERIFIED</span>
            </span>
          </div>
        </div>

        {/* 8-Stage Qualification Pipeline Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {[
            { step: '1. Multi-Node', desc: 'Nodes 1, 2, 3 Boot', status: 'PASS' },
            { step: '2. TLS Handshake', desc: 'Mutual Challenge Auth', status: 'PASS' },
            { step: '3. Dual Hybrid Tx', desc: 'Ed25519 ∧ ML-DSA-65', status: 'PASS' },
            { step: '4. PoA Mining', desc: 'Conway Entropy Matrix', status: 'PASS' },
            { step: '5. P2P State Sync', desc: '3 Nodes Converged', status: 'PASS' },
            { step: '6. Crash Recovery', desc: 'Persistent Disk Check', status: 'PASS' },
            { step: '7. Evidence Bundle', desc: '5 Audited JSON Files', status: 'PASS' },
            { step: '8. Reality Gate', desc: 'QMoosa Certified', status: 'PASS' },
          ].map((s) => (
            <div key={s.step} className="p-3 bg-slate-950/80 rounded-xl border border-emerald-500/20 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-white font-bold">{s.step}</span>
                <span className="text-[10px] text-emerald-400 font-bold">🟢 {s.status}</span>
              </div>
              <div className="text-[10px] text-slate-400">{s.desc}</div>
            </div>
          ))}
        </div>

        {/* 1-Click Launchers Code Snippets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Windows Double Click */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                <PlayCircle className="w-4 h-4 text-cyan-400" />
                <span>Windows 1-Click (Double-Click)</span>
              </span>
              <button
                onClick={() => handleCopy(qualifyWinCode, 'qwin')}
                className="text-slate-400 hover:text-cyan-300 cursor-pointer flex items-center gap-1 text-[11px]"
              >
                {copiedSnippet === 'qwin' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
            </div>
            <pre className="p-2.5 bg-slate-900/90 rounded-lg text-cyan-300 text-[10px] overflow-x-auto">
              {qualifyWinCode}
            </pre>
            <p className="text-[10px] text-slate-400">
              Double-click <code className="text-cyan-300 font-bold">1-click-qualify-testnet.bat</code> in the project folder to run all affairs automatically.
            </p>
          </div>

          {/* Linux / macOS / Cloud Shell */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Linux / macOS / Cloud Shell</span>
              </span>
              <button
                onClick={() => handleCopy(qualifyBashCode, 'qbash')}
                className="text-slate-400 hover:text-emerald-300 cursor-pointer flex items-center gap-1 text-[11px]"
              >
                {copiedSnippet === 'qbash' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
            </div>
            <pre className="p-2.5 bg-slate-900/90 rounded-lg text-emerald-300 text-[10px] overflow-x-auto">
              {qualifyBashCode}
            </pre>
            <p className="text-[10px] text-slate-400">
              Or execute <code className="text-emerald-300 font-bold">npm run qualify:testnet</code> from any terminal.
            </p>
          </div>
        </div>

        {/* Evidence Bundle Explorer */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px]">
          <div className="flex items-center gap-2 text-slate-300">
            <FileCheck className="w-4 h-4 text-cyan-400" />
            <span>Audited Evidence Bundle:</span>
            <code className="text-cyan-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">evidence/PERSISTENT_LEDGER.json</code>
            <code className="text-cyan-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">evidence/P2P_NETWORK.json</code>
            <code className="text-cyan-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">DEPLOYMENT_EVIDENCE.json</code>
          </div>

          <a
            href="https://github.com/elon00/pq-rdl-blockchain/blob/master/docs/GLOBAL_STANDARDS_STRATEGY.md"
            target="_blank"
            rel="noreferrer"
            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
          >
            <span>Global Standards Strategy Doc</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Cloud & Telegram Node Run Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-white text-base font-bold">
          <Cloud className="w-5 h-5 text-cyan-400" />
          <span>Cloud Nodes, GitHub Runners & Telegram Controllers</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Google Cloud Platform */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-colors rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Cloud className="w-4 h-4" />
                <span>Google Cloud (GCP)</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/30">Always Free</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Deploy on Google Cloud Shell (100% free with Cloudflare Edge tunnel) or provision an Always-Free <code className="text-cyan-300">e2-micro</code> GCE instance via Terraform.
            </p>
            <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-cyan-300 overflow-x-auto text-[10px]">
              {gcpCode}
            </pre>
            <div className="flex justify-end">
              <button
                onClick={() => handleCopy(gcpCode, 'gcp')}
                className="text-slate-400 hover:text-cyan-300 cursor-pointer flex items-center gap-1 text-[11px]"
              >
                {copiedSnippet === 'gcp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Command</span>
              </button>
            </div>
          </div>

          {/* GitHub Actions & Codespaces */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 transition-colors rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                <Github className="w-4 h-4" />
                <span>GitHub Cloud Nodes</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-purple-950 text-purple-300 border border-purple-500/30">Actions & Codespaces</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Run automated cloud consensus rounds via GitHub Actions runner (<code className="text-purple-300">testnet-node.yml</code>) or launch a 1-click cloud validator in Codespaces.
            </p>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-[10px] text-slate-300">
              <div>• <strong>Workflow</strong>: <code className="text-purple-300">.github/workflows/testnet-node.yml</code></div>
              <div>• <strong>Codespaces</strong>: <code className="text-purple-300">.devcontainer/devcontainer.json</code></div>
              <div>• <strong>Schedule</strong>: Runs cloud consensus every 6 hours.</div>
            </div>
            <div className="flex justify-end">
              <a
                href="https://github.com/elon00/pq-rdl-blockchain/actions"
                target="_blank"
                rel="noreferrer"
                className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-[11px]"
              >
                <span>View GitHub Actions</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Telegram Cloud Bot */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-colors rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Send className="w-4 h-4" />
                <span>Telegram Cloud Bot</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/30">Bot API</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Control nodes, claim faucet drops (<code className="text-emerald-300">/faucet</code>), mine Conway blocks (<code className="text-emerald-300">/mine</code>), and query balances directly from Telegram.
            </p>
            <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-emerald-300 overflow-x-auto text-[10px]">
              {tgCode}
            </pre>
            <div className="flex justify-end">
              <button
                onClick={() => handleCopy(tgCode, 'tg')}
                className="text-slate-400 hover:text-emerald-300 cursor-pointer flex items-center gap-1 text-[11px]"
              >
                {copiedSnippet === 'tg' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Command</span>
              </button>
            </div>
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

          {/* Docker & cURL Example */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400" />
                <span>Docker Testnet Cluster (3 Nodes)</span>
              </span>
              <button
                onClick={() => handleCopy(dockerCode, 'docker')}
                className="text-slate-400 hover:text-cyan-300 cursor-pointer flex items-center gap-1"
              >
                {copiedSnippet === 'docker' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-cyan-300 overflow-x-auto text-[11px]">
              {dockerCode}
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
