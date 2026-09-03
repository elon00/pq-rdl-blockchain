# QMoosa / RDL Consensus Specification

Version 1.0 — Design Target

## Consensus Model

The target production consensus model is a **Hybrid Proof-of-Stake + Byzantine Fault Tolerant (PoS+BFT)** design.

PoS determines validator eligibility/weight according to the final economic rules. The BFT layer is responsible for proposing, voting on, and finalizing blocks under defined quorum and fault assumptions.

## Important Status

This document defines the intended protocol direction. It is **not** evidence that the production PoS+BFT network is already deployed.

## Required Components Before Mainnet

- validator registration and identity
- stake accounting and delegation rules, if enabled
- proposer selection
- vote validation
- quorum/finality rules
- equivocation handling
- validator rewards/slashing rules, where legally and technically applicable
- persistent consensus state
- state synchronization
- recovery after restart
- adversarial and network-partition testing

## Evidence Standard

A consensus implementation must be demonstrated through reproducible tests and live multi-validator evidence. Local smoke tests do not establish independent public-network consensus.
