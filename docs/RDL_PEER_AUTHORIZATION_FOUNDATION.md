# RDL Peer Authorization Foundation

RDL now separates **authentication** from **authorization**.

## Authentication
Each connection completes the Ed25519 nonce challenge-response handshake.

## Authorization
When the environment variable `RDL_AUTHORIZED_PEERS` is configured, it contains a comma-separated allowlist of 32-byte Ed25519 public keys encoded as lowercase hexadecimal.

Only authenticated peers whose public key is present in that list may execute protocol commands.

Example:

```bash
export RDL_AUTHORIZED_PEERS="<64-hex-char-key-1>,<64-hex-char-key-2>"
```

If the variable is not configured, authorization remains open for development compatibility.

## Reality boundary
The environment allowlist is a development authorization mechanism. It is not decentralized validator governance, key rotation, certificate management, encrypted transport, or a production membership protocol.
