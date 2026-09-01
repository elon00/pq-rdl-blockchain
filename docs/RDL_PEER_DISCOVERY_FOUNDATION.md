# RDL Peer Discovery Foundation

RDL now maintains a bounded persistent peer table.

## Implemented
- bootstrap peers from `RDL_BOOTSTRAP_PEERS`
- persistent peer table at `data/rdl-peers.json`
- maximum 64 known peers
- socket-address validation before admission
- duplicate suppression
- `GET_PEERS` protocol command
- `ANNOUNCE_PEER host:port` protocol command
- transaction and block forwarding use the known peer table

## Reality boundary
This is bounded explicit peer exchange, not production-grade decentralized discovery. It has no signed peer records, reputation, NAT traversal, DHT, anti-eclipse protection, encrypted Rustls streams, or automatic liveness scoring. Announcements are accepted only after the existing connection authentication layer, but address claims themselves are not independently proven.
