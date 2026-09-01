# RDL Quorum Commit Gate Foundation

RDL block admission now includes a development quorum gate.

## Flow
1. An authorized validator submits a candidate block.
2. The node validates block linkage and transactions.
3. The candidate hash identifies the proposal.
4. The proposer collects validator vote responses.
5. The node requires `floor(2N/3)+1` collected vote responses before local commit.
6. Only then is the block persisted and propagated.

## Reality boundary — critical
This is a **provisional quorum commit gate**, not complete BFT finality.

The current implementation does not yet bind every collected network response to the claimed validator identity, construct a portable quorum certificate with signer identities, or implement rounds/views and equivocation handling. Therefore collected vote counts must not be marketed as cryptographically verified BFT finality.

The next gate must replace response-counting with identity-bound vote verification and a serialized quorum certificate.
