# RDL Consensus Adversarial Test Plan

Reality Mode testing must prove behavior instead of claiming production readiness.

## Required scenarios
1. 4 validators, normal quorum and commit.
2. Insufficient votes: commit rejected.
3. Invalid validator signature: QC rejected.
4. Duplicate validator vote: QC rejected.
5. Conflicting same-context votes: equivocation evidence generated.
6. Timeout quorum: timeout certificate advances view.
7. Network partition: no conflicting finalization.
8. Restart recovery: consensus context, locks, QCs and TCs reload safely.

## Current release gate
Until these scenarios are automated and executed against multiple independently running nodes, RDL must be described as a **consensus implementation under adversarial test preparation**, not production-ready BFT.

## Testnet exit criteria
- automated multi-node harness
- reproducible Byzantine scenarios
- no conflicting commit in partition tests
- QC and TC verification coverage
- transport authentication/encryption
- independent security review
