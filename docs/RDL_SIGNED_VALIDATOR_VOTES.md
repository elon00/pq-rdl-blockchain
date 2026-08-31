# RDL Signed Validator Vote Foundation

RDL now contains signed vote primitives for the consensus layer.

## Implemented
- domain-separated vote payload: `RDL-VOTE-v1 || block_hash`
- authenticated validator-only `VOTE_REQUEST <block_hash>`
- Ed25519 signed vote responses
- local signature verification primitive
- consensus timeout constant reserved for round handling

## Reality boundary
This is **not BFT consensus yet**. A signed vote primitive alone does not create safety or liveness.

Still required:
- proposal validation and proposer rules
- vote collection and deduplication
- validator identity binding checks across transport and vote messages
- quorum certificate construction and verification
- explicit commit rules
- height/round/view state
- timeouts and view changes
- Byzantine partition and equivocation tests

No block should be marketed as consensus-finalized merely because vote primitives exist.
