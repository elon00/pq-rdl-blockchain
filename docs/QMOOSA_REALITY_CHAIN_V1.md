# QMoosa Reality Chain v1 — Testnet Implementation Plan

## Objective
Replace the current in-memory demonstration with a genuinely networked, persistent, evidence-gated blockchain testnet implementation.

## Required completion gates
1. Persistent append-only storage with restart recovery.
2. Canonical transaction encoding and cryptographic signature verification.
3. Deterministic block validation and chain-selection rules.
4. Independent node processes communicating over authenticated P2P transport.
5. Multi-node integration tests proving propagation and convergence.
6. Public testnet infrastructure with reproducible genesis configuration.
7. Explorer/API telemetry derived from live node state only.
8. Threat model, security review, operational key management and incident procedures.
9. Deployment evidence containing node identities/endpoints, genesis hash, version and verification timestamp.

## Reality rule
No stage may be labelled MAINNET, LIVE, VERIFIED, production PQC, or legally compliant without machine-verifiable evidence and the required independent review.

## Current gate
BLOCKED: the repository has an in-memory prototype. This branch is the implementation workspace; it is not a completed testnet or mainnet.
