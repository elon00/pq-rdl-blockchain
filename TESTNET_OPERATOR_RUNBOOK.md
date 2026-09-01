# RDL Public Testnet Operator Runbook

Status: **DRAFT — NOT A LAUNCH RECORD**

## Purpose

This runbook defines the minimum reproducible procedure for promoting the CI-verified Operational Devnet architecture toward independently operated Public Testnet infrastructure.

## Preflight

1. Run the unified repository verification:

   `node scripts/start-and-finish-everything.mjs`

2. Verify the deterministic genesis fingerprint:

   `npm run testnet:genesis-hash`

3. Confirm the manifest status remains `DRAFT_NOT_LAUNCHED` until all promotion evidence exists.

## Independent infrastructure requirement

Deploy at least two nodes on separately administered infrastructure. Do not count multiple Docker containers on one host as independent public operators.

Each operator must record:

- node identifier
- software release version/checksum
- genesis SHA-256
- public endpoint
- deployment timestamp

## Evidence required before promotion

- independently reachable endpoints
- successful peer/bootstrap connectivity
- identical network/genesis identity
- state synchronization evidence
- transaction/state-transition integration evidence
- restart/recovery evidence
- externally observable health/status
- release checksums and operator records

## Promotion boundary

Only after the checklist is backed by reproducible evidence may the manifest status be changed from `DRAFT_NOT_LAUNCHED` to a stronger verified status.

CI success alone is not a public launch record.
