# RDL Per-Connection Request Limit Foundation

Each authenticated RDL TCP connection may process at most **32 protocol requests** before the node closes the request session.

## Why
A connection cap alone does not prevent one peer from monopolizing a worker indefinitely through unlimited sequential requests.

## Implemented
- maximum 32 requests per authenticated connection
- explicit `CONNECTION_REQUEST_LIMIT` terminal response
- existing socket timeout still bounds stalled requests

## Reality boundary
This is a basic development abuse-control mechanism. Production systems need identity-aware rate limits, token buckets, global backpressure, message-cost accounting, peer scoring, and load testing.
