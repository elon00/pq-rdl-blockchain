# RDL Development Consensus Profile v0

## Purpose
This document defines a deterministic **development-only** chain selection rule so that synchronization behavior is explicit rather than implicit.

## Rule
For valid candidate chains sharing the same genesis:
1. Prefer the chain with greater height.
2. If heights are equal, retain the existing chain unless a future protocol version defines a deterministic finalized-weight rule.

## Validation prerequisites
A candidate must pass:
- genesis validation
- contiguous heights
- parent-hash linkage
- transaction signature verification
- block transaction limits

## Reality boundary
This is **not Byzantine Fault Tolerant consensus**. It does not tolerate adversarial validators, equivocation, network partitions, Sybil attacks, or provide finality guarantees.

Production consensus requires a separately specified validator model, safety/liveness analysis, adversarial testing, and independent security review.
