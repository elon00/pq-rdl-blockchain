# RDL Connection Concurrency Foundation

RDL development nodes now enforce a maximum of **64 active connection handlers**.

## Implemented
- non-blocking listener accept loop
- bounded active connection count
- per-connection worker thread
- excess connections are dropped instead of creating unlimited handlers

## Security benefit
This prevents straightforward unlimited handler creation from consuming node resources without bound.

## Reality boundary
This is a development concurrency cap. Production networking should use a bounded async runtime or worker pool, IP/subnet limits, rate limiting, backpressure, fair scheduling, peer scoring and adversarial load testing.
