# Contributing to PQ-RDL

PQ-RDL is a research/prototype blockchain project. Contributions are welcome when they are reproducible, security-conscious, and precise about what the evidence proves.

## Before opening a pull request

```bash
npm ci
npm test
cargo fmt --all -- --check
cargo clippy --workspace --all-targets -- -D warnings
```

Run any component-specific workflow/tests affected by your change.

## Contribution rules

- Do not commit private keys, seed phrases, API tokens, validator credentials, operator PII, or production secrets.
- Preserve fail-closed behavior in security-sensitive paths.
- Add regression tests for bug fixes and adversarial tests for security changes.
- Keep token/accounting and consensus invariants explicit.
- Do not label simulations, local runs, CI results, or generated IDs as public-network evidence.
- Do not claim public-mainnet, independent audit, FIPS validation, performance, adoption, or compliance without supporting evidence.
- Keep node-operator outreach consent-aware and opt-out safe.
- Explain breaking changes and migration impact in the PR.

## Pull requests

Keep changes focused. Include:

1. problem and intended behavior
2. implementation summary
3. tests/commands run
4. security and compatibility impact
5. evidence for any changed public claim

Security vulnerabilities should be reported privately according to `SECURITY.md`, not through a public issue or PR.
