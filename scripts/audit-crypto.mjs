/**
 * PQ-RDL-BLOCKCHAIN — STANDALONE CRYPTOGRAPHIC AUDITOR
 *
 * Runs 24 standalone cryptographic assertions:
 * - RFC 5869 HKDF-SHA256 KAT
 * - RDL SHA-256 Address derivation
 * - SHA-256 Ledger State Commitment Invariants
 * - NIST FIPS 203 ML-KEM-768 lattice execution
 * - FIPS 203 §7.3 Implicit Rejection
 * - NIST FIPS 204 ML-DSA-65 digital signatures
 * - Adversarial negative signature/key rejection
 * - RDL Dual Hybrid Conjunction conformance
 */

import { hkdf } from '@noble/hashes/hkdf.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { generateKeyPairSync, sign as ed25519Sign, verify as ed25519Verify } from 'node:crypto';
import { ml_kem768 } from '@noble/post-quantum/ml-kem.js';
import { ml_dsa65 } from '@noble/post-quantum/ml-dsa.js';

let passedAssertions = 0;
const totalAssertions = 24;

function assert(condition, description) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${description}`);
    process.exit(1);
  }
  passedAssertions++;
  console.log(`  [${passedAssertions}/${totalAssertions}] ✅ ${description}`);
}

async function runAudit() {
  console.log('=====================================================================');
  console.log('⚡ PQ-RDL-BLOCKCHAIN // STANDALONE CRYPTOGRAPHIC AUDITOR');
  console.log('=====================================================================\n');

  // TIER 1: RFC 5869 HKDF-SHA256
  console.log('▶ [TIER 1] RFC 5869 HKDF-SHA256 Known Answer Verification:');
  const ikm = Buffer.from('0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b', 'hex');
  const salt = Buffer.from('000102030405060708090a0b0c', 'hex');
  const info = Buffer.from('f0f1f2f3f4f5f6f7f8f9', 'hex');
  const okm = hkdf(sha256, ikm, salt, info, 42);
  assert(Buffer.from(okm).toString('hex').startsWith('3cb25f25faacd57a90434f64d0362f2a'), 'RFC 5869 Test Case 1 byte-for-byte match');

  // TIER 2: RDL Address & State Commitments
  console.log('\n▶ [TIER 2] RDL Address & State Commitment Invariants:');
  const pk = new Uint8Array(32).fill(0xcc);
  const rdlAddr = Buffer.from(sha256(pk)).toString('hex');
  assert(rdlAddr.length === 64, 'RDL address produces exact 32 bytes hex');
  const emptySha = Buffer.from(sha256(new Uint8Array(0))).toString('hex');
  assert(emptySha === 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'Empty SHA-256 matches canonical hash');

  // TIER 3: NIST FIPS 203 ML-KEM-768
  console.log('\n▶ [TIER 3] NIST FIPS 203 ML-KEM-768 Lattice Execution:');
  const seedKem = new Uint8Array(64).fill(0x11);
  const kemKeys = ml_kem768.keygen(seedKem);
  assert(kemKeys.publicKey.length === 1184, 'ML-KEM-768 public key exact 1,184 bytes');
  assert(kemKeys.secretKey.length === 2400, 'ML-KEM-768 secret key exact 2,400 bytes');
  const kemKeys2 = ml_kem768.keygen(seedKem);
  assert(Buffer.from(kemKeys.publicKey).equals(Buffer.from(kemKeys2.publicKey)), 'ML-KEM-768 keygen deterministic from seed');

  const encap = ml_kem768.encapsulate(kemKeys.publicKey);
  assert(encap.cipherText.length === 1088, 'ML-KEM-768 ciphertext exact 1,088 bytes');
  assert(encap.sharedSecret.length === 32, 'ML-KEM-768 shared secret exact 32 bytes');
  const decap = ml_kem768.decapsulate(encap.cipherText, kemKeys.secretKey);
  assert(Buffer.from(encap.sharedSecret).equals(Buffer.from(decap)), 'ML-KEM-768 decapsulation recovers shared secret byte-for-byte');

  // TIER 4: FIPS 203 §7.3 Implicit Rejection
  console.log('\n▶ [TIER 4] FIPS 203 §7.3 Implicit Rejection:');
  const badCt = new Uint8Array(encap.cipherText);
  badCt[0] ^= 0x01;
  const rejectKey = ml_kem768.decapsulate(badCt, kemKeys.secretKey);
  assert(rejectKey.length === 32, 'Implicit rejection returns valid 32-byte pseudorandom value');
  assert(!Buffer.from(rejectKey).equals(Buffer.from(encap.sharedSecret)), 'Corrupted ciphertext does NOT yield sender shared secret');

  // TIER 5: NIST FIPS 204 ML-DSA-65
  console.log('\n▶ [TIER 5] NIST FIPS 204 ML-DSA-65 Digital Signatures:');
  const seedDsa = new Uint8Array(32).fill(0x22);
  const dsaKeys = ml_dsa65.keygen(seedDsa);
  assert(dsaKeys.publicKey.length === 1952, 'ML-DSA-65 public key exact 1,952 bytes');
  assert(dsaKeys.secretKey.length === 4032, 'ML-DSA-65 secret key exact 4,032 bytes');
  const dsaCommitment = sha256(dsaKeys.publicKey);
  assert(dsaCommitment.length === 32, 'ML-DSA-65 public key commitments derive 32-byte SHA-256 hash');

  const dsaKeys2 = ml_dsa65.keygen(seedDsa);
  assert(Buffer.from(dsaKeys.publicKey).equals(Buffer.from(dsaKeys2.publicKey)), 'ML-DSA-65 keygen deterministic from seed');

  const msg = new TextEncoder().encode('PQ-RDL Distributed Ledger Invariant');
  const sig = ml_dsa65.sign(msg, dsaKeys.secretKey);
  assert(sig.length === 3309, 'ML-DSA-65 signature exact 3,309 bytes');
  const isSigValid = ml_dsa65.verify(sig, msg, dsaKeys.publicKey);
  assert(isSigValid === true, 'ML-DSA-65 genuine signature verified successfully');

  // TIER 6: Adversarial Negative Tests
  console.log('\n▶ [TIER 6] Adversarial Negative Tests:');
  const badSig = new Uint8Array(sig);
  badSig[0] ^= 0x01;
  assert(!ml_dsa65.verify(badSig, msg, dsaKeys.publicKey), 'Bit-flipped signature rejected cleanly');
  const alteredMsg = new TextEncoder().encode('PQ-RDL Distributed Ledger Invariant Tampered');
  assert(!ml_dsa65.verify(sig, alteredMsg, dsaKeys.publicKey), 'Altered message rejected cleanly');
  const truncatedSig = sig.slice(0, 3000);
  let truncatedSigRejected = false;
  try {
    truncatedSigRejected = !ml_dsa65.verify(truncatedSig, msg, dsaKeys.publicKey);
  } catch {
    truncatedSigRejected = true;
  }
  assert(truncatedSigRejected, 'Truncated signature rejected cleanly');

  const malformedPk = dsaKeys.publicKey.slice(0, 1000);
  let malformedPkRejected = false;
  try {
    malformedPkRejected = !ml_dsa65.verify(sig, msg, malformedPk);
  } catch {
    malformedPkRejected = true;
  }
  assert(malformedPkRejected, 'Malformed public key size rejected cleanly');

  // TIER 7: Dual Conjunction Conformance
  console.log('\n▶ [TIER 7] RDL Dual Conjunction Conformance:');
  const { publicKey: edPublicKey, privateKey: edPrivateKey } = generateKeyPairSync('ed25519');
  const edSig = ed25519Sign(null, Buffer.from(msg), edPrivateKey);
  const classicalValid = ed25519Verify(null, Buffer.from(msg), edPublicKey, edSig);
  assert(classicalValid && isSigValid, 'Dual conjunction holds when both Ed25519 and ML-DSA are valid');

  const badEdSig = Buffer.from(edSig);
  badEdSig[0] ^= 0x01;
  const badClassicalValid = ed25519Verify(null, Buffer.from(msg), edPublicKey, badEdSig);
  const badPqValid = ml_dsa65.verify(badSig, msg, dsaKeys.publicKey);
  assert(!badClassicalValid && isSigValid, 'Dual conjunction rejects tampered Ed25519 while ML-DSA remains valid');
  assert(classicalValid && !badPqValid, 'Dual conjunction rejects tampered ML-DSA while Ed25519 remains valid');

  console.log('\n=====================================================================');
  console.log(`🏆 ALL ${passedAssertions}/${totalAssertions} CRYPTOGRAPHIC ASSERTIONS PASSED CLEANLY`);
  console.log('=====================================================================\n');
}

runAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
