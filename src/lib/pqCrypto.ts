import { PQAlgorithm, PQKeypair, PQSignature } from '../types';

// SHA-256 utility. This project does not implement a real post-quantum signature primitive.
export async function sha256Hex(message: string): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) throw new Error('Web Crypto SHA-256 is unavailable in this runtime');
  const data = new TextEncoder().encode(message);
  const hashBuffer = await subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate deterministic demonstration identifiers. These are NOT keys for Dilithium, Falcon, SPHINCS+, ML-DSA, or any other real PQC scheme.
export async function generatePQKeypair(algorithm: PQAlgorithm, seedPhrase?: string): Promise<PQKeypair> {
  const timestamp = Date.now();
  const seed = seedPhrase || `${algorithm}-${timestamp}-${Math.random()}`;
  const seedHash = await sha256Hex(seed);

  let addressPrefix = 'pq1q';
  let securityLevel = 'DEMONSTRATION ONLY — no cryptographic security level is claimed';
  let pubPrefix = '';
  let privPrefix = '';

  if (algorithm === 'Dilithium2') {
    addressPrefix = 'pq1dil2';
    securityLevel = 'DEMONSTRATION ONLY — not a real Dilithium/ML-DSA keypair';
    pubPrefix = 'DIL2_PK_';
    privPrefix = 'DIL2_SK_';
  } else if (algorithm === 'Falcon-512') {
    addressPrefix = 'pq1flc512';
    securityLevel = 'DEMONSTRATION ONLY — not a real Falcon keypair';
    pubPrefix = 'FLC512_PK_';
    privPrefix = 'FLC512_SK_';
  } else if (algorithm === 'SPHINCS+') {
    addressPrefix = 'pq1sph';
    securityLevel = 'DEMONSTRATION ONLY — not a real SPHINCS+ keypair';
    pubPrefix = 'SPH_PK_';
    privPrefix = 'SPH_SK_';
  }

  // Create clearly prefixed placeholder strings for UI demonstrations.
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

// Create a deterministic demonstration attestation. It is NOT a post-quantum digital signature.
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
    valid: false,
  };
}

// Verify only internal consistency of the demonstration attestation; this is NOT cryptographic signature verification.
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

  return signature.valid === false;
}
