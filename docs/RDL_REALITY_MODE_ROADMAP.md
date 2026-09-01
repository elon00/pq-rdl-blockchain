# RDL Blockchain — Reality Mode Roadmap

## Rule
**No simulated capability may be presented as a verified production capability.**

## Completed development foundations
- persistent ledger
- signed transactions
- block validation
- TCP multi-node foundation
- challenge-response peer authentication
- optional peer authorization
- bounded protocol frames
- socket timeouts
- global and per-IP connection caps
- request limits and pacing
- node-local identity-aware rate limiting

## Next implementation gates

### Gate 1 — Secure transport
Introduce authenticated encrypted transport using a reviewed protocol/library. Do not invent custom cryptography.

### Gate 2 — Transaction propagation
Define transaction IDs, deduplication, bounded mempool admission, gossip envelopes and peer fan-out.

### Gate 3 — Block propagation
Define block inventory announcements, fetch-by-hash, validation-before-forwarding and duplicate suppression.

### Gate 4 — Peer discovery
Add explicit bootstrap peers and a bounded peer table. Discovery must be rate-limited and authenticated.

### Gate 5 — Validator membership
Replace environment-only development allowlists with a versioned validator-set model and explicit governance/rotation rules.

### Gate 6 — Consensus
Select and implement one formally specified consensus protocol. Safety and liveness must be tested under partitions and Byzantine faults.

### Gate 7 — PQC crypto-agility
Create algorithm identifiers, versioned key/signature formats and migration paths. Use standardized or well-reviewed implementations.

### Gate 8 — Testnet readiness
Reproducible node builds, genesis process, monitoring, explorer/API boundaries, load tests, failure recovery and an external security review.

## Exit criteria
A public testnet is not declared ready until the above gates have measurable evidence, automated tests and reproducible deployment procedures.
