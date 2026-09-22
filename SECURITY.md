# Security Policy

## Project status

PQ-RDL is currently an operational-devnet/prototype blockchain implementation. CI, local/devnet evidence, and repository-defined gates are engineering evidence; they are not an independent security audit, public-mainnet certification, or guarantee of production security.

## Reporting a vulnerability

Do not disclose exploitable vulnerabilities, private keys, validator/operator credentials, seed material, API tokens, consensus attacks, or proof-of-concept exploits in a public issue.

Use GitHub private vulnerability reporting / a Security Advisory for this repository when available. Please include:

- affected commit, component, and file
- reproduction steps or a minimal proof of concept
- realistic attack preconditions
- expected impact on consensus, funds/accounting, node availability, privacy, or operator infrastructure
- whether keys, credentials, or user/operator data may be exposed
- suggested mitigation, if known

## High-priority security areas

Reports are especially important for:

- consensus safety/liveness and HotStuff/BFT behavior
- signature, ML-DSA/PQC, key-handling, and verification failures
- token/accounting or faucet conservation bugs
- replay, equivocation, timeout-certificate, or peer-validation flaws
- remote-code execution, command injection, SSRF, path traversal, or unsafe deserialization
- node/operator outreach authentication, consent, opt-out, or PII handling
- secret exposure in source, logs, Actions artifacts, images, or Git history
- denial-of-service or unbounded resource-consumption paths

## Credential and key rules

- Never commit validator keys, seed phrases, private keys, API tokens, operator PII, or production secrets.
- Use dedicated keys per environment and keep devnet/testnet/mainnet material separated.
- Rotate any credential immediately if it appears in Git history, logs, screenshots, or CI artifacts.
- Treat example keys and local test material as non-production only.

## Production boundary

Before any public-mainnet or production deployment, the project should undergo deployment-specific threat modeling, independent security review, operational monitoring, incident response planning, backup/recovery testing, key-rotation procedures, release controls, and applicable legal/compliance review.

A green CI run demonstrates only the checks encoded by that CI run.
