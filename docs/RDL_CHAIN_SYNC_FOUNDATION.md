# RDL Development Chain Synchronization

## Implemented
A development peer can now:

- expose its serialized chain with `GET_CHAIN`
- accept only a directly linked, locally validated next block through `SUBMIT_BLOCK`
- allow another node to run `--sync ADDRESS`
- validate every received transaction signature and block linkage before replacing a shorter local chain

Example:

```bash
cargo run -p rdl-node -- --listen 127.0.0.1:7001
cargo run -p rdl-node -- --sync 127.0.0.1:7001
```

## Reality boundary
This is a minimal development synchronization protocol. It does not yet provide:

- authenticated or encrypted peers
- peer discovery
- gossip mesh
- robust fork-choice
- Byzantine fault tolerance
- denial-of-service controls
- production serialization/framing
- public testnet guarantees

A successful sync proves only that a locally reachable peer transferred a chain that passed the current local validation rules.
