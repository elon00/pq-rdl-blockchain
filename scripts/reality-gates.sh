#!/usr/bin/env bash
set -euo pipefail

echo "== RDL Reality Gates =="
cargo fmt --all -- --check
cargo check --workspace --all-targets
cargo test --workspace --all-targets
echo "REALITY_GATES=PASS (local code-quality gates)"
