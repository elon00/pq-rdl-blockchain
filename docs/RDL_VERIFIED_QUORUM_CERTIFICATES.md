# RDL Verified Quorum Certificate Foundation

RDL now creates and verifies an identity-bound quorum certificate (QC) before the current commit path persists a candidate block.

## QC contents
- block hash
- validator public-key identity for every vote
- Ed25519 signature for every vote

## Verification
- every signer must belong to the configured validator set
- duplicate validator identities are rejected
- every signature is verified against the domain-separated vote payload
- the QC must contain at least floor(2N/3)+1 unique valid votes

Verified QCs are persisted as data/qc-<block-hash>.json.

## Reality boundary
This is a materially stronger consensus primitive, but it is still not complete production BFT finality. The protocol lacks explicit height/round/view binding in vote payloads, deterministic proposer selection, view changes, equivocation evidence/handling, durable consensus state, and adversarial Byzantine testing.

The next consensus gate must bind votes to height and round and implement timeout-driven view changes.
