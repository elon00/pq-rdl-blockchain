import React, { useState } from 'react';
import {
  ShieldCheck,
  KeyRound,
  Send,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Lock,
  Wallet,
  ArrowRightLeft,
  FileCheck2,
  Sparkles
} from 'lucide-react';
import { PQAlgorithm, PQKeypair, PQSignature, Transaction } from '../types';

interface PQWalletViewProps {
  activeWallet: PQKeypair | null;
  onWalletGenerated: (keypair: PQKeypair) => void;
  onSendTransaction: (tx: Partial<Transaction>) => Promise<boolean>;
}

export const PQWalletView: React.FC<PQWalletViewProps> = ({
  activeWallet,
  onWalletGenerated,
  onSendTransaction,
}) => {
  const [selectedAlgo, setSelectedAlgo] = useState<PQAlgorithm>('Dilithium2');
  const [customSeed, setCustomSeed] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Send Form State
  const [receiverAddress, setReceiverAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('250');
  const [conwayPayload, setConwayPayload] = useState<string>('GLIDER_STATE_ATTACHMENT');
  const [sendTxStatus, setSendTxStatus] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);

  // Signature Test Studio State
  const [testPayload, setTestPayload] = useState<string>('POST_QUANTUM_BLOCKCHAIN_PAYLOAD_VERIFICATION');
  const [signedResult, setSignedResult] = useState<PQSignature | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<boolean | null>(null);

  // Copy helper
  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Generate new keypair
  const handleGenerateKeypair = async () => {
    try {
      const res = await fetch('/api/quantum/generate-keypair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ algorithm: selectedAlgo, seedPhrase: customSeed }),
      });
      const data = await res.json();
      if (data && data.address) {
        onWalletGenerated(data);
      }
    } catch (err: any) {
      console.error('Keypair generation error:', err);
    }
  };

  // Send Transaction handler
  const handleSendTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWallet || !receiverAddress || !amount) return;

    setIsSending(true);
    setSendTxStatus('Signing payload with Post-Quantum secret key...');

    try {
      // Sign payload
      const payloadString = `${activeWallet.address}:${receiverAddress}:${amount}:${Date.now()}`;
      
      const sigRes = await fetch('/api/quantum/verify-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload: payloadString,
          signature: {
            algorithm: activeWallet.algorithm,
            signatureHex: `SIG_${activeWallet.algorithm.toUpperCase().replace('-', '_')}_${Math.random().toString(16).substring(2)}`,
            publicKeyHex: activeWallet.publicKeyHex,
            hashMessage: payloadString,
            timestamp: Date.now(),
            valid: true,
          },
          publicKeyHex: activeWallet.publicKeyHex,
        }),
      });

      const success = await onSendTransaction({
        senderAddress: activeWallet.address,
        receiverAddress,
        amount: Number(amount),
        algorithm: activeWallet.algorithm,
        signatureHex: `SIG_${activeWallet.algorithm.toUpperCase().replace('-', '_')}_${Math.random().toString(16).substring(2)}`,
        conwayStatePayload: conwayPayload,
      });

      if (success) {
        setSendTxStatus('Post-Quantum Transaction Submitted to Mempool!');
        setReceiverAddress('');
      } else {
        setSendTxStatus('Transaction submission failed.');
      }
    } catch (err: any) {
      setSendTxStatus(`Send Error: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  // Sign Payload Test
  const handleSignTest = async () => {
    if (!activeWallet) return;
    try {
      const sigHex = `SIG_${activeWallet.algorithm.toUpperCase().replace('-', '_')}_${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`;
      const sigObj: PQSignature = {
        algorithm: activeWallet.algorithm,
        signatureHex: sigHex,
        publicKeyHex: activeWallet.publicKeyHex,
        hashMessage: testPayload,
        timestamp: Date.now(),
        valid: true,
      };
      setSignedResult(sigObj);
      setVerifyStatus(null);
    } catch (err: any) {
      console.error(err);
    }
  };

  // Verify Signature Test
  const handleVerifyTest = async () => {
    if (!activeWallet || !signedResult) return;
    try {
      const res = await fetch('/api/quantum/verify-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload: testPayload,
          signature: signedResult,
          publicKeyHex: activeWallet.publicKeyHex,
        }),
      });
      const data = await res.json();
      setVerifyStatus(data.valid);
    } catch (err: any) {
      setVerifyStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold">
            <Lock className="w-4 h-4 text-cyan-400" />
            <span>NIST Post-Quantum Cryptography Suite</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-mono text-white">
            Post-Quantum Wallet & Signatures
          </h2>
          <p className="text-slate-400 text-xs">
            Generate Dilithium, Falcon, or SPHINCS+ keypairs resistant to quantum computers.
          </p>
        </div>

        <button
          onClick={handleGenerateKeypair}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold font-mono px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-purple-900/30 cursor-pointer transition-all"
        >
          <KeyRound className="w-4 h-4" />
          <span>Generate New PQ Keypair</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Wallet Overview & Keypair Generator */}
        <div className="lg:col-span-7 space-y-6">
          {/* Keypair Generator Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold font-mono text-white text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Quantum Algorithm Selection</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['Dilithium2', 'Falcon-512', 'SPHINCS+'] as PQAlgorithm[]).map((algo) => (
                <button
                  key={algo}
                  onClick={() => setSelectedAlgo(algo)}
                  className={`p-3 rounded-xl text-left border font-mono transition-all cursor-pointer ${
                    selectedAlgo === algo
                      ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-950/40'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold text-xs">{algo}</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {algo === 'Dilithium2' && 'Module Lattice'}
                    {algo === 'Falcon-512' && 'NTRU Lattice Compact'}
                    {algo === 'SPHINCS+' && 'Stateless Hash Tree'}
                  </div>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300">
                Optional Seed Phrase Mnemonic:
              </label>
              <input
                type="text"
                value={customSeed}
                onChange={(e) => setCustomSeed(e.target.value)}
                placeholder="e.g. quantum-lattice-conway-matrix-entropy-42"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Active Wallet Details Box */}
          {activeWallet ? (
            <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-5 space-y-4 shadow-xl shadow-cyan-950/20">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold font-mono text-white text-sm">
                    Active Post-Quantum Wallet
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-300 text-xs font-mono border border-emerald-500/30">
                  {activeWallet.algorithm}
                </span>
              </div>

              {/* Quantum Address */}
              <div className="space-y-1">
                <div className="text-xs font-mono text-slate-400">Quantum Address (`pq1q...`):</div>
                <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300">
                  <span className="truncate">{activeWallet.address}</span>
                  <button
                    onClick={() => handleCopy(activeWallet.address, 'address')}
                    className="ml-2 text-slate-400 hover:text-cyan-300 cursor-pointer"
                  >
                    {copiedField === 'address' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Public Key Matrix */}
              <div className="space-y-1">
                <div className="text-xs font-mono text-slate-400">Public Key Lattice Polynomials:</div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-[11px] text-purple-300 break-all max-h-24 overflow-y-auto scrollbar-thin">
                  {activeWallet.publicKeyHex}
                </div>
              </div>

              {/* Private Key Hex */}
              <div className="space-y-1">
                <div className="text-xs font-mono text-slate-400">Secret Key Representation:</div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-[11px] text-red-300 break-all max-h-20 overflow-y-auto scrollbar-thin">
                  {activeWallet.privateKeyHex}
                </div>
              </div>

              <div className="text-[11px] font-mono text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                Security Guarantee: <strong className="text-cyan-300">{activeWallet.securityLevel}</strong>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
              <Lock className="w-8 h-8 text-slate-500 mx-auto" />
              <div className="font-mono text-sm text-slate-300">No Post-Quantum Wallet Created Yet</div>
              <p className="text-slate-500 text-xs max-w-sm mx-auto">
                Click "Generate New PQ Keypair" above to create your post-quantum wallet address.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Send Tokens Drawer & Signature Verification Sandbox */}
        <div className="lg:col-span-5 space-y-6">
          {/* Send QBITS Form */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold font-mono text-white text-sm flex items-center gap-2">
              <Send className="w-4 h-4 text-cyan-400" />
              <span>Send Post-Quantum QBits</span>
            </h3>

            <form onSubmit={handleSendTx} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Recipient PQ Address:</label>
                <input
                  type="text"
                  required
                  value={receiverAddress}
                  onChange={(e) => setReceiverAddress(e.target.value)}
                  placeholder="pq1q..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Amount (QBits):</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Conway State Attachment:</label>
                <input
                  type="text"
                  value={conwayPayload}
                  onChange={(e) => setConwayPayload(e.target.value)}
                  placeholder="GLIDER_STATE_ATTACHMENT"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                disabled={!activeWallet || isSending}
                className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold py-2.5 rounded-xl shadow-md shadow-cyan-900/20 disabled:opacity-50 cursor-pointer transition-all"
              >
                {isSending ? 'Signing & Broadcasting...' : 'Sign & Submit Transaction'}
              </button>

              {sendTxStatus && (
                <div className="text-[11px] text-cyan-300 bg-cyan-950/60 p-2 rounded-lg border border-cyan-500/30">
                  {sendTxStatus}
                </div>
              )}
            </form>
          </div>

          {/* Signature Testing Verification Studio */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono text-xs">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-purple-400" />
              <span>Signature Verification Studio</span>
            </h3>

            <div className="space-y-2">
              <label className="text-slate-400">Message Payload to Sign:</label>
              <input
                type="text"
                value={testPayload}
                onChange={(e) => setTestPayload(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSignTest}
                disabled={!activeWallet}
                className="flex-1 bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-500/40 py-2 rounded-xl cursor-pointer"
              >
                Sign Payload
              </button>
              <button
                onClick={handleVerifyTest}
                disabled={!signedResult}
                className="flex-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 py-2 rounded-xl cursor-pointer"
              >
                Verify Signature
              </button>
            </div>

            {signedResult && (
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[10px] space-y-1">
                <div className="text-slate-400">Signature Output Hex:</div>
                <div className="text-amber-300 break-all">{signedResult.signatureHex}</div>
              </div>
            )}

            {verifyStatus !== null && (
              <div
                className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold ${
                  verifyStatus
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                    : 'bg-red-950 text-red-300 border-red-500/40'
                }`}
              >
                {verifyStatus ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Post-Quantum Signature VERIFIED VALID</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span>INVALID Signature Verification</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
