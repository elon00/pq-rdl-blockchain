# RDL Transaction Admission Foundation

RDL nodes now have a bounded in-memory transaction admission path.

## Implemented
- deterministic transaction ID: SHA-256 of the serialized signed transaction
- signature verification before admission
- duplicate transaction suppression
- bounded mempool capacity: 10,000 transactions
- `SUBMIT_TX <json>` protocol command
- explicit `TX_ACCEPTED <id>` or `TX_REJECTED <reason>` response

## Reality boundary
This is local transaction admission, not transaction gossip. Transactions are not yet propagated to other peers, persisted across restart, economically priced, or protected by account/state nonce rules. Those require the next mempool and consensus gates.
