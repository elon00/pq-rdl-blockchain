# RDL Challenge-Response Peer Authentication

RDL development peers now use a fresh server-generated 256-bit challenge for each connection.

## Protocol
1. Server sends `CHALLENGE <nonce>`.
2. Client signs `RDL-AUTH-v1 || nonce` with its Ed25519 identity.
3. Client sends `AUTH <public-key> <signature>`.
4. Server verifies the signature before processing protocol commands.

## Security improvement
A previously captured authentication message is not valid for a newly generated challenge, reducing simple handshake replay.

## Reality boundary
This is still development-grade authentication. It does not provide encrypted transport, peer authorization/validator membership, certificate trust, confidentiality, traffic analysis resistance, or production DoS protection.
