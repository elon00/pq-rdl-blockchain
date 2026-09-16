# 🏛️ PQ-RDL Blockchain — Cloud Nodes & Telegram Controller Runbook
# (Google Cloud, GitHub Actions, Codespaces, and Telegram Cloud)

This guide provides step-by-step instructions for running post-quantum blockchain nodes, validator clusters, and remote controllers across **Google Cloud (GCP)**, **GitHub Cloud Runners**, and **Telegram Cloud**.

---

## 🧭 Overview of Cloud Node Options

| Cloud Provider | Type | Cost / Plan | Key Feature |
|---|---|---|---|
| **Google Cloud (Cloud Shell)** | Ephemeral Container | **100% Free** (No Credit Card) | 1-Click Launch with Cloudflare Edge Tunnel |
| **Google Cloud (Compute Engine)** | Dedicated VM (`e2-micro`) | **Always-Free Tier** | 24/7 background `systemd` node service |
| **GitHub Actions** | Automated CI/CD Runner | **Free Plan Included** | Scheduled consensus rounds & state snapshots |
| **GitHub Codespaces** | Cloud Dev Environment | **60 hrs/mo Free** | 1-Click interactive browser validator |
| **Telegram Cloud** | Bot API Controller | **100% Free** | Faucet dispensing, mining & balance queries via Telegram |
| **Docker Compose** | Multi-Container Cluster | Local / Any Cloud VPS | 3-Node HotStuff BFT + RPC + Telegram Bot |

---

## 1. ☁️ Google Cloud Platform (GCP) Node Deployment

### Option A: 1-Click Google Cloud Shell (Zero Billing / 100% Free)
Google Cloud Shell provides a free Debian Linux container with persistent storage:

1. Open **[Google Cloud Shell](https://shell.cloud.google.com/)** in your browser.
2. Run the 1-click launcher script:
   ```bash
   git clone https://github.com/elon00/pq-rdl-blockchain.git
   cd pq-rdl-blockchain
   ./deploy/cloudshell-direct-node.sh
   ```
3. The script compiles the Rust node, boots the RPC gateway, and provides a public Cloudflare tunnel URL to access your node from anywhere.

### Option B: Terraform Deployment on Always-Free `e2-micro` VM
1. Ensure `gcloud` and `terraform` are installed.
2. Navigate to `deploy/terraform/`:
   ```bash
   cd deploy/terraform
   terraform init
   terraform apply -var="project_id=YOUR_GCP_PROJECT_ID"
   ```
3. Terraform will provision:
   - VPC Network & Firewall (ports 22, 3000, 7000, 7100).
   - `e2-micro` instance in `us-central1`.
   - Automatic 2GB swap space for low-RAM stability.
   - `systemd` services for automatic 24/7 restart.

---

## 2. 🐙 GitHub Cloud Nodes (Actions & Codespaces)

### Option A: Automated Scheduled Consensus via GitHub Actions
- The repository includes `.github/workflows/testnet-node.yml`.
- Runs on GitHub's cloud runners (`ubuntu-latest`).
- **Trigger**:
  - Automatically runs every 6 hours (`cron: '0 */6 * * *'`).
  - Manually on-demand: Go to **Actions** -> **PQ-RDL Cloud Testnet Node Runner** -> Click **Run workflow**.
- **Outputs**:
  - Compiles native Rust consensus node (`crates/rdl-node`).
  - Executes HotStuff BFT safety locks and transaction tests.
  - Generates verifiable testnet state artifact: `cloud-node-telemetry.json`.

### Option B: 1-Click GitHub Codespaces Validator
1. Go to repository: [https://github.com/elon00/pq-rdl-blockchain](https://github.com/elon00/pq-rdl-blockchain)
2. Click **Code** -> **Codespaces** -> **Create codespace on master**.
3. Codespaces automatically builds the workspace using `.devcontainer/devcontainer.json` and forwards port 3000.
4. Run `./scripts/run-cloud-testnet.sh` in the Codespaces terminal to start the full testnet.

---

## 3. 🤖 Telegram Cloud Node & Faucet Bot

The Telegram bot connects directly to Telegram Cloud via the Telegram Bot API and allows remote node administration and faucet claims from your phone or desktop.

### Step 1: Create a Bot on Telegram
1. Open Telegram and search for **`@BotFather`**.
2. Send `/newbot`.
3. Choose a name (e.g. `PQ-RDL Testnet Bot`) and username (e.g. `PqRdlNodeBot`).
4. `@BotFather` will give you an API Token (e.g. `7123456789:AAH...`).

### Step 2: Configure & Run the Bot
Add the token to your `.env` file or export it:
```bash
export TELEGRAM_BOT_TOKEN="YOUR_BOT_FATHER_API_TOKEN"
npm run telegram:bot
```
*(If no token is provided, the bot runs in automated MOCK mode for local testing).*

### Step 3: Available Telegram Bot Commands
- `/start` or `/help` — View the command list and testnet status.
- `/status` — Live telemetry (consensus round, active tokens, faucet treasury).
- `/faucet <rdl_address>` — **Claim 50 RDL + 1,000 rUSD + 10,000,000 RLD** with post-quantum receipt.
- `/balance <rdl_address>` — Check wallet balances across native RDL, rUSD stablecoin, and RLD meme coin.
- `/mine` — Mine a Conway Cellular Automaton block signed with ML-DSA-65 post-quantum signature.
- `/latest_block` — View latest mined block height, hash, and NIST PQC signatures.
- `/tokens` — List all registered L1 tokens, stablecoins, and meme coins.

---

## 4. 🐳 Docker Compose Multi-Node Testnet Cluster

To run a full local or cloud VPS 3-node BFT cluster:

```bash
# Launch 3 BFT Validators + Web RPC Gateway + Telegram Bot
npm run testnet:cluster

# Check cluster status
docker compose -f docker-compose.testnet.yml ps

# View live cluster logs
docker compose -f docker-compose.testnet.yml logs -f

# Stop cluster
npm run testnet:cluster:down
```

### Cluster Architecture:
- `rdl-validator-1` (`0.0.0.0:7001`) — HotStuff BFT Bootstrap Node.
- `rdl-validator-2` (`0.0.0.0:7002`) — HotStuff BFT Validator Peer.
- `rdl-validator-3` (`0.0.0.0:7003`) — HotStuff BFT Validator Peer.
- `rdl-rpc-server` (`0.0.0.0:3000`) — Web Explorer, AMM Swap DEX & JSON-RPC Gateway.
- `rdl-telegram-bot` — Telegram Cloud Bot Controller.

---

## 5. 🧪 Verification & Health Check

Run the automated test suite to ensure all cloud node components are operational:

```bash
# 1. Test Telegram Cloud Bot
npm run test:telegram

# 2. Test Rust Consensus Nodes
npm run test:cargo

# 3. Test NIST PQC Vectors (FIPS 203/204)
npm run test:nist

# 4. Standalone Cryptographic Auditor
npm run audit:crypto

# 5. Full Universal Reality Check (10/10 Law)
npm run reality:universal
```
