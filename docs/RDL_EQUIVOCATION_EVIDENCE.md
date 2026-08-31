# RDL Equivocation Evidence Foundation

## Implemented
RDL detects conflicting validator votes for the same:

- height
- round
- view
- validator identity

A validator is considered equivocating only when two different block hashes have valid signatures from the same validator for the same consensus context.

## Evidence
Evidence records contain both conflicting block hashes and both cryptographic signatures and are persisted under:

`data/equivocation/`

The current commit path rejects a candidate when newly observed verified equivocation evidence is found.

## Reality boundary
This is cryptographic detection and evidence preservation, not a complete validator punishment system. Production governance still needs deterministic evidence gossip, consensus-level evidence inclusion, validator removal/slashing rules, appeal/governance procedures, durable cross-restart evidence indexing, and adversarial tests.
