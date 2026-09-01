# RDL Node Networking Foundation

## Development P2P protocol
The current RDL networking layer is intentionally a minimal TCP development transport for local multi-process experiments.

It supports framed JSON messages:
- `PING`
- `PONG`

It is **not production P2P networking** and does not yet provide authenticated peers, encrypted transport, peer discovery, gossip, transaction propagation, block synchronization, or consensus.

Run one listener:

```bash
cargo run -p rdl-node -- --listen 127.0.0.1:7001
```

Probe it from another process:

```bash
cargo run -p rdl-node -- --ping 127.0.0.1:7001
```

Reality Mode: a successful PING/PONG proves only local TCP node communication.
