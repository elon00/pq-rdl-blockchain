# QMoosa / RDL Node Operator Guide

Version 1.0 — Reality-First Draft

## Purpose

This guide defines operational expectations for Testnet and Mainnet node operators.

## Truth Standard

Operators and automation MUST distinguish implementation, testing, deployment, and independently verified network status. No operator may claim Public Testnet or Mainnet status without the evidence required by the project's reality gates.

## Node Security

- Protect validator/node private keys and credentials.
- Never commit secrets, seed phrases, passwords, or API credentials.
- Restrict administrative access and expose only required network services.
- Keep operating-system and project dependencies updated.
- Maintain monitoring, backups, and recovery procedures appropriate to the node role.

## Network Roles

### Development
Local development only; not a public network claim.

### Testnet
Publicly reachable nodes may be used for experimentation. Testnet rewards, if enabled, are experimental and are not a promise of future financial value.

### Mainnet
Production validators require stronger operational controls, documented release procedures, incident response, backup/recovery, and governance approval.

## Evidence Requirements

Where applicable, operators should retain reproducible evidence for:

- node identity
- deployment version and commit
- persistent ledger
- P2P connectivity
- consensus participation
- state synchronization
- transaction processing/settlement
- restart/recovery
- uptime and incident records

Evidence must describe its scope and limitations. Local smoke tests must not be presented as independent validator evidence.

## Governance

Protocol, validator, and reward-policy changes should follow the project's approved governance process. DAO/governance mechanisms are subject to the project's published governance specification and applicable law.

## Token Supply and Operator Rewards

The project currently specifies an **unlimited maximum token supply**. Unlimited maximum supply MUST NOT be interpreted as unlimited uncontrolled minting. Any issuance or reward mechanism must be defined by protocol rules and governance, with transparent parameters and auditable issuance records.

Testnet rewards, if any, are experimental and may differ from Mainnet. Mainnet operator rewards, if introduced, must be governed by the final protocol economics and applicable legal/compliance review. No reward is guaranteed solely by operating a node.

## Privacy and Legal Compliance

Do not store unnecessary personal or confidential information on-chain. Operators must comply with applicable laws and regulations in their jurisdictions. This document is operational guidance, not legal advice. Production launch should receive jurisdiction-specific legal and security review.

## Incident Response

Report security issues through the project's responsible disclosure process. Preserve relevant evidence, protect network integrity, and communicate material incidents truthfully.

## Release Procedure

1. Verify the published release/version.
2. Verify checksums/signatures where provided.
3. Apply configuration appropriate to the network.
4. Start the node and verify health.
5. Verify peer connectivity.
6. Verify synchronization and consensus status.
7. Record deployment evidence.

## Golden Rule

**Operate what is documented, document what is actually operated, and claim only what the evidence proves.**
