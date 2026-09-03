# PQ-RDL Node Operator Guide
## Version 0.1 Draft — Prototype / Future Testnet Operations

## 1. Purpose
This guide defines the baseline responsibilities for PQ-RDL node operators. It applies progressively to development, testnet, and future production environments.

## 2. Current Network Reality
The repository currently demonstrates local multi-node smoke testing. That is not equivalent to independent public validator operation. Operators must report the actual environment truthfully.

## 3. Operator Responsibilities
Operators MUST:
- use approved releases and verify checksums/signatures when available;
- protect validator and administrative keys;
- separate development and production credentials;
- maintain patched operating systems and dependencies;
- monitor availability, logs, storage, and resource exhaustion;
- avoid publishing secrets, private keys, seed phrases, or sensitive configuration;
- report material incidents through the published process;
- never fabricate uptime, stake, consensus, transaction, or node evidence.

## 4. Node Identity and Independence
A future public testnet should use distinct node identities and independently controlled infrastructure. Multiple processes on one laptop or one administrative domain do not prove independent validator decentralization.

## 5. Security Baseline
Use least privilege, strong authentication, encrypted transport where required, secure backups, access logging, patch management, and tested recovery procedures. Never copy production keys into public repositories.

## 6. Network Operation
Before joining a public network, verify:
- official release version;
- genesis/network identifier;
- bootstrap endpoints;
- peer identity requirements;
- firewall and port configuration;
- storage requirements;
- monitoring and recovery procedures.

## 7. Consensus Participation
Run only the approved consensus software and configuration. Do not intentionally equivocate, duplicate validator identities, manipulate votes, or bypass safety locks. Consensus participation rules become binding only when published with the production network specification.

## 8. Persistent Ledger and Recovery
Operators must maintain the required persistent state, perform tested backups where applicable, and demonstrate restart recovery. A successful HTTP response alone is not proof of ledger durability.

## 9. State Synchronization and Transactions
A valid public-network operator must be able to demonstrate, where the protocol supports it:
- synchronization from authorized peers;
- deterministic state validation;
- transaction propagation;
- settlement/finality evidence;
- recovery after restart.

## 10. Rewards and Incentives
No operator reward is promised by this draft. Any future reward program must be published separately with eligibility, measurement, issuance, penalties, governance, taxation and legal disclosures. Testnet rewards may differ from mainnet rewards.

## 11. DAO Relationship
The DAO may govern eligible protocol and ecosystem matters according to the DAO Governance Specification. Emergency security controls and protocol safety must have clearly bounded procedures and cannot be replaced by informal voting.

## 12. Compliance
Operators are responsible for following applicable laws and service-provider terms in their jurisdictions. This guide does not grant permission to operate where operation is restricted.

## 13. Evidence Package
For public-testnet verification, operators should provide reproducible evidence including software version, node identity policy, deployment environment (without exposing secrets), peer/consensus evidence, persistence, state sync, settlement and restart-recovery results.

## 14. Operator Code of Conduct
Truth over hype. Security over shortcuts. Evidence over claims. Independence over simulated decentralization.
