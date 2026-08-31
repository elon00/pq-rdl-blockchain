# RDL Testnet and Mainnet Readiness Plan

## Current verified stage

**Operational Devnet — VERIFIED by CI runtime evidence.**

The verified evidence covers a three-node Docker deployment with TLS material, listener startup, Docker DNS resolution, TCP connectivity, authentication challenge handling, and a three-node PING/PONG ring.

This is not a public Testnet or Mainnet.

## Stage 1 — Public Testnet readiness

Before any public Testnet claim:

- deterministic genesis/configuration
- persistent chain/state storage and recovery tests
- explicit peer discovery/bootstrap design
- externally reachable node endpoints
- telemetry, health checks, logs, and alerting
- transaction/state-transition API with integration tests
- rate limits and abuse controls
- reproducible release artifacts and versioning
- Testnet operator documentation

## Stage 2 — Public Testnet

A Testnet can be declared only after independent public nodes can:

1. join from separate infrastructure,
2. synchronize the same network state,
3. submit and verify real Testnet transactions/state transitions,
4. recover after restart,
5. expose independently observable health/status.

All claims must be backed by reproducible evidence.

## Stage 3 — Security and independent review

Required before Mainnet consideration:

- threat model
- dependency and secret scanning
- adversarial/network testing
- reproducible security test evidence
- independent review/audit appropriate to the protocol's risk
- remediation and retesting of findings

## Stage 4 — Mainnet readiness

Mainnet requires more than a passing CI pipeline. It requires:

- finalized protocol and genesis governance
- production infrastructure and key management
- validator/operator onboarding
- monitoring and incident response
- backup and recovery procedures
- release and rollback process
- legal/compliance review where applicable
- public security disclosure process

## Reality rule

**PASS means only what the evidence proves.**

Operational Devnet PASS does not equal Public Testnet PASS, and Public Testnet PASS does not equal Mainnet readiness.
