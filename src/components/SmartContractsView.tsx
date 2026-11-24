import React, { useState } from 'react';
import {
  Code2,
  Sparkles,
  Bot,
  Play,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Layers,
  ArrowRight,
  ShieldAlert,
  Send
} from 'lucide-react';
import { SmartContract, PQKeypair } from '../types';

interface SmartContractsViewProps {
  contracts: SmartContract[];
  activeWallet: PQKeypair | null;
  onDeployContract: (contract: { name: string; code: string; type: any; conwayTriggerRule: string }) => Promise<void>;
}

export const SmartContractsView: React.FC<SmartContractsViewProps> = ({
  contracts,
  activeWallet,
  onDeployContract,
}) => {
  const [selectedContract, setSelectedContract] = useState<SmartContract | null>(contracts[0] || null);
  const [prompt, setPrompt] = useState<string>(
    'Create an Autonomous Post-Quantum Yield Vault that triggers when Conway cellular entropy exceeds 40 H(x) and verifies a Dilithium2 signature.'
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copilotOutput, setCopilotOutput] = useState<string>('');
  const [generatedCode, setGeneratedCode] = useState<string>(`// Web 4.0 Autonomous Post-Quantum Contract
contract QuantumAutomatonYield {
  state {
    owner: Address,
    minEntropyTrigger: Number,
    poolQBits: Number
  }

  onConwayStep(gridEntropy: Number, senderSig: PQSignature) {
    if (gridEntropy >= this.state.minEntropyTrigger && verifyPqDilithium(senderSig)) {
      let reward = gridEntropy * 1.5;
      transferQBits(msg.sender, reward);
    }
  }
}`);
  const [contractName, setContractName] = useState<string>('Quantum Automaton Yield');
  const [contractType, setContractType] = useState<string>('Yield');
  const [triggerRule, setTriggerRule] = useState<string>('Conway Entropy >= 40.0');
  const [statusMsg, setStatusMsg] = useState<string>('');

  // Call Gemini Copilot Endpoint
  const handleGenerateCopilot = async (action: 'generate' | 'audit') => {
    setIsGenerating(true);
    setStatusMsg(action === 'generate' ? 'Gemini AI generating Post-Quantum Conway Smart Contract...' : 'Auditing Quantum Resilience...');

    try {
      const res = await fetch('/api/gemini/smart-contract-copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          contractCode: generatedCode,
          action,
        }),
      });

      const data = await res.json();

      if (data.rawResponse) {
        setCopilotOutput(data.rawResponse);
        setStatusMsg('Gemini Processing Completed!');
      } else if (data.error) {
        setStatusMsg(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setStatusMsg(`Copilot Error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Deploy handler
  const handleDeploy = async () => {
    if (!generatedCode) return;
    try {
      await onDeployContract({
        name: contractName,
        code: generatedCode,
        type: contractType as any,
        conwayTriggerRule: triggerRule,
      });
      setStatusMsg('Contract Deployed Successfully to Web 4.0 Chain!');
    } catch (err: any) {
      setStatusMsg(`Deploy Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold">
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>Web 4.0 Autonomous Smart Contract Runtime</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-mono text-white">
            Conway Automaton AI Smart Contracts
          </h2>
          <p className="text-slate-400 text-xs">
            Contracts powered by Conway cellular state transitions & Gemini AI Post-Quantum compilation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Deployed Contracts Catalog */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold font-mono text-white text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span>Active Web 4.0 Contracts ({contracts.length})</span>
              </span>
            </h3>

            <div className="space-y-3">
              {contracts.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedContract(c);
                    setGeneratedCode(c.code);
                    setContractName(c.name);
                  }}
                  className={`p-4 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                    selectedContract?.id === c.id
                      ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-950/40'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{c.name}</span>
                    <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 text-[10px] border border-purple-500/30">
                      {c.type}
                    </span>
                  </div>

                  <div className="text-slate-400 text-[11px] mt-2 flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-amber-400" />
                    <span>Trigger: {c.conwayTriggerRule}</span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Creator: {c.creatorAddress.substring(0, 10)}...</span>
                    <span className="text-emerald-400 font-bold">AUTONOMOUS</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Gemini AI Contract Copilot Studio */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                <h3 className="font-bold font-mono text-white text-base">
                  Gemini Post-Quantum Contract Copilot
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-300 text-xs font-mono border border-cyan-500/30">
                gemini-3.6-flash
              </span>
            </div>

            {/* Prompt Input */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300">
                AI Contract Generation Prompt:
              </label>
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleGenerateCopilot('generate')}
                disabled={isGenerating}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold font-mono px-4 py-2 rounded-xl text-xs shadow-md shadow-purple-900/20 disabled:opacity-50 cursor-pointer"
              >
                <Bot className="w-4 h-4" />
                <span>Generate Smart Contract with Gemini</span>
              </button>

              <button
                onClick={() => handleGenerateCopilot('audit')}
                disabled={isGenerating}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono px-4 py-2 rounded-xl text-xs cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Audit Quantum Resilience</span>
              </button>
            </div>

            {statusMsg && (
              <div className="text-xs font-mono text-cyan-300 bg-cyan-950/60 p-2.5 rounded-xl border border-cyan-500/30">
                {statusMsg}
              </div>
            )}

            {/* Contract Code Editor Window */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Contract Code Editor:</span>
                <span className="text-purple-300">Web 4.0 Quantum DSL</span>
              </div>
              <textarea
                rows={10}
                value={generatedCode}
                onChange={(e) => setGeneratedCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-200 focus:outline-none focus:border-cyan-500 scrollbar-thin"
              />
            </div>

            {/* Deployment Config */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Contract Name:</label>
                <input
                  type="text"
                  value={contractName}
                  onChange={(e) => setContractName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Conway Trigger Rule:</label>
                <input
                  type="text"
                  value={triggerRule}
                  onChange={(e) => setTriggerRule(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>
            </div>

            <button
              onClick={handleDeploy}
              className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold font-mono py-2.5 rounded-xl shadow-lg shadow-cyan-900/30 cursor-pointer"
            >
              Deploy Contract to Web 4.0 Blockchain
            </button>

            {/* AI Output Result Analysis Box */}
            {copilotOutput && (
              <div className="bg-slate-950 p-4 rounded-xl border border-purple-500/30 space-y-2">
                <div className="text-xs font-bold text-purple-300 font-mono flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span>Gemini AI Analysis & Audit Report</span>
                </div>
                <div className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto scrollbar-thin p-2 bg-slate-900/60 rounded-lg">
                  {copilotOutput}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
