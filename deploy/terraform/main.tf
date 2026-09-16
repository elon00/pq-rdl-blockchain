terraform {
  required_version = ">= 1.3.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

# 1. Custom VPC Network
resource "google_compute_network" "rdl_vpc" {
  name                    = "rdl-testnet-vpc"
  auto_create_subnetworks = true
}

# 2. Firewall Rules for P2P, RPC, Web UI & SSH
resource "google_compute_firewall" "rdl_firewall" {
  name    = "rdl-testnet-firewall"
  network = google_compute_network.rdl_vpc.name

  allow {
    protocol = "tcp"
    ports    = ["22", "3000", "7000", "7001", "7100"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["rdl-blockchain-node"]
}

# 3. Always-Free Tier Compute Engine Instance (e2-micro)
resource "google_compute_instance" "rdl_node" {
  name         = var.instance_name
  machine_type = "e2-micro"
  zone         = var.zone

  tags = ["rdl-blockchain-node"]

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
      size  = 30 # 30GB disk included in GCP Always Free Tier
      type  = "pd-standard"
    }
  }

  network_interface {
    network = google_compute_network.rdl_vpc.name
    access_config {
      // Ephemeral public IP
    }
  }

  metadata_startup_script = <<-EOF
    #!/bin/bash
    set -euo pipefail

    echo "🏛️ Initializing PQ-RDL Cloud Testnet Node..."

    # 1. Create 2GB swap file for building on 1GB RAM
    if [ ! -f /swapfile ]; then
      fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
      chmod 600 /swapfile
      mkswap /swapfile
      swapon /swapfile
      echo '/swapfile none swap sw 0 0' >> /etc/fstab
    fi

    # 2. Install dependencies
    apt-get update -y
    apt-get install -y build-essential curl git tar jq openssl pkg-config libssl-dev cmake clang

    # 3. Install Node.js 22
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y nodejs

    # 4. Install Rust Toolchain
    if ! command -v cargo &> /dev/null; then
      curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
      export PATH="$HOME/.cargo/bin:$PATH"
    fi

    # 5. Clone repository
    cd /opt
    if [ ! -d "pq-rdl-blockchain" ]; then
      git clone https://github.com/elon00/pq-rdl-blockchain.git
    fi
    cd pq-rdl-blockchain
    git pull origin master

    # 6. Build Rust Node and Node packages
    export PATH="/root/.cargo/bin:$PATH"
    cargo build --release --workspace
    npm ci
    npm run build

    # 7. Configure Systemd Service
    cat <<SERVICE > /etc/systemd/system/rdl-node.service
    [Unit]
    Description=PQ-RDL Post-Quantum Blockchain Node (GCP)
    After=network.target

    [Service]
    Type=simple
    User=root
    WorkingDirectory=/opt/pq-rdl-blockchain
    ExecStart=/opt/pq-rdl-blockchain/target/release/rdl-node --listen 0.0.0.0:7000
    Restart=always
    RestartSec=5s
    LimitNOFILE=65535

    [Install]
    WantedBy=multi-user.target
    SERVICE

    systemctl daemon-reload
    systemctl enable rdl-node.service
    systemctl restart rdl-node.service

    # 8. Start Web Gateway & Telegram Cloud Bot
    cat <<BOT_SERVICE > /etc/systemd/system/rdl-gateway.service
    [Unit]
    Description=PQ-RDL Web Gateway & RPC Server
    After=network.target

    [Service]
    Type=simple
    User=root
    WorkingDirectory=/opt/pq-rdl-blockchain
    ExecStart=/usr/bin/node dist/server.cjs
    Restart=always
    RestartSec=5s

    [Install]
    WantedBy=multi-user.target
    BOT_SERVICE

    systemctl daemon-reload
    systemctl enable rdl-gateway.service
    systemctl restart rdl-gateway.service

    echo "✅ PQ-RDL Google Cloud Node is active and running!"
  EOF

  lifecycle {
    create_before_destroy = true
  }
}
