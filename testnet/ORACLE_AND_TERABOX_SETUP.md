# 🏛️ RDL Blockchain: Oracle Cloud (Compute) + TeraBox (Storage) Architecture

This guide details the hybrid production infrastructure combining:
1. **Oracle Cloud Always Free Tier** → 24/7 Compute, P2P Consensus Node, Public JSON-RPC.
2. **TeraBox (1024 GB Free Cloud)** → Cold Storage for blockchain database snapshots, logs, and release archives.

---

## 🌐 1. Oracle Cloud Always Free Setup

### 🔗 Official Direct Links:
- **Sign-up (Free Tier):** [https://www.oracle.com/cloud/free/](https://www.oracle.com/cloud/free/)
- **Cloud Console Login:** [https://cloud.oracle.com/](https://cloud.oracle.com/)

### 💳 Solving the "ATM / Debit Card Declined" Issue:
Oracle requires a temporary $1.00 / ₹100 authorization charge (refunded instantly) to prevent bot accounts.
To ensure your card is accepted:
1. **Card Type:** Use a physical **Visa** or **Mastercard** International Debit/Credit Card (SBI, HDFC, ICICI, Axis, Kotak, Bank of Baroda). *RuPay or virtual cards (Paytm/Airtel) are not supported by Oracle.*
2. **Enable International Usage:** Open your banking app (e.g. YONO SBI, HDFC MobileBanking, iMobile) → Manage Cards → **Enable International Usage** + **Enable Online/E-commerce Transactions**.
3. **Billing Address Match:** Ensure the Name and Address entered in Oracle match the bank statement.

### 🖥️ Free Tier Recommended Instance Spec:
- **Shape:** `VM.Standard.A1.Flex` (Ampere ARM - 4 OCPU, 24 GB RAM) OR `VM.Standard.E2.1.Micro` (AMD - 1 OCPU, 1 GB RAM).
- **OS:** Ubuntu 22.04 LTS / 24.04 LTS.
- **Boot Volume:** 50 GB to 200 GB NVMe SSD.

### 🚀 1-Command Oracle Node Deployment:
Once connected via SSH to your Oracle instance (`ssh ubuntu@<YOUR_ORACLE_IP>`), run:
```bash
curl -sSL https://raw.githubusercontent.com/elon00/pq-rdl-blockchain/master/deploy/oracle-setup.sh | bash
```

---

## 📦 2. TeraBox (1024 GB) Cold Storage Integration

### 🔗 Official Direct Link:
- **TeraBox Cloud Drive:** [https://dm.1024terabox.com/main?category=all](https://dm.1024terabox.com/main?category=all)

### 📸 Creating & Archiving Blockchain Snapshots:
Run the snapshot archiver locally or on the Oracle server:
```bash
node scripts/backup-snapshots.mjs
```

This generates:
- `snapshots/rdl-state-snapshot-<TIMESTAMP>.tar.gz` (Encrypted state & DB package)
- `snapshots/rdl-state-snapshot-<TIMESTAMP>.meta.json` (SHA-256 integrity manifest)

### 📤 Upload to TeraBox:
1. Open [TeraBox Web](https://dm.1024terabox.com/main?category=all).
2. Create a folder named **`RDL-Blockchain-Backups`**.
3. Drag & drop the `.tar.gz` archive and `.meta.json` file.
