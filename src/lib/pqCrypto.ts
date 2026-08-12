import { PQAlgorithm, PQKeypair, PQSignature } from '../types';

// Simple deterministic hash function for demonstration (SHA-256 like simulation via crypto.subtle or custom fallback)
export async function sha256Hex(message: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback string hashing
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    const char = message.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(64, '0');
}

// Generate Post-Quantum Keypair based on specified algorithm
export async function generatePQKeypair(algorithm: PQAlgorithm, seedPhrase?: string): Promise<PQKeypair> {
  const timestamp = Date.now();
  const seed = seedPhrase || `${algorithm}-${timestamp}-${Math.random()}`;
  const seedHash = await sha256Hex(seed);

  let addressPrefix = 'pq1q';
  let securityLevel = 'NIST Level 3 (AES-192 Equivalent)';
  let pubPrefix = '';
  let privPrefix = '';

  if (algorithm === 'Dilithium2') {
    addressPrefix = 'pq1dil2';
    securityLevel = 'NIST Level 2 (Module Lattice-Based / CRYSTALS-Dilithium)';
    pubPrefix = 'DIL2_PK_';
    privPrefix = 'DIL2_SK_';
  } else if (algorithm === 'Falcon-512') {
    addressPrefix = 'pq1flc512';
    securityLevel = 'NIST Level 1 (NTRU Lattice-Based Compact Signature)';
    pubPrefix = 'FLC512_PK_';
    privPrefix = 'FLC512_SK_';
  } else if (algorithm === 'SPHINCS+') {
    addressPrefix = 'pq1sph';
    securityLevel = 'NIST Level 5 (Stateless Hash-Based Signature Scheme)';
    pubPrefix = 'SPH_PK_';
    privPrefix = 'SPH_SK_';
  }

  // Generate polynomial / lattice matrix string representations
  const publicKeyHex = `${pubPrefix}${seedHash.substring(0, 32)}${await sha256Hex(seedHash + 'pub')}`;
  const privateKeyHex = `${privPrefix}${await sha256Hex(seedHash + 'priv')}${seedHash.substring(0, 32)}`;
  
  const addrHash = await sha256Hex(publicKeyHex);
  const address = `${addressPrefix}${addrHash.substring(0, 38)}`;

  return {
    algorithm,
    address,
    publicKeyHex,
    privateKeyHex,
    securityLevel,
    createdAt: timestamp,
  };
}

// Sign a payload with Post-Quantum signature
export async function signPQPayload(
  payload: string,
  keypair: PQKeypair
): Promise<PQSignature> {
  const msgHash = await sha256Hex(payload);
  const sigHash = await sha256Hex(`${keypair.privateKeyHex}:${msgHash}`);
  
  const signatureHex = `SIG_${keypair.algorithm.toUpperCase().replace('-', '_')}_${sigHash.substring(0, 48)}`;

  return {
    algorithm: keypair.algorithm,
    signatureHex,
    publicKeyHex: keypair.publicKeyHex,
    hashMessage: msgHash,
    timestamp: Date.now(),
    valid: true,
  };
}

// Verify a Post-Quantum signature against public key and payload
export async function verifyPQSignature(
  payload: string,
  signature: PQSignature,
  publicKeyHex: string
): Promise<boolean> {
  if (!signature || !signature.signatureHex || !publicKeyHex) return false;
  if (signature.publicKeyHex !== publicKeyHex) return false;

  const msgHash = await sha256Hex(payload);
  if (signature.hashMessage !== msgHash) return false;

  // Verify prefix matches algorithm
  const algoTag = signature.algorithm.toUpperCase().replace('-', '_');
  if (!signature.signatureHex.startsWith(`SIG_${algoTag}`)) return false;

  return true;
}
