# RDL Public Testnet Infrastructure Specification

Status: **PLANNING SPECIFICATION — NOT A LAUNCH RECORD**

## Minimum topology

A Public Testnet requires at least:

- 2 independently administered validator/node operators
- separate failure domains (different administrators and preferably different providers/regions)
- publicly reachable bootstrap endpoints
- deterministic genesis identity shared by every node

## Required environment values

Each deployment must record:

- `RDL_NODE_ID`
- `RDL_DATA_DIR`
- `RDL_BOOTSTRAP_PEERS`
- release version/checksum
- genesis SHA-256

Do not commit private keys, credentials, or provider secrets.

## Promotion sequence

1. Build a versioned release artifact.
2. Verify release checksum and genesis SHA-256.
3. Deploy operator A and operator B independently.
4. Publish only the endpoints intended to be public.
5. Verify bootstrap and peer connectivity.
6. Verify state identity and synchronization.
7. Execute a real Testnet transaction/state-transition test.
8. Verify restart/recovery.
9. Record external health/status evidence.
10. Complete `TESTNET_PROMOTION_CHECKLIST.md`.

Only then can a public Testnet status be considered.
