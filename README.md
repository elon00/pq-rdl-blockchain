# PQ-RDL: Post-Quantum Distributed Consensus Infrastructure

**Maintainer**: Martin Luther (elon00)  
**Cluster Architecture**: 3-Node Containerized Devnet  
**Companion Identity & Governance**: [Republic-of-Divine-Light](https://github.com/elon00/Republic-of-Divine-Light)  
**Status**: Devnet Smoke Verification Passing in CI  

## 1. Architecture & Scope
PQ-RDL implements quantum-resistant consensus primitives decoupled into two layers:
- **Consensus Infrastructure (`pq-rdl-blockchain`)**: Distributed state replication, peer gossip, and block finality.
- **Identity & Governance (`Republic-of-Divine-Light`)**: Citizen identity schemas, constitutional proposals, and voting logic.

## 2. 5-Second Standalone Quickstart
Run the 3-node devnet consensus smoke test:

```bash
python scripts/devnet_smoke_test.py
```

## 3. Devnet Specifications
| Component | Implementation | Invariant Checked |
| :--- | :--- | :--- |
| **Node Cluster** | 3-Node Devnet (`node-01`, `node-02`, `node-03`) | 2/3 BFT Quorum Finality |
| **Hash Primitives** | SHA3-256 / SHA3-512 | Collision-Resistant Block Trees |
| **Governance Link** | Cross-Repo Identity Handshake | Validated via Republic-of-Divine-Light |
