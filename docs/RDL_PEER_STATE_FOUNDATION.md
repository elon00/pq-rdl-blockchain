# RDL Peer State Foundation

The development TCP transport now supports:

- `PING` -> `PONG`
- `GET_HEIGHT` -> peer chain height
- `GET_TIP_HASH` -> peer tip hash

Example:

```bash
cargo run -p rdl-node -- --listen 127.0.0.1:7001
cargo run -p rdl-node -- --height 127.0.0.1:7001
cargo run -p rdl-node -- --tip 127.0.0.1:7001
```

Reality boundary: these queries provide basic peer observability only. They do not implement authenticated peers, encrypted transport, transaction gossip, block transfer, chain synchronization, Byzantine consensus, or a public testnet.
