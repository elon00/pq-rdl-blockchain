import { PQAlgorithm, PQKeypair, PQSignature } from '../types';
import { ml_dsa65 } from '@noble/post-quantum/ml-dsa.js';
import { sha256 } from '@noble/hashes/sha256';

const te = new TextEncoder();
const hex = (b: Uint8Array) => Buffer.from(b).toString('hex');
const bytes = (h: string) => new Uint8Array(Buffer.from(h.replace(/^0x/, ''), 'hex'));

export async function sha256Hex(message: string): Promise<string> {
  return hex(sha256(te.encode(message)));
}

function requireMLDSA(algorithm: PQAlgorithm) {
  if (algorithm !== 'Dilithium2') {
    throw new Error(`${algorithm} is disabled: this API currently supports only real NIST FIPS 204 ML-DSA-65. Legacy names Falcon-512/SPHINCS+ are not silently simulated.`);
  }
}

/**
 * Compatibility API backed by real NIST FIPS 204 ML-DSA-65.
 * The historical UI enum name "Dilithium2" is retained only for compatibility;
 * cryptographic operations below are ML-DSA-65, not legacy Dilithium2.
 */
export async function generatePQKeypair(algorithm: PQAlgorithm, _seedPhrase?: string): Promise<PQKeypair> {
  requireMLDSA(algorithm);
  if (_seedPhrase) throw new Error('Seed phrases are disabled for real key generation; CSPRNG entropy is required.');
  const k = ml_dsa65.keygen();
  const publicKeyHex = hex(k.publicKey);
  const privateKeyHex = hex(k.secretKey);
  const address = `pq1mldsa65${hex(sha256(k.publicKey)).slice(0, 38)}`;
  return {
    algorithm,
    address,
    publicKeyHex,
    privateKeyHex,
    securityLevel: 'NIST FIPS 204 ML-DSA-65 (algorithm implementation; not a FIPS 140 module validation claim)',
    createdAt: Date.now(),
  };
}

export async function signPQPayload(payload: string, keypair: PQKeypair): Promise<PQSignature> {
  requireMLDSA(keypair.algorithm);
  const message = te.encode(payload);
  const signature = ml_dsa65.sign(message, bytes(keypair.privateKeyHex));
  return {
    algorithm: keypair.algorithm,
    signatureHex: hex(signature),
    publicKeyHex: keypair.publicKeyHex,
    hashMessage: hex(sha256(message)),
    timestamp: Date.now(),
    valid: true,
  };
}

export async function verifyPQSignature(payload: string, signature: PQSignature, publicKeyHex: string): Promise<boolean> {
  try {
    requireMLDSA(signature.algorithm);
    if (signature.publicKeyHex.replace(/^0x/, '').toLowerCase() !== publicKeyHex.replace(/^0x/, '').toLowerCase()) return false;
    const message = te.encode(payload);
    if (signature.hashMessage.replace(/^0x/, '').toLowerCase() !== hex(sha256(message))) return false;
    return ml_dsa65.verify(bytes(signature.signatureHex), message, bytes(publicKeyHex));
  } catch {
    return false;
  }
}
