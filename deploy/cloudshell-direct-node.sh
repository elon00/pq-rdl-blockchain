#!/usr/bin/env bash
set -euo pipefail

echo "🏛️ RDL BLOCKCHAIN — DIRECT GOOGLE CLOUD SHELL PUBLIC NODE"
echo "⚡ ZERO BILLING / ZERO CREDIT CARD REQUIRED (RUNS DIRECTLY IN CLOUDSHELL)"
echo "=========================================================================="

cd "$HOME"

# 1. Install Rust if missing
if ! command -v cargo &> /dev/null; then
    echo "\n🦀 Step 1: Installing Rust toolchain in Cloud Shell..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
else
    source "$HOME/.cargo/env" 2>/dev/null || true
fi

# 2. Clone or Update Repository
echo "\n📦 Step 2: Cloning/Updating RDL Blockchain Repository..."
if [ ! -d "pq-rdl-blockchain" ]; then
    git clone https://github.com/elon00/pq-rdl-blockchain.git
fi
cd pq-rdl-blockchain
git pull origin master || true

# 3. Build Node in Release Mode
echo "\n⚙️ Step 3: Compiling RDL Blockchain Node (Rust Release Mode)..."
cargo build --release --workspace

# 4. Download cloudflared for Linux x86_64
echo "\n🌐 Step 4: Setting up Cloudflare Public Edge Gateway..."
mkdir -p target/tools
if [ ! -f target/tools/cloudflared ]; then
    curl -sSL -o target/tools/cloudflared https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
    chmod +x target/tools/cloudflared
fi

# 5. Build UI & Server Bundle
echo "\n📦 Step 5: Preparing Explorer & RPC Server..."
npm install || true
npm run build || true

# 6. Launch Node & RPC in Background
echo "\n🚀 Step 6: Starting RDL Node Daemon..."
nohup ./target/release/rdl-node > node.log 2>&1 &
NODE_PID=$!
echo "Node process started (PID: $NODE_PID)"

nohup node dist/server.cjs > rpc.log 2>&1 &
RPC_PID=$!
echo "RPC Server started (PID: $RPC_PID)"

# 7. Start Cloudflare Tunnel to expose RPC to the world
echo "\n📡 Step 7: Connecting Node to the Global Internet via Cloudflare Edge..."
./target/tools/cloudflared tunnel --url http://127.0.0.1:3000