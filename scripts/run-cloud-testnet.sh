#!/usr/bin/env bash
set -euo pipefail

echo "=========================================================================="
echo "🏛️ PQ-RDL WEB4 BLOCKCHAIN — CLOUD TESTNET BOOTSTRAPPER"
echo "=========================================================================="

MODE="${1:-local}"

if [ "$MODE" = "docker" ]; then
    echo "🐳 Launching 3-Node BFT Testnet Cluster via Docker Compose..."
    if command -v docker-compose &>/dev/null; then
        docker-compose -f docker-compose.testnet.yml up -d
    else
        docker compose -f docker-compose.testnet.yml up -d
    fi
    echo "✅ Cluster launched! Check status: docker compose -f docker-compose.testnet.yml ps"
    echo "🌐 Web UI / Explorer: http://localhost:3000"
    exit 0
fi

echo "📦 Step 1: Checking system dependencies..."
if ! command -v node &>/dev/null; then
    echo "❌ Node.js is required (v20+)."
    exit 1
fi

if ! command -v cargo &>/dev/null; then
    echo "❌ Rust / Cargo is required."
    exit 1
fi

echo "⚙️ Step 2: Compiling Rust Node..."
cargo build --release --workspace

echo "📦 Step 3: Installing Web & RPC dependencies..."
npm ci
npm run build

echo "🤖 Step 4: Starting Telegram Bot self-test..."
npx tsx services/telegram-bot/bot.ts --test

echo "🚀 Step 5: Launching PQ-RDL Testnet Node & RPC Server..."
echo "--------------------------------------------------------------------------"
echo "📡 HotStuff BFT Node listening on: 0.0.0.0:7000"
echo "🌐 Web Explorer & JSON-RPC Gateway: http://0.0.0.0:3000"
echo "💧 Faucet & AMM Swap:               http://localhost:3000"
echo "--------------------------------------------------------------------------"

node dist/server.cjs
