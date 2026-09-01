# RDL Devnet Manifest

**Status: DEVELOPMENT TEMPLATE — NOT A PUBLIC NETWORK**

This manifest is the reproducible starting point for a persistent multi-node devnet.

## Local launch

```bash
docker compose up --build
```

## Reality requirements before promotion

A successful local compose launch is **not** a public testnet. Promotion requires evidence for:

- persistent state surviving restart,
- unique node identities and keys,
- real P2P peer discovery and synchronization,
- externally reachable RPC,
- independent machine/operator deployment,
- monitoring and incident procedures.

Do not label this configuration as Testnet or Mainnet until those requirements are implemented and verified.
