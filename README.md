# 🏛️ Republic of Divine Light — PQ-RDL Blockchain

Research and prototype implementation for the **Republic of Divine Light (RDL)** ecosystem.

## Canonical implementation

This repository is the canonical runnable implementation for RDL.

The companion repository `Republic-of-Divine-Light` serves as the ecosystem identity and governance landing repository.

## Current status

**Status: OPERATIONAL DEVNET VERIFIED (CI) / PROTOTYPE — NOT PUBLIC TESTNET OR MAINNET**

The repository has CI-verified a three-node Docker Operational Devnet smoke environment. It remains a prototype and this is **not evidence of**:

- a live distributed blockchain or validator network,
- externally measured TPS, hashrate, or active-node telemetry,
- public-chain transaction settlement,
- externally deployed smart contracts,
- verified production PQC protection,
- an independent security audit or legal compliance certification.

## Reality and evidence rules

```text
Research → Prototype → Tests → Evidence → Independent Review → Deployment → VERIFIED
```

A simulation must remain labelled as a simulation. A random identifier or local response is not cryptographic proof, a blockchain transaction, or a deployment record.

## Run locally

**Prerequisites:** Node.js 20+ and npm.

1. Install the locked dependency set:

   `npm ci`

2. Copy the safe environment template:

   `cp .env.example .env.local`

3. Add `GEMINI_API_KEY` only if the optional Gemini functionality is used.

4. Start the development server:

   `npm run dev`

## Verification

Run:

`npm test`

The intended verification flow is:

`Environment → Truth → Lint/Type Checks → Production Build`

## Governance

See [RDL_CONSTITUTION.md](./RDL_CONSTITUTION.md) for the RDL Constitution and Reality Charter.

## Repository relationship

- **`pq-rdl-blockchain`** — canonical runnable prototype and implementation
- **`Republic-of-Divine-Light`** — ecosystem identity and governance landing repository

© 2026 Republic of Divine Light — research and prototype ecosystem.
