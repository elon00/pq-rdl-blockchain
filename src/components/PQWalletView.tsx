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
  Sparkles,
  Coins,
  Droplets,
  DollarSign,
  Flame
} from 'lucide-react';
import { PQAlgorithm, PQKeypair, PQSignature, Transaction } from '../types';
import { generatePQKeypair, signPQPayload, verifyPQSignature } from '../lib/pqCrypto';
import { tokenEngine } from '../lib/tokenEngine';
import { faucetEngine } from '../lib/faucetEngine';

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
  const [faucetClaimStatus, setFaucetClaimStatus] = useState<string>('');
  const [, setWalletRefreshTrigger] = useState<number>(0);

  // Copy helper
  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Generate keys only in the browser. Secret key material is never requested from the server.
  const handleGenerateKeypair = async () => {
    try {
      const localKeypair = await generatePQKeypair(selectedAlgo);
      onWalletGenerated(localKeypair);
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
      const payloadString = `${activeWallet.address}:${receiverAddress}:${amount}:${Date.now()}`;
      const signature = await signPQPayload(payloadString, activeWallet);
      const locallyValid = await verifyPQSignature(payloadString, signature, activeWallet.publicKeyHex);
      if (!locallyValid) throw new Error('locally generated ML-DSA signature failed verification');

      const success = await onSendTransaction({
        senderAddress: activeWallet.address,
        receiverAddress,
        amount: Number(amount),
        algorithm: activeWallet.algorithm,
        signatureHex: signature.signatureHex,
        conwayStatePayload: conwayPayload,
      });

      if (success) {
        setSendTxStatus('Signed transaction accepted by the configured prototype API.');
        setReceiverAddress('');
      } else {
        setSendTxStatus('Signed locally with ML-DSA-65, but network submission is disabled/unavailable.');
      }
    } catch (err: any) {
      setSendTxStatus(`Send Error: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  // Sign Payload Test with the real ML-DSA implementation.
  const handleSignTest = async () => {
    if (!activeWallet) return;
    try {
      const sigObj = await signPQPayload(testPayload, activeWallet);
      setSignedResult(sigObj);
      setVerifyStatus(null);
    } catch (err: any) {
      console.error(err);
    }
  };

  // Verify locally so secret key material never leaves the browser.
  const handleVerifyTest = async () => {
    if (!activeWallet || !signedResult) return;
    try {
      setVerifyStatus(await verifyPQSignature(testPayload, signedResult, activeWallet.publicKeyHex));
    } catch {
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
            Generate and test ML-DSA-65 keys locally in your browser. This is a cryptographic prototype, not an audited wallet product.
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

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => setSelectedAlgo('Dilithium2')}
                className="p-3 rounded-xl text-left border font-mono bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-950/40"
              >
                <div className="font-bold text-xs">ML-DSA-65 (compatibility label: Dilithium2)</div>
                <div className="text-[10px] text-slate-400 mt-1">NIST FIPS 204 module-lattice signature implementation</div>
              </button>
            </div>
            <p className="text-[10px] text-slate-500">Deterministic seed phrases are intentionally disabled; key generation uses CSPRNG entropy.</p>
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

              {/* Token & Faucet Balances Box */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3 font-mono">
                <div className="flex items-center justify-between text-xs text-slate-300 font-bold border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-1.5 text-cyan-400">
                    <Coins className="w-4 h-4" />
                    <span>Post-Quantum Wallet Balances</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Local demo balances</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-cyan-500/20">
                    <div className="text-[11px] text-slate-400">Native Gas (RDL)</div>
                    <div className="text-sm font-bold text-cyan-300">Not connected</div>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-emerald-500/20">
                    <div className="text-[11px] text-slate-400">RDL Stablecoin</div>
                    <div className="text-sm font-bold text-emerald-400">
                      {(tokenEngine.getTokenById('tok_rdl_stablecoin_001')?.balances[activeWallet.address] || 0).toLocaleString()} RDL-USD
                    </div>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-amber-500/20">
                    <div className="text-[11px] text-slate-400">RDL Meme Coin</div>
                    <div className="text-sm font-bold text-amber-400">
                      {(tokenEngine.getTokenById('tok_rdl_memecoin_002')?.balances[activeWallet.address] || 0).toLocaleString()} RDL-MEME
                    </div>
                  </div>
                </div>

                {/* Instant Faucet Button */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={async () => {
                      setFaucetClaimStatus('Requesting 50 RDL + 1,000 RDL-USD + 10M RDL-MEME...');
                      const res = await faucetEngine.dispense(activeWallet.address, 'ALL');
                      if (res.success) {
                        setFaucetClaimStatus('🎉 Local demo balances updated; no public-testnet settlement occurred.');
                        setWalletRefreshTrigger(prev => prev + 1);
                      } else {
                        setFaucetClaimStatus(`⚠️ ${res.error}`);
                      }
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-teal-950/80 hover:bg-teal-900 border border-teal-500/40 text-teal-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Droplets className="w-3.5 h-3.5 text-teal-400" />
                    <span>Run Local Demo Faucet</span>
                  </button>
                  {faucetClaimStatus && (
                    <div className="text-[11px] text-teal-300 mt-1.5 text-center">
                      {faucetClaimStatus}
                    </div>
                  )}
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
                <div className="text-xs font-mono text-slate-400">Secret Key:</div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-[11px] text-red-300">
                  Held only in this browser session for the demo; it is not rendered or sent to the server.
                </div>
              </div>

              <div className="text-[11px] font-mono text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                Implementation status: <strong className="text-cyan-300">{activeWallet.securityLevel}</strong>
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
