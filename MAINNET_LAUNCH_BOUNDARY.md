# RDL Mainnet Launch Boundary

Status: **POLICY — NOT A MAINNET LAUNCH RECORD**

## Mainnet may be declared only after

- Public Testnet has completed an evidence-backed verification period.
- Protocol rules and genesis governance are finalized.
- Production key management and validator/operator procedures are operational.
- Independent security review appropriate to protocol risk is completed and material findings are remediated.
- Monitoring, alerting, incident response, backup, recovery, and rollback procedures are tested.
- Versioned release artifacts and checksums are published.
- Governance authorization for Mainnet genesis is recorded.
- Applicable legal/compliance obligations have been reviewed.

## Prohibited shortcut

A successful CI pipeline, Devnet smoke test, repository checklist, or Testnet planning document is never sufficient evidence for a Mainnet declaration.

## Status transition

`PUBLIC_TESTNET_VERIFIED` → `MAINNET_CANDIDATE` → `MAINNET_VERIFIED`

Each transition requires independently reviewable evidence.
