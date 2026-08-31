# QMoosa Master Project Finisher — RDL Adapter

This repository uses the unified QMoosa Master Operating System pipeline:

`DISCOVER → CLASSIFY → AUDIT → FIX → TEST → VERIFY → DEPLOY → REPORT`

## Reality Mode

- Simulations, mock output, dry-runs, local-only chain state and plans are `UNVERIFIED`.
- A `VERIFIED PASS` requires machine-verifiable evidence for the applicable stage.
- Missing deployment, contract, network, cryptography, security, or legal evidence must remain `NOT VERIFIED`.
- Secrets must never be committed.

## Project adapters

- Blockchain: inspect chain implementation and deployment evidence.
- Conway automaton: inspect executable automation modules and tests.
- Web4: inspect actual runtime/integration evidence, not labels alone.
- PQC: distinguish research interfaces from verified cryptographic implementations.
- AI agentic chatbot: verify provider configuration, runtime path and tests.
- Token launchpad: verify real contracts, deployment addresses, transaction evidence and controls before PASS.
- Testnet/Mainnet: verify network identity, deployed artifacts and externally reproducible transactions before PASS.
- Laws/securities: report only documented legal/compliance evidence; never infer certification from code.

The finisher may repair code and configuration, but it must not manufacture evidence or convert simulations into claims of real deployment.
