# QMoosa / RDL Public Testnet Specification

Version 1.0 — Draft

## Purpose

Define the conditions under which RDL may be operated and described as a public testnet.

## Required Evidence

Public Testnet status requires reproducible evidence for:

1. deterministic genesis and release identity
2. at least two publicly reachable bootstrap endpoints where required by the deployment architecture
3. independently administered nodes
4. real peer-to-peer communication
5. consensus participation and block finalization
6. persistent ledger behaviour
7. state synchronization
8. real transaction processing/settlement on the testnet
9. restart/recovery behaviour
10. deployment and operational evidence

## Status Rule

Source code, CI, Docker, localhost tests, screenshots, or HTTP health responses are insufficient by themselves to declare a public testnet verified.

## Testnet Economics

Token rewards, if introduced on Testnet, are experimental and may change or be removed. They are not a guarantee of Mainnet allocation or monetary value.

## Promotion Gate

`PUBLIC_TESTNET_VERIFIED` may be declared only after the project's Reality Gate passes all required evidence checks.
