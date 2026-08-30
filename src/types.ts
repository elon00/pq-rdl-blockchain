export type PQAlgorithm = 'Dilithium2' | 'Falcon-512' | 'SPHINCS+';

export interface PQKeypair {
  algorithm: PQAlgorithm;
  address: string;
  publicKeyHex: string;
  privateKeyHex: string;
  securityLevel: string; // e.g. "AES-128 Quantum Equivalent (Lattice-Based)"
  createdAt: number;
}

export interface PQSignature {
  algorithm: PQAlgorithm;
  signatureHex: string;
  publicKeyHex: string;
  hashMessage: string;
  timestamp: number;
  valid: boolean;
}

export interface Transaction {
  txHash: string;
  senderAddress: string;
  receiverAddress: string;
  amount: number;
  fee: number;
  algorithm: PQAlgorithm;
  signatureHex: string;
  conwayStatePayload?: string; // Optional Conway pattern attached to tx
  timestamp: number;
  status: 'pending' | 'confirmed' | 'rejected';
  blockHeight?: number;
}

export interface ConwayGrid {
  rows: number;
  cols: number;
  cells: number[][]; // 0 for dead, 1 for alive
  generation: number;
  entropy: number;
  population: number;
}

export interface MiningProof {
  initialSeed: number[][];
  finalGrid: number[][];
  generationsRun: number;
  entropyScore: number;
  nonce: number;
  hash: string;
}

export interface Block {
  height: number;
  previousHash: string;
  hash: string;
  timestamp: number;
  minerAddress: string;
  transactions: Transaction[];
  miningProof: MiningProof;
  pqSignature: PQSignature;
  quantumDifficulty: number;
  entropyIndex: number;
}

export interface ChainState {
  height: number;
  latestHash: string;
  quantumDifficulty: number;
  totalTransactions: number;
  pendingMempool: Transaction[];
  activeNodes: number | null;
  averageEntropy: number;
  tps: number | null;
  networkHashrate: string | null;
  mode?: string;
  statusNote?: string;
}

export interface NetworkNode {
  id: string;
  name: string;
  address: string;
  region: string;
  status: 'active' | 'syncing' | 'validating';
  algorithm: PQAlgorithm;
  latencyMs: number;
  blocksValidated: number;
  isMiner: boolean;
}

export interface SmartContract {
  id: string;
  name: string;
  creatorAddress: string;
  code: string;
  abi: string[];
  type: 'Escrow' | 'Governance' | 'Yield' | 'Identity' | 'Custom';
  state: Record<string, any>;
  createdBlock: number;
  conwayTriggerRule: string;
  isAiAutonomous: boolean;
}

export interface AiContractAnalysis {
  contractId?: string;
  securityRating: 'A+' | 'A' | 'B' | 'C' | 'CRITICAL_RISK';
  postQuantumResilienceScore: number; // 0 - 100
  conwayEntropyAnalysis: string;
  vulnerabilities: string[];
  suggestedOptimizations: string[];
  generatedCode?: string;
}
