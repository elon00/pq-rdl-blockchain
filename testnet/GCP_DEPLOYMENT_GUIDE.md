# 🌐 Google Cloud Platform (GCP) Free Tier: RDL Node Deployment Guide

Yes! You can run an RDL Blockchain Validator / RPC Node **100% Free** on Google Cloud Platform (GCP) Compute Engine.

---

## 🎁 Google Cloud Free Tier Benefits:
- **Free VM:** `e2-micro` (2 vCPUs, 1 GB RAM) — **Always Free (1 per month)**.
- **Free Storage:** 30 GB Standard Persistent Disk (Always Free).
- **Free Region Selection:** `us-central1` (Iowa), `us-east1` (South Carolina), or `us-west1` (Oregon).
- **Web SSH:** Direct browser-based SSH terminal (no Putty or SSH keys required to setup!).

---

## 🚀 Step-by-Step VM Creation Guide:

1. Open **[Google Cloud Console](https://console.cloud.google.com/)**.
2. From the Left Menu, navigate to: **Compute Engine** → **VM instances**.
3. Click **"Create Instance"**.
4. Configure the instance settings:
   - **Name:** `rdl-validator-node-1`
   - **Region:** `us-central1 (Iowa)` or `us-east1 (South Carolina)` *(Free Tier Eligible)*.
   - **Machine Configuration:**
     - Series: **E2**
     - Machine Type: **`e2-micro` (2 vCPU, 1 GB memory)** *(Always Free)*.
   - **Boot Disk:**
     - Operating System: **Ubuntu**
     - Version: **Ubuntu 22.04 LTS** or **Ubuntu 24.04 LTS**
     - Size: **30 GB** (Standard Persistent Disk).
   - **Firewall:**
     - Check: **Allow HTTP traffic**
     - Check: **Allow HTTPS traffic**
5. Click **"Create"**.

---

## 🛡️ VPC Firewall Port Configuration (Port 7101 & 7100):

To allow external blockchain peers to connect:
1. In GCP Console, search for **"Firewall"** (VPC network → Firewall).
2. Click **"Create Firewall Rule"**:
   - **Name:** `allow-rdl-ports`
   - **Targets:** `All instances in the network`
   - **Source IPv4 ranges:** `0.0.0.0/0`
   - **Protocols and ports:**
     - Check **TCP**: enter `7101, 7100`
3. Click **Create**.

---

## ⚡ 1-Click Installation Command:

1. On your VM instances list, click the **SSH** button next to your VM.
2. In the black terminal window that opens, paste this **single command** and press Enter:

```bash
curl -sSL https://raw.githubusercontent.com/elon00/pq-rdl-blockchain/master/deploy/gcp-setup.sh | bash
```

The script will:
- Set up 2GB Swap Memory for high performance.
- Install Rust, OpenSSL, CMake, and dependencies.
- Compile the RDL node in release mode.
- Start `rdl-node.service` running **24/7 in the background**.

---

## 📜 Useful Node Management Commands:
- **Check Live Node Status:** `sudo systemctl status rdl-node`
- **View Live Logs in Real Time:** `journalctl -u rdl-node -f`
- **Restart Node:** `sudo systemctl restart rdl-node`
