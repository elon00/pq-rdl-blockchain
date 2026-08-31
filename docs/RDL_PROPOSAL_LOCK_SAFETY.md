# RDL Proposal Lock and Safety Foundation

## Implemented
RDL validators now maintain persistent proposal lock state.

Before voting, a validator checks whether the candidate conflicts with its existing lock at the same consensus context. Conflicting votes are rejected with `safety_lock_conflict`.

The lock is persisted in:

`data/rdl-lock-state.json`

Lock records are signed with a domain-separated `RDL-LOCK-v1` payload and validator identity is verified against the configured validator set.

## Safety boundary
This is a local persistent voting-safety foundation. It is not yet a formally specified HotStuff/Tendermint locking protocol.

Still required:
- protocol-level lock/unlock rules driven by QC relationships
- prepared/precommitted phases where applicable
- lock evidence propagation
- recovery rules for stale locks
- formal safety tests proving conflicting finalization cannot occur
- multi-validator adversarial tests

No production-finality claim should be made until those properties are specified and tested.
