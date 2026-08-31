# RDL Block Propagation Foundation

RDL now supports bounded bootstrap-peer forwarding of newly accepted blocks.

## Flow

1. A peer submits `SUBMIT_BLOCK <json>`.
2. The node validates transaction signatures, height and parent linkage.
3. The block is appended only after validation.
4. The ledger is persisted.
5. The newly accepted block is forwarded to at most **16 configured bootstrap peers**.
6. Receiving peers independently validate the block.

## Duplicate and loop behavior

A block already accepted by a peer normally fails the expected height/parent linkage against that peer's current tip and is rejected, preventing straightforward repeated forwarding from becoming repeated chain insertion.

## Reality boundary

This is explicit bootstrap-peer forwarding, not a complete production block gossip protocol. It does not yet implement inventory announcements, fetch-by-hash, orphan handling, fork choice beyond chain length, retries, topology-aware fan-out, or encrypted Rustls streams.
