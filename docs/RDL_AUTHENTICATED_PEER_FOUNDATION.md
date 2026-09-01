# RDL Authenticated Peer Foundation

Development peers now perform a signed Ed25519 authentication exchange before processing protocol commands.

## Implemented
- persistent node identity seed
- signed AUTH handshake
- malformed or unsigned peers are rejected
- existing development commands run only after authentication

## Reality boundary
This provides basic cryptographic peer authentication only. It does **not** provide:
- encrypted transport or confidentiality
- certificate/PKI trust policy
- authorization or validator membership
- replay-resistant session protocol
- peer discovery/gossip
- production DoS protection

This is a development security foundation, not production P2P security.
