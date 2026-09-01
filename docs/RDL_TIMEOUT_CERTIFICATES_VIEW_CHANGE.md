# RDL Timeout Certificate and Coordinated View-Change Foundation

## Implemented
- domain-separated signed timeout messages
- timeout messages bound to height, round and view
- validator identity-bound timeout verification
- unique-validator timeout certificate (TC)
- quorum requirement of floor(2N/3)+1 valid timeouts
- persistent TC artifacts under data/tc-<height>-<round>-<view>.json
- consensus view/round advances only after the current TC verification gate succeeds

## Reality boundary
This is a coordinated quorum-gated view-change foundation, not a complete production consensus protocol.

Still required:
- independent timeout scheduling/state machine
- explicit proposal locking and safety rules
- equivocation evidence and penalties
- durable recovery of in-flight proposals and certificates
- deterministic network-wide synchronization tests
- Byzantine and partition adversarial testing

A TC proves valid signatures for the same local consensus context, but full distributed liveness requires a complete protocol state machine and testing.
