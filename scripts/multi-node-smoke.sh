#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BIN="$ROOT/target/debug/rdl-node"
BASE="$(mktemp -d)"
PIDS=()
cleanup(){ for p in "${PIDS[@]:-}"; do kill "$p" 2>/dev/null || true; done; rm -rf "$BASE"; }
trap cleanup EXIT

cargo build -p rdl-node
openssl req -x509 -newkey rsa:2048 -keyout "$BASE/rdl-tls-key.pem" -out "$BASE/rdl-tls-cert.pem" -days 1 -nodes -subj "/CN=rdl-reality-test" >/dev/null 2>&1
for spec in "a:7101" "b:7102" "c:7103"; do
  name="${spec%%:*}"; port="${spec##*:}"
  mkdir -p "$BASE/$name"
  (cd "$BASE/$name"; mkdir -p data; cp "$BASE/rdl-tls-cert.pem" data/rdl-tls-cert.pem; cp "$BASE/rdl-tls-key.pem" data/rdl-tls-key.pem; "$BIN" >/dev/null; exec "$BIN" --listen "127.0.0.1:$port") &
  PIDS+=($!)
done
sleep 1
for port in 7101 7102 7103; do
  [ "$(cd "$BASE/a"; "$BIN" --ping "127.0.0.1:$port")" = "PONG" ]
done
echo "MULTI_NODE_SMOKE=PASS"
