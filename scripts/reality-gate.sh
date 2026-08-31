#!/usr/bin/env bash
set -euo pipefail

echo "[RDL] Reality Gate: format"
cargo fmt --all -- --check
echo "[RDL] Reality Gate: compile"
cargo check --workspace --all-targets
echo "[RDL] Reality Gate: tests"
cargo test --workspace --all-targets
echo "[RDL] Reality Gate: lint"
cargo clippy --workspace --all-targets -- -D warnings
echo "[RDL] PASS: local quality gate completed"
