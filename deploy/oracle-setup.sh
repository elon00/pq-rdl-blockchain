#!/usr/bin/env bash
set -euo pipefail

echo "🏛️ RDL BLOCKCHAIN — ORACLE CLOUD ALWAYS FREE NODE PROVISIONER"
echo "=============================================================="

# 1. Update OS & Install System Prerequisites
echo "\n📦 Step 1: Installing system build dependencies..."
sudo apt-get update -y
sudo apt-get install -y build-essential curl git ufw tar jq openssl pkg-config libssl-dev cmake clang

# 2. Configure Firewall for P2P & RPC
echo "\n🛡️ Step 2: Configuring UFW Firewall for Public Testnet (Port 7101 P2P, Port 7100 RPC)..."
sudo ufw allow 22/tcp
sudo ufw allow 7101/tcp comment 'RDL P2P Node Listening Port'
sudo ufw allow 7100/tcp comment 'RDL Public JSON-RPC Port'
sudo ufw --force enable || true

# Also configure iptables rules for Oracle Linux/Ubuntu Cloud Network
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 7101 -j ACCEPT || true
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 7100 -j ACCEPT || true
sudo netfilter-persistent save 2>/dev/null || true

# 3. Install Rust Toolchain
echo "\n🦀 Step 3: Installing Rust & Cargo Toolchain..."
if ! command -v cargo &> /dev/null; then
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
fi

# 4. Clone or Build RDL Workspace
echo "\n⚙️ Step 4: Compiling RDL Node Daemon in Release Mode..."
cd "$HOME"
if [ ! -d "pq-rdl-blockchain" ]; then
    git clone https://github.com/elon00/pq-rdl-blockchain.git
fi
cd pq-rdl-blockchain
git pull origin master

cargo build --release --workspace

# 5. Create Systemd Service for 24/7 Node Execution
echo "\n🚀 Step 5: Creating rdl-node.service systemd unit..."
sudo bash -c "cat <<EOF > /etc/systemd/system/rdl-node.service
[Unit]
Description=RDL Quantum-Resistant Blockchain Node
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$HOME/pq-rdl-blockchain
ExecStart=$HOME/pq-rdl-blockchain/target/release/rdl-node
Restart=always
RestartSec=5s
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
EOF"

sudo systemctl daemon-reload
sudo systemctl enable rdl-node.service
sudo systemctl restart rdl-node.service

echo "\n=============================================================="
echo "✅ ORACLE NODE SETUP COMPLETE!"
echo "📡 Node Service Status: sudo systemctl status rdl-node"
echo "📜 Live Node Logs: journalctl -u rdl-node -f"
echo "=============================================================="
