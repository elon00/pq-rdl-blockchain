# Security Policy

## Project status

PQ-RDL is a research/prototype project. There is currently **no production or Mainnet release with a security-support guarantee**. The default branch receives security fixes as issues are validated.

Cryptographic conformance tests and CI checks are not substitutes for an independent security audit, protocol review, or deployment assessment.

## Reporting a vulnerability

Please avoid publishing exploitable details in a public issue.

Preferred reporting path:

1. Use GitHub's private vulnerability reporting / Security Advisory flow for this repository when it is available.
2. If private reporting is unavailable, open a public issue containing **no sensitive exploit details** and ask the maintainer for a private reporting channel.

Include, when possible:

- affected commit or release;
- affected component and configuration;
- reproducible steps;
- security impact;
- proof-of-concept material that is safe to share privately;
- suggested mitigation, if known.

Do not include real private keys, access tokens, operator PII, or third-party secrets.

## Response and disclosure

Reports are triaged according to reproducibility and impact. A validated issue should be remediated and retested before public technical details are disclosed. Coordinated disclosure timing may vary with severity and the availability of a safe fix.

## Security boundaries

Until explicitly backed by independent evidence, do not interpret repository CI as proof of:

- a secure public Testnet or Mainnet;
- encrypted peer transport;
- production-grade key custody;
- resistance to all classical or quantum attacks;
- an independent security audit;
- legal or regulatory compliance.

See `TESTNET_MAINNET_READINESS.md` and `MAINNET_LAUNCH_BOUNDARY.md` for promotion requirements.
