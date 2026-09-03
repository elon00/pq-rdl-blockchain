# PQ-RDL Blockchain White Paper
## Republic of Divine Light (RDL) — Research-to-Testnet Architecture

**Version:** 0.1 Draft  
**Date:** 3 September 2026  
**Status:** Prototype / Operational Devnet evidence only — NOT a verified public testnet or mainnet.

## 1. Executive Summary
PQ-RDL is a research and prototype blockchain initiative focused on a security-first path toward distributed operation and future post-quantum readiness. The project follows a strict reality rule: software tests, simulations, local nodes, and HTTP endpoints must never be presented as proof of a public blockchain unless independently verifiable evidence exists.

## 2. Problem
Public blockchain systems face long-term cryptographic migration, validator independence, operational resilience, governance, and evidence-quality challenges. PQ-RDL is designed as an engineering program that addresses these problems through staged verification rather than marketing claims.

## 3. Architecture
The current repository contains:
- a Rust node and shared types;
- consensus and transaction-security tests;
- a local three-node secure-transport smoke environment;
- a TypeScript/React frontend and server build;
- reality-gate scripts that distinguish local success from public-network proof.

Current architecture is **not yet proof of a live public distributed network**.

## 4. Consensus
The current codebase contains development consensus and safety tests. Production consensus is not declared verified until a complete, independently reviewed specification and real multi-party validator evidence exist. The recommended production direction is a **BFT-style Proof-of-Stake / validator-stake model with cryptographic identity, slashing/governance safeguards, and explicit PQC migration planning**, subject to security review and implementation evidence.

## 5. DAO Governance
A DAO governance framework is defined in the companion DAO Governance Specification. Governance must not bypass protocol safety, law, security incident controls, or emergency procedures. DAO voting is a governance mechanism, not proof of decentralization by itself.

## 6. Token Policy
No token economics are considered final merely because a draft exists. If a future token uses an uncapped or unlimited supply, issuance MUST be governed by explicit, auditable rules covering:
- issuance authority and limits per period;
- inflation rationale;
- anti-abuse controls;
- governance approval;
- public disclosure;
- accounting and applicable legal/tax review.

An “unlimited supply” must never mean unlimited discretionary minting.

## 7. Node Operators
Node operators run infrastructure according to the Node Operator Guide. Operators must maintain key security, uptime practices, software integrity, incident reporting, and truthful telemetry. Rewards, if introduced, require a separately approved and published incentive specification.

## 8. Testnet and Mainnet Documentation Lifecycle
The core white paper may evolve across stages:
1. Prototype: architecture and research claims.
2. Public testnet: verified endpoints, genesis, validator evidence, economics and operational data.
3. Mainnet: final production parameters, audits, governance, risk disclosures, and legally reviewed policies.

Operator guidance may remain structurally similar, but commands, rewards, security procedures, validator requirements, and network parameters must be versioned by network stage.

## 9. What Must Be Public
Public-facing documents should be stored in the repository and/or official documentation site. Hashes or references may optionally be anchored on-chain for integrity after a real chain exists, but the full documents do not need to be stored on-chain. Version history and cryptographic hashes are preferred for efficient verification.

## 10. Reality Gate
Public Testnet status requires independently verifiable evidence for at least:
- persistent ledger;
- external P2P connectivity;
- consensus between distinct nodes;
- real multi-node deployment;
- bootstrap endpoints;
- independent administration;
- state synchronization;
- real transaction settlement;
- restart recovery.

Until that evidence exists, the correct verdict is **NOT_VERIFIED**.

## 11. Security and Post-Quantum Migration
Post-quantum claims must be evidence-based. A production deployment should define approved algorithms, key lifecycle, migration paths, downgrade resistance, interoperability testing, and independent cryptographic review. Experimental libraries or local smoke tests are not sufficient proof of production PQC security.

## 12. Legal and Compliance Principle
The project must follow applicable law in each jurisdiction where it operates. This document is not legal advice and does not certify compliance. Blockchain, token, DAO, privacy, consumer, sanctions, tax, securities, cyber-security, and data-protection obligations require jurisdiction-specific professional review before launch.

## 13. Roadmap
**Phase A:** Fix local master-finisher execution and keep all local gates reproducible.  
**Phase B:** Deploy distinct, independently administered testnet nodes.  
**Phase C:** Produce signed evidence for consensus, persistence, state sync, settlement, and recovery.  
**Phase D:** Independent security and compliance review.  
**Phase E:** Public testnet verification.  
**Phase F:** Mainnet readiness decision only after production evidence and approvals.

## Final Statement
PQ-RDL is currently a prototype with verified local and CI-style development evidence. It must not be marketed as a verified public testnet or mainnet until the required external evidence exists.
