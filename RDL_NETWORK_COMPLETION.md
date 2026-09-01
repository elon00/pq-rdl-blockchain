# RDL Network Completion Pipeline

## One-click Reality Mode

Run:

```bash
npm ci
npm run rdl:finish
```

The pipeline is reusable and executes every machine-verifiable stage in order. It **does not fabricate public-network, audit, legal, economic, or mainnet evidence**.

## Six stages

1. **Persistent Devnet** — persistent state, deterministic genesis, restart recovery.
2. **Distributed Testnet** — multi-node/network fault and synchronization verification.
3. **Public Testnet Readiness** — RPC, explorer, faucet and public validator operational checks.
4. **Incentivized Testnet Readiness** — validator onboarding, telemetry and abuse/incident controls.
5. **Mainnet Security Readiness** — adversarial testing, dependency review and independent-audit evidence gate.
6. **Mainnet Genesis Readiness** — immutable genesis checklist, operator sign-off and reproducible release evidence.

## Reality Mode rule

A stage can be marked **VERIFIED** only when its evidence exists. The one-click command can automate checks and produce a readiness report, but external launch decisions remain blocked until the required real-world evidence is supplied.

## Exit artifact

The pipeline writes `artifacts/rdl-network-readiness.json` and exits non-zero if any required machine-verifiable gate fails.
