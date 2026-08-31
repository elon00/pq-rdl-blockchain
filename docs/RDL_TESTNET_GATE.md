# RDL Reality Mode Testnet Gate

## Automated quality gate

The repository CI is configured to run on every branch push and pull request, and can also be started manually with GitHub Actions.

The gate executes:

```bash
cargo fmt --all -- --check
cargo check --workspace --all-targets --locked
cargo test --workspace --all-targets --locked
cargo clippy --workspace --all-targets --locked -- -D warnings
```

## Multi-node gate

A green CI build proves only formatting, compilation, unit tests, and linting. It does **not** prove distributed consensus safety or liveness.

Before controlled testnet evaluation, execute the S1-S7 scenarios in `RDL_MULTI_NODE_REALITY_HARNESS.md` with independently running nodes and preserve reproducible logs.

## Honest release rule

- CI failure = **FAIL**
- CI not executed/unknown = **NOT VERIFIED**
- CI green but S1-S7 not executed = **NOT TESTNET READY**
- S1-S7 reproducibly pass + transport/security review = eligible for controlled testnet evaluation

No mainnet readiness claim is authorized by this document.
