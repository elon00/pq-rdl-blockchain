# RDL Bounded Frame Foundation

The development TCP protocol now rejects newline-delimited protocol frames larger than **1 MiB**.

## Why
Unbounded line reads can allow a peer to force excessive memory allocation. RDL now applies a maximum frame size to:
- authentication messages
- protocol commands
- client responses

## Reality boundary
This is a basic development resource bound, not complete DoS protection. Production networking still requires connection limits, timeouts, streaming/framed serialization, backpressure, rate limiting, peer scoring, and adversarial load testing.
