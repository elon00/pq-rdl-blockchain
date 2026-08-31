# RDL Transaction Propagation Foundation

RDL now supports bounded bootstrap-peer transaction propagation.

## Configuration

Set peers explicitly:

```bash
export RDL_BOOTSTRAP_PEERS="127.0.0.1:9001,127.0.0.1:9002"
```

A node uses at most **16 configured peers**.

## Flow

1. A peer submits `SUBMIT_TX <json>`.
2. The receiving node verifies the signature.
3. The transaction receives a deterministic ID.
4. Duplicate transactions are rejected locally.
5. Newly admitted transactions are forwarded to configured bootstrap peers.
6. Peers independently validate and deduplicate them.

## Reality boundary

This is explicit bootstrap-peer forwarding, not a complete production gossip protocol. It has no peer inventory protocol, adaptive fan-out, persistent peer table, retry queue, topology management, or encrypted Rustls stream yet. Duplicate suppression prevents straightforward re-forwarding loops because only newly admitted transactions trigger forwarding.
