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
  docker compose exec -T rdl-node-$i test -f /app/target/release/rdl-node
done

docker compose exec -T rdl-node-1 ./target/release/rdl-node --ping rdl-node-2:7002 | grep -q PONG
docker compose exec -T rdl-node-2 ./target/release/rdl-node --ping rdl-node-3:7003 | grep -q PONG
docker compose exec -T rdl-node-3 ./target/release/rdl-node --ping rdl-node-1:7001 | grep -q PONG

echo "LISTENER_REACHABILITY=PASS"
echo "THREE_NODE_PING_RING=PASS"
