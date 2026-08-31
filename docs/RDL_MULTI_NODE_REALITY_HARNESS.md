# RDL Multi-Node Reality Harness

This harness defines the executable release procedure for the current consensus implementation.

## Preconditions
- build succeeds with `cargo check --workspace --all-targets`
- validator identities are configured explicitly
- every node has independent persistent data directories
- TLS material must be present where the current transport gate requires it

## Scenario matrix

### S1 Normal quorum
Start four validators. Submit a valid proposal from the deterministic proposer. Assert one QC reaches the configured quorum and one committed height is observed.

### S2 Insufficient quorum
Stop enough validators that quorum cannot be reached. Assert no block commit occurs and the proposal enters the timeout/view-change path.

### S3 Invalid signature
Inject a malformed vote. Assert QC verification rejects it.

### S4 Duplicate signer
Inject two votes carrying the same validator identity. Assert QC verification rejects duplicate identities.

### S5 Equivocation
Provide two valid signatures by one validator for different block hashes at the same height/round/view. Assert evidence is persisted and commit is rejected.

### S6 Partition
Split validators into groups below conflicting quorum. Assert neither partition produces conflicting commits.

### S7 Recovery
Restart a validator after persisted QC/TC/lock state. Assert state reload does not permit a conflicting same-context vote.

## PASS gate
RDL may advance toward controlled testnet evaluation only after these scenarios are automated, reproducible, and executed against independently running nodes.
