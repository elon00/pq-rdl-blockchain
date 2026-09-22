import React, { useState } from 'react';
import {
  Coins,
  Bot,
  Sparkles,
  ShieldCheck,
  Send,
  Zap,
  Flame,
  DollarSign,
  PlusCircle,
  RefreshCw,
} from 'lucide-react';
import { Token, TokenType, PQKeypair, ChatMessage } from '../types';
import { tokenEngine } from '../lib/tokenEngine';

interface TokenLaunchpadViewProps {
  activeWallet: PQKeypair | null;
  onOpenWallet: () => void;
  onTokenDeployed?: (token: Token) => void;
}

export const TokenLaunchpadView: React.FC<TokenLaunchpadViewProps> = ({
  activeWallet,
  onOpenWallet,
  onTokenDeployed,
}) => {
  const [tokens, setTokens] = useState<Token[]>(tokenEngine.getTokens());
  const [selectedTokenType, setSelectedTokenType] = useState<TokenType>('STABLECOIN');
  const [tokenName, setTokenName] = useState<string>('Quantum Euro Stablecoin');
  const [tokenSymbol, setTokenSymbol] = useState<string>('EURQ');
  const [initialSupply, setInitialSupply] = useState<number>(1000000);
  const [isUnlimitedSupply, setIsUnlimitedSupply] = useState<boolean>(true);
  const [decimals, setDecimals] = useState<number>(6);
  const [pegCurrency, setPegCurrency] = useState<string>('EUR');
  const [oraclePrice, setOraclePrice] = useState<number>(1.00);
  const [burnRate, setBurnRate] = useState<number>(1.5);
  const [memeLore, setMemeLore] = useState<string>('Deflationary quantum automaton meme coin powered by Conway living lattices.');
  
  // Simulate Transfer / Mint / Faucet states
  const [selectedTokenForTransfer, setSelectedTokenForTransfer] = useState<Token | null>(null);
  const [transferRecipient, setTransferRecipient] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<number>(100);
  const [mintAmount, setMintAmount] = useState<number>(50000);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // AI Agentics Multi-Model Chatbot State
  const [selectedAiModel, setSelectedAiModel] = useState<'Gemini 2.5 Flash' | 'Claude 3.7 Sonnet' | 'QMoosa Autonomous Agent'>('Gemini 2.5 Flash');
  const [chatInput, setChatInput] = useState<string>('');
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'msg-0',
      sender: 'agent',
      modelName: 'Gemini 2.5 Flash',
      text: 'Greetings! I am the QMoosa Multi-Model AI Token & Autonomous Smart Contract Copilot. You can ask me to architect post-quantum stablecoins, unlimited-supply meme coins, or simulate Conway automaton bonding curves.',
      timestamp: Date.now() - 60000,
    },
  ]);

  const refreshTokens = () => {
    setTokens([...tokenEngine.getTokens()]);
  };

  // Deploy New Token
  const handleDeployToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenName || !tokenSymbol) {
      setStatusMessage({ type: 'error', text: 'Token name and symbol are required.' });
      return;
    }

    const creator = activeWallet ? activeWallet.address : 'pq1dil2genesis00000000000000000000000000000';
    
    const newToken = tokenEngine.createToken({
      name: tokenName,
      symbol: tokenSymbol,
      decimals,
      totalSupply: initialSupply,
      isUnlimitedSupply,
      type: selectedTokenType,
      creatorAddress: creator,
      pegCurrency: selectedTokenType === 'STABLECOIN' ? pegCurrency : undefined,
      oraclePriceUsd: selectedTokenType === 'STABLECOIN' ? oraclePrice : undefined,
      burnRatePercentage: selectedTokenType === 'MEMECOIN' ? burnRate : undefined,
      memeLore: selectedTokenType === 'MEMECOIN' ? memeLore : undefined,
      collateralVault: selectedTokenType === 'STABLECOIN' ? `0xvault_${creator.slice(0, 16)}` : undefined,
      conwayPatternSeed: `Automaton-Seed-${tokenSymbol}-B3/S23`,
    });

    refreshTokens();
    if (onTokenDeployed) onTokenDeployed(newToken);
    setStatusMessage({
      type: 'success',
      text: `🧪 Token ${newToken.symbol} (${newToken.name}) created in the local demo registry. Demo identifier: ${newToken.contractAddress}`,
    });
  };

  // Transfer Token
  const handleTransfer = (token: Token) => {
    if (!transferRecipient || transferAmount <= 0) {
      setStatusMessage({ type: 'error', text: 'Specify a valid recipient and amount.' });
      return;
    }
    const sender = activeWallet ? activeWallet.address : 'pq1dil2genesis00000000000000000000000000000';
    const result = tokenEngine.transferToken(token.id, sender, transferRecipient, transferAmount);

    if (result.success) {
      refreshTokens();
      const burnNote = result.burnedAmount ? ` (${result.burnedAmount} ${token.symbol} burned via Conway deflation)` : '';
      setStatusMessage({
        type: 'success',
        text: `✅ Local accounting simulation transferred ${result.transferredAmount} ${token.symbol} to ${transferRecipient.slice(0, 14)}...${burnNote}`,
      });
      setSelectedTokenForTransfer(null);
    } else {
      setStatusMessage({ type: 'error', text: result.error || 'Transfer failed.' });
    }
  };

  // Demo Faucet
  const handleClaimFaucet = (token: Token) => {
    const recipient = activeWallet ? activeWallet.address : 'pq1dil2genesis00000000000000000000000000000';
    const amountToClaim = token.type === 'STABLECOIN' ? 1000 : 10000000;
    const result = tokenEngine.claimFaucet(token.id, recipient, amountToClaim);

    if (result.success) {
      refreshTokens();
      setStatusMessage({
        type: 'success',
        text: `🎉 Local demo faucet updated ${result.amountClaimed.toLocaleString()} ${token.symbol} for ${recipient.slice(0, 14)}...`,
      });
    } else {
      setStatusMessage({ type: 'error', text: result.error || 'Faucet claim failed.' });
    }
  };

  // Mint Additional Tokens
  const handleMint = (token: Token) => {
    const recipient = activeWallet ? activeWallet.address : 'pq1dil2genesis00000000000000000000000000000';
    const result = tokenEngine.mintToken(token.id, recipient, mintAmount);

    if (result.success) {
      refreshTokens();
      setStatusMessage({
        type: 'success',
        text: `🧪 Local demo mint updated ${token.symbol}; demo total supply: ${result.newTotalSupply?.toLocaleString()}`,
      });
    } else {
      setStatusMessage({ type: 'error', text: result.error || 'Minting failed.' });
    }
  };

  // Send AI Chat Message
  const handleSendAiMessage = () => {
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      modelName: selectedAiModel,
      text: chatInput,
      timestamp: Date.now(),
    };

    setChatHistory((prev) => [...prev, userMsg]);
    const prompt = chatInput;
    setChatInput('');
    setIsAiThinking(true);

    setTimeout(() => {
      let replyText = '';
      if (/stable|usdt|usdc|peg|dollar|euro|gold/i.test(prompt)) {
        replyText = `[${selectedAiModel}] For a prototype stablecoin design exercise:
• Demo Architecture: configurable in-memory treasury/accounting fields; no external reserves are proven.
• Demo Peg Parameter: configurable $1.00 reference value; no production oracle is connected.
• Demo Minting: local state can model dynamic supply; no collateral-deposit verification is implemented.`;
        setSelectedTokenType('STABLECOIN');
        setTokenName('Quantum Global USD');
        setTokenSymbol('QUSD');
        setInitialSupply(2500000);
        setIsUnlimitedSupply(true);
        setPegCurrency('USD');
      } else if (/meme|doge|pepe|shib|moon|viral|burn/i.test(prompt)) {
        replyText = `[${selectedAiModel}] For a Web 4.0 Conway Cellular Automaton Meme Coin:
• Viral Deflation: 2.5% burn rate on every peer transfer.
• Living Tokenomics: Supply contractions tied to Conway B3/S23 pulsar & glider generation.
• PQC Note: ML-DSA is designed for post-quantum security assumptions; this demo is not an independent security proof.`;
        setSelectedTokenType('MEMECOIN');
        setTokenName('Super Quantum Glider');
        setTokenSymbol('GLIDER');
        setInitialSupply(100000000000);
        setIsUnlimitedSupply(false);
        setBurnRate(2.5);
      } else {
        replyText = `[${selectedAiModel}] Analyzed request for "${prompt}". The RDL-20 Token Standard implements post-quantum lattice invariants with optional Conway cellular automaton evolution. You can configure this token in the local demo registry below.`;
      }

      setChatHistory((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'agent',
          modelName: selectedAiModel,
          text: replyText,
          timestamp: Date.now(),
        },
      ]);
      setIsAiThinking(false);
    }, 600);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border border-cyan-500/30 p-6 sm:p-8 shadow-2xl shadow-cyan-950/40">
        <div className="relative z-10 space-y-3 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono">
            <Coins className="w-4 h-4 text-cyan-400" />
            <span>Token Design & Accounting Simulation Lab</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-mono leading-tight">
            Prototype Token Lab <br />
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-amber-400 bg-clip-text text-transparent">
              Stablecoins, Unlimited-Supply Meme Coins & Conway Automaton AI
            </span>
          </h2>

          <p className="text-slate-300 text-sm leading-relaxed">
            Create in-memory token/accounting fixtures for UI and invariant testing.
            Stablecoin peg, reserve, mint, burn, and Conway parameters on this screen are simulation fields and do not prove backing, deployment, or market value.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono">
            <span className="px-3 py-1 rounded bg-slate-900 border border-cyan-500/30 text-cyan-300">
              Active Wallet: {activeWallet ? `${activeWallet.address.slice(0, 14)}...` : 'Genesis Demonstrator'}
            </span>
            <button
              onClick={onOpenWallet}
              className="px-3 py-1 rounded bg-purple-900/60 hover:bg-purple-800 border border-purple-500/40 text-purple-200 cursor-pointer transition-all"
            >
              {activeWallet ? 'Manage Keypair' : 'Connect / Generate PQ Wallet'}
            </button>
          </div>
        </div>
      </div>

      {/* Status Alert Notification */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border flex items-start justify-between gap-3 text-xs font-mono ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
              : statusMessage.type === 'error'
              ? 'bg-red-950/80 border-red-500/40 text-red-300'
              : 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300'
          }`}
        >
          <span>{statusMessage.text}</span>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Grid: Left Column (AI Multi-Model Copilot) | Right Column (Deploy Token Form) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: AI Agentics Multi-Model Chatbot */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col h-[560px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-white font-mono text-sm">
                AI Agentics Token Copilot
              </h3>
            </div>
            {/* Model Selector */}
            <select
              value={selectedAiModel}
              onChange={(e) => setSelectedAiModel(e.target.value as any)}
              className="bg-slate-950 border border-cyan-500/30 text-cyan-300 rounded-lg text-xs font-mono px-2 py-1 outline-none"
            >
              <option value="Gemini 2.5 Flash">Gemini 2.5 Flash</option>
              <option value="Claude 3.7 Sonnet">Claude 3.7 Sonnet</option>
              <option value="QMoosa Autonomous Agent">QMoosa Agent</option>
            </select>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 font-mono text-xs scrollbar-thin">
            {chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-xl border leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-100 ml-6'
                    : 'bg-slate-950/80 border-slate-800 text-slate-300 mr-6'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                  <span className="font-bold text-cyan-400">{msg.sender === 'user' ? 'You' : msg.modelName}</span>
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="whitespace-pre-wrap">{msg.text}</div>
              </div>
            ))}
            {isAiThinking && (
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-cyan-300 text-xs font-mono animate-pulse">
                Thinking & generating post-quantum token specifications...
              </div>
            )}
          </div>

          {/* Quick Prompt Pill Buttons */}
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/80 text-[10px] font-mono">
            <button
              onClick={() => {
                setChatInput('Generate a 100% reserve-backed Post-Quantum USD Stablecoin');
              }}
              className="px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 cursor-pointer"
            >
              + USD Stablecoin
            </button>
            <button
              onClick={() => {
                setChatInput('Create an unlimited-supply meme coin with Conway cellular burn tax');
              }}
              className="px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 cursor-pointer"
            >
              + Meme Coin (Burn Tax)
            </button>
          </div>

          {/* Chat Input Box */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendAiMessage()}
              placeholder={`Ask ${selectedAiModel.split(' ')[0]} to design your token...`}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none"
            />
            <button
              onClick={handleSendAiMessage}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 p-2 rounded-xl cursor-pointer transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column: Deploy Token Form */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-white font-mono text-sm">
                Deploy New RDL-20 Token to Testnet
              </h3>
            </div>
            {/* Token Type Toggle */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 font-mono text-xs">
              <button
                type="button"
                onClick={() => setSelectedTokenType('STABLECOIN')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedTokenType === 'STABLECOIN'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Stablecoin</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedTokenType('MEMECOIN')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedTokenType === 'MEMECOIN'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Meme Coin</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleDeployToken} className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1">Token Name</label>
                <input
                  type="text"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  placeholder="e.g. Quantum USD Stablecoin"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Symbol / Ticker</label>
                <input
                  type="text"
                  value={tokenSymbol}
                  onChange={(e) => setTokenSymbol(e.target.value)}
                  placeholder="e.g. USDR or QPEPE"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-400 mb-1">Initial Supply</label>
                <input
                  type="number"
                  value={initialSupply}
                  onChange={(e) => setInitialSupply(Number(e.target.value))}
                  min="1"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Decimals</label>
                <input
                  type="number"
                  value={decimals}
                  onChange={(e) => setDecimals(Number(e.target.value))}
                  min="0"
                  max="18"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div className="flex flex-col justify-center">
                <label className="text-slate-400 mb-1">Supply Mode</label>
                <label className="flex items-center gap-2 text-white cursor-pointer bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <input
                    type="checkbox"
                    checked={isUnlimitedSupply}
                    onChange={(e) => setIsUnlimitedSupply(e.target.checked)}
                    className="accent-cyan-500 rounded"
                  />
                  <span>Unlimited / Mintable</span>
                </label>
              </div>
            </div>

            {/* Stablecoin Specific Config */}
            {selectedTokenType === 'STABLECOIN' && (
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-3">
                <div className="text-emerald-300 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Stablecoin Peg & Reserve Parameters</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Peg Asset</label>
                    <select
                      value={pegCurrency}
                      onChange={(e) => setPegCurrency(e.target.value)}
                      className="w-full bg-slate-950 border border-emerald-500/30 rounded-lg p-2 text-white"
                    >
                      <option value="USD">USD ($1.00 USD)</option>
                      <option value="EUR">EUR (€1.00 EUR)</option>
                      <option value="GOLD">GOLD (1g Fine Gold)</option>
                      <option value="SOL">SOL (Solana Equivalent)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Oracle Target Price (USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={oraclePrice}
                      onChange={(e) => setOraclePrice(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-emerald-500/30 rounded-lg p-2 text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Meme Coin Specific Config */}
            {selectedTokenType === 'MEMECOIN' && (
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-3">
                <div className="text-amber-300 font-bold flex items-center gap-1.5">
                  <Flame className="w-4 h-4" />
                  <span>Meme Coin Deflation & Automaton Mechanics</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Conway Burn Tax (% per tx)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={burnRate}
                      onChange={(e) => setBurnRate(Number(e.target.value))}
                      min="0"
                      max="20"
                      className="w-full bg-slate-950 border border-amber-500/30 rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Meme Lore / Narrative</label>
                    <input
                      type="text"
                      value={memeLore}
                      onChange={(e) => setMemeLore(e.target.value)}
                      className="w-full bg-slate-950 border border-amber-500/30 rounded-lg p-2 text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:opacity-90 font-bold text-slate-950 cursor-pointer shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Create Token in Local Demo Registry</span>
            </button>
          </form>
        </div>
      </div>

      {/* Active Tokens on Testnet Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white font-mono text-base">
                Local Demo Token Fixtures ({tokens.length})
              </h3>
            </div>
            <p className="text-slate-400 font-mono text-xs">
              In-memory token fixtures for deterministic accounting tests. They are not deployed public-network assets.
            </p>
          </div>
          <button
            onClick={refreshTokens}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh State</span>
          </button>
        </div>

        {/* Token Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tokens.map((token) => (
            <div
              key={token.id}
              className="bg-slate-950/80 border border-slate-800/80 hover:border-cyan-500/40 rounded-xl p-4 space-y-3 transition-colors font-mono text-xs flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold text-white text-sm flex items-center gap-1.5">
                      <span>{token.name}</span>
                      <span className="text-cyan-400">({token.symbol})</span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                      {token.contractAddress}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      token.type === 'STABLECOIN'
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-950 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {token.type}
                  </span>
                </div>

                {/* Token Stats */}
                <div className="bg-slate-900/60 rounded-lg p-2.5 space-y-1.5 text-[11px]">
                  <div className="flex justify-between text-slate-400">
                    <span>Total Supply:</span>
                    <span className="text-white font-bold">
                      {token.totalSupply.toLocaleString()} {token.isUnlimitedSupply && '(Unlimited)'}
                    </span>
                  </div>

                  {token.type === 'STABLECOIN' && (
                    <>
                      <div className="flex justify-between text-slate-400">
                        <span>Demo Peg Parameter:</span>
                        <span className="text-emerald-400 font-bold">{token.pegCurrency} (${token.oraclePriceUsd?.toFixed(2)})</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Configured Demo Reserve Ratio:</span>
                        <span className="text-emerald-300 font-bold">{token.reserveRatio ?? 100}%</span>
                      </div>
                    </>
                  )}

                  {token.type === 'MEMECOIN' && (
                    <>
                      <div className="flex justify-between text-slate-400">
                        <span>Burn Tax:</span>
                        <span className="text-amber-400 font-bold">{token.burnRatePercentage ?? 1}% Deflationary</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Conway Yield:</span>
                        <span className="text-purple-300 font-bold">+{token.automatonEvolutionYield ?? 1.5}% H(x)</span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800/80">
                    <span>Your Balance:</span>
                    <span className="text-cyan-300 font-bold">
                      {(token.balances[activeWallet ? activeWallet.address : 'pq1dil2genesis00000000000000000000000000000'] || 0).toLocaleString()} {token.symbol}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-900">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleClaimFaucet(token)}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/30 text-emerald-300 font-bold cursor-pointer text-center"
                  >
                    Claim Faucet
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTokenForTransfer(token);
                      setTransferAmount(100);
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/30 text-cyan-300 font-bold cursor-pointer text-center"
                  >
                    Transfer
                  </button>
                </div>

                {token.isUnlimitedSupply && (
                  <button
                    onClick={() => handleMint(token)}
                    className="w-full py-1 rounded bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/30 text-purple-300 text-[10px] cursor-pointer"
                  >
                    + Simulate Mint 50,000
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Transfer Modal */}
      {selectedTokenForTransfer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-md w-full p-6 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="font-bold text-white text-sm flex items-center gap-2">
                <Send className="w-4 h-4 text-cyan-400" />
                <span>Transfer {selectedTokenForTransfer.name} ({selectedTokenForTransfer.symbol})</span>
              </div>
              <button
                onClick={() => setSelectedTokenForTransfer(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Recipient Post-Quantum Address</label>
                <input
                  type="text"
                  value={transferRecipient}
                  onChange={(e) => setTransferRecipient(e.target.value)}
                  placeholder="pq1dil2... or pq1flc..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Amount</label>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(Number(e.target.value))}
                  min="1"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {selectedTokenForTransfer.type === 'MEMECOIN' && selectedTokenForTransfer.burnRatePercentage && (
                <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 text-[11px]">
                  🔥 Conway Burn Tax: {selectedTokenForTransfer.burnRatePercentage}% (
                  {(transferAmount * selectedTokenForTransfer.burnRatePercentage) / 100} {selectedTokenForTransfer.symbol} will be destroyed forever)
                </div>
              )}

              <button
                onClick={() => handleTransfer(selectedTokenForTransfer)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold cursor-pointer"
              >
                Apply Local Accounting Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
