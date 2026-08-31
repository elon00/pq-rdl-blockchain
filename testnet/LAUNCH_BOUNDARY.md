# RDL Public Testnet Launch Boundary

Status: **POLICY — NOT A LAUNCH RECORD**

## Public Testnet may be declared only when all conditions are true

1. The deterministic genesis artifact and recorded SHA-256 match.
2. A versioned release artifact and checksum are available.
3. At least two independently administered nodes are deployed.
4. Public bootstrap endpoints are reachable.
5. Independent nodes demonstrate peer connectivity and state synchronization.
6. A real Testnet transaction or state transition is independently reproducible.
7. Restart/recovery and external health checks have evidence.
8. The deployment evidence record and promotion checklist are completed.
9. No required security or operational blocker remains unresolved.

## Prohibited declarations

Do not call the network:

- "Public Testnet"
- "Mainnet"
- "Production blockchain"

based only on CI, Docker smoke tests, local containers, repository files, or planning documentation.

## Status transition

`DRAFT_NOT_LAUNCHED` → `PUBLIC_TESTNET_VERIFIED`

requires evidence for every condition above.

`PUBLIC_TESTNET_VERIFIED` → Mainnet requires a separate Mainnet readiness and authorization process.
