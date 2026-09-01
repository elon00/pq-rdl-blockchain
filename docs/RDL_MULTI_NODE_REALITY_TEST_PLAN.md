# RDL Reality Mode: Multi-Node Test Plan

This plan defines the minimum evidence required before claiming a development multi-node testnet milestone.

## Required independent processes
- Node A: listener with its own data directory
- Node B: listener with its own data directory
- Node C: listener with its own data directory

## Evidence gates
1. Each node starts from a valid genesis chain.
2. A peer responds to PING/PONG.
3. Height and tip can be queried.
4. A valid chain can be transferred and validated.
5. Tampered transactions are rejected by validation tests.
6. Nodes converge only according to explicitly documented development rules.

## Not yet satisfied by this document
This plan does not itself prove Byzantine consensus, public reachability, production security, or a public testnet.
