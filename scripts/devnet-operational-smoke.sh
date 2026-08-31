#!/usr/bin/env bash
set -euo pipefail
echo "RDL Devnet operational smoke"
docker compose config >/dev/null
echo "PASS: compose configuration is valid"
