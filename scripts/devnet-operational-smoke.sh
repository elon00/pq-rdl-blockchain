#!/usr/bin/env bash
set -euo pipefail

echo "RDL operational devnet smoke"
docker compose config >/dev/null

docker compose up --build -d
cleanup() { docker compose down -v >/dev/null 2>&1 || true; }
trap cleanup EXIT

sleep 5
docker compose ps

# A node must expose a reachable listener before this stage can be promoted.
for i in 1 2 3; do
  if ! docker compose exec -T rdl-node-$i test -f /app/target/release/rdl-node; then
    echo "missing node binary on rdl-node-$i" >&2
    exit 1
  fi
done

echo "CONFIG_AND_RUNTIME_CONTAINER_SMOKE=PASS"
echo "NETWORK_PROTOCOL_EVIDENCE=BLOCKED until listener/P2P runtime is explicitly started and verified"
