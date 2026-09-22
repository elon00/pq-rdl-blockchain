# Token and network-frame integrity review

Baseline: ac789a3b380a611eb4fee21f6fbcd8e0a444045d.

This change closes concrete accounting and input-boundary bugs in the prototype. It does not promote the application to public testnet, mainnet, or production PQC readiness.

## Fixed

- Token mint, transfer and faucet operations reject negative, zero, nonfinite and oversized amounts and invalid object-key addresses before mutation.
- An empty or insufficient faucet reserve no longer creates balances. Requests are all-or-nothing.
- Engine instances no longer share canonical token objects, and getters return snapshots rather than writable internal state.
- Faucet ALL drops preflight both reserves and concurrent requests from the same address cannot bypass cooldown while hashing.
- Faucet statistics count actual local claims instead of adding hardcoded historical totals. A daily allowance is not implemented and is reported as zero.
- Rust peer reads consume at most MAX_FRAME_BYTES + 1 bytes per line before rejecting oversized data. Truncated frames are rejected. Three tests cover oversized, boundary, concatenated, truncated and invalid UTF-8 inputs.

## Validation

Eight accounting regression tests and TypeScript lint passed locally. The existing eight-group crypto smoke script passed through `node --import tsx` (the tsx CLI's IPC socket was denied by this environment). Production build passed. A dedicated token integrity workflow runs tests, lint and build.

Rust and rustfmt were unavailable locally; the Rust toolchain download was blocked by the environment's network. Rust compilation, tests, lint and formatting must pass the existing RDL Reality Gate before merge. These are not claimed as locally passed.

## Remaining launch blockers

- The Rust transport validates TLS files but uses raw TcpStream for peer messages; TLS file presence does not establish encrypted transport.
- Consensus integration test `development_fork_choice_prefers_longer_valid_chain` contains no assertions. Fork choice and multi-node adversarial behavior need executable evidence.
- The TypeScript `src/lib/pqCrypto.ts` explicitly generates demonstration identifiers and checks caller-supplied attestation fields; this is not production signature verification. Separate crypto smoke tests do not secure this application path.
- HTTP token transfer and mint routes do not establish sender authorization. The accounting checks do not make those routes safe for valuable assets.
- Amounts still use JavaScript numbers, and the prototype meme burn can generate fractional values even though token decimals are zero. A separately reviewed atomic-unit migration is needed before real issuance.
- UI, Rust-node ledger, testnet faucet and deployed-network evidence must be reconciled before any readiness claim.
- Public testnet/mainnet operation, third-party audit and external deployment remain unverified.

The existing nominal token supplies were preserved. No tokens were deployed, no real funds moved, and no submitted hackathon materials were modified on the default branch.
