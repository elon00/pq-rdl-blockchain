#!/usr/bin/env bash
set -euo pipefail

echo "RDL operational devnet network smoke"
docker compose config >/dev/null
docker compose up --build -d
cleanup() { docker compose down -v >/dev/null 2>&1 || true; }
trap cleanup EXIT

sleep 5
docker compose ps
for i in 1 2 3; do docker compose logs --no-color rdl-node-$i || true; done

for i in 1 2 3; do
  docker compose exec -T rdl-node-$i sh -c "command -v rdl-node >/dev/null"
done

docker compose exec -T rdl-node-1 rdl-node --ping rdl-node-2:7000 | grep -q PONG
docker compose exec -T rdl-node-2 rdl-node --ping rdl-node-3:7000 | grep -q PONG
docker compose exec -T rdl-node-3 rdl-node --ping rdl-node-1:7000 | grep -q PONG

echo "LISTENER_REACHABILITY=PASS"
echo "THREE_NODE_PING_RING=PASS"
