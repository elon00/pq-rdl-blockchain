# RDL Automated Consensus Unit-Test Gate

Reality Mode now adds executable unit tests for core cryptographic consensus invariants.

## Covered invariants
- vote signatures cannot be replayed across height/round/view contexts
- duplicate validator identities invalidate a QC
- equivocation requires two valid signatures for conflicting hashes
- a persistent safety lock rejects a conflicting block at the same height even after a local view change
- duplicate validator identities invalidate a Timeout Certificate

## Important boundary
These are unit-level invariant tests. They do not prove distributed safety or liveness. Multi-process Byzantine and network-partition tests remain required before controlled public testnet claims.

The safety lock is intentionally conservative: without a formally specified QC/TC-based unlock rule, it does not permit a validator to sign a different block at the same height merely because the local round or view increased.
