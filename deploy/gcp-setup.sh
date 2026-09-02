#!/usr/bin/env bash
set -euo pipefail

echo "🏛️ RDL BLOCKCHAIN — GOOGLE CLOUD (GCP) FREE TIER NODE PROVISIONER"
echo "=================================================================="

# 1. Setup 2GB Swap Memory (Crucial for 1GB e2-micro VMs)
echo "\n🧠 Step 1: Configuring 2GB Swap Space for optimal memory stability..."
if [ ! -f /swapfile ]; then
    sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "Swap enabled successfully."
fi

# 2. Update OS & Install Build Dependencies
echo "\n📦 Step 2: Installing system dependencies..."
sudo apt-get update -y
sudo apt-get install -y build-essential curl git ufw tar jq openssl pkg-config libssl-dev cmake clang

# 3. Configure Firewall Ports (Port 7101 P2P, Port 7100 RPC)
echo "\n🛡️ Step 3: Configuring Firewall Ports (7101 P2P, 7100 RPC)..."
sudo ufw allow 22/tcp || true
sudo ufw allow 7101/tcp comment 'RDL P2P Node Listening Port' || true
sudo ufw allow 7100/tcp comment 'RDL Public JSON-RPC Port' || true
sudo ufw --force enable || true

# 4. Install Rust Toolchain
echo "\n🦀 Step 4: Installing Rust Toolchain..."
if ! command -v cargo &> /dev/null; then
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
fi

# 5. Clone and Build RDL Node
echo "\n⚙️ Step 5: Compiling RDL Blockchain Node..."
cd "$HOME"
if [ ! -d "pq-rdl-blockchain" ]; then
    git clone https://github.com/elon00/pq-rdl-blockchain.git
fi
cd pq-rdl-blockchain
git pull origin master

cargo build --release --workspace

# 6. Setup 24/7 Systemd Service
echo "\n🚀 Step 6: Creating 24/7 Background Systemd Service..."
sudo bash -c "cat <<EOF > /etc/systemd/system/rdl-node.service
[Unit]
Description=RDL Quantum-Resistant Blockchain Node (GCP Instance)
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

echo "\n=================================================================="
echo "🎉 GOOGLE CLOUD NODE IS LIVE AND RUNNING 24/7!"
echo "📡 Check Status: sudo systemctl status rdl-node"
echo "📜 Live Logs:    journalctl -u rdl-node -f"
echo "=================================================================="
