#!/usr/bin/env bash
set -euo pipefail

echo "🏛️ RDL BLOCKCHAIN — GOOGLE CLOUD SHELL 1-CLICK API DEPLOYER"
echo "=============================================================="

# 1. Auto-Detect or Auto-Select Active Project
PROJECT_ID=$(gcloud config get-value project 2>/dev/null || true)

if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "(unset)" ]; then
    echo "🔍 Auto-detecting available Google Cloud projects..."
    PROJECT_ID=$(gcloud projects list --format="value(projectId)" --limit=1 2>/dev/null || true)
    
    if [ -n "$PROJECT_ID" ]; then
        echo "✅ Found project: $PROJECT_ID. Setting as active..."
        gcloud config set project "$PROJECT_ID" --quiet
    else
        echo "⚠️ No Google Cloud project found. Creating a new project 'rdl-blockchain-net'..."
        RANDOM_ID=$((RANDOM % 90000 + 10000))
        PROJECT_ID="rdl-net-$RANDOM_ID"
        gcloud projects create "$PROJECT_ID" --name="RDL Blockchain" --quiet || true
        gcloud config set project "$PROJECT_ID" --quiet
    fi
fi

echo "📍 Active Google Cloud Project: $PROJECT_ID"

# 2. Enable Compute Engine API
echo -e "\n🔌 Step 1: Enabling Google Compute Engine API (this may take ~10-20 seconds)..."
gcloud services enable compute.googleapis.com --quiet

# 3. Create Firewall Rules for Port 7101 (P2P) & Port 7100 (RPC)
echo -e "\n🛡️ Step 2: Configuring Firewall Rules for P2P (7101) & RPC (7100)..."
if ! gcloud compute firewall-rules describe allow-rdl-network &>/dev/null; then
    gcloud compute firewall-rules create allow-rdl-network \
        --direction=INGRESS \
        --priority=1000 \
        --network=default \
        --action=ALLOW \
        --rules=tcp:7101,tcp:7100 \
        --source-ranges=0.0.0.0/0 \
        --target-tags=rdl-node \
        --quiet
    echo "Firewall rule created."
else
    echo "Firewall rule 'allow-rdl-network' already exists."
fi

# 4. Create Always Free e2-micro VM Instance with Automatic Startup Script
INSTANCE_NAME="rdl-validator-node-1"
ZONE="us-central1-a"

echo -e "\n🚀 Step 3: Launching Always Free e2-micro VM ($INSTANCE_NAME in $ZONE)..."
if ! gcloud compute instances describe "$INSTANCE_NAME" --zone="$ZONE" &>/dev/null; then
    gcloud compute instances create "$INSTANCE_NAME" \
        --zone="$ZONE" \
        --machine-type=e2-micro \
        --image-family=ubuntu-2204-lts \
        --image-project=ubuntu-os-cloud \
        --boot-disk-size=30GB \
        --boot-disk-type=pd-standard \
        --tags=rdl-node,http-server,https-server \
        --metadata=startup-script='#!/usr/bin/env bash
curl -sSL https://raw.githubusercontent.com/elon00/pq-rdl-blockchain/master/deploy/gcp-setup.sh | bash
' \
        --quiet
    echo "VM instance successfully created!"
else
    echo "VM instance '$INSTANCE_NAME' is already running."
fi

# 5. Fetch External Public IP Address
EXTERNAL_IP=$(gcloud compute instances describe "$INSTANCE_NAME" --zone="$ZONE" --format="get(networkInterfaces[0].accessConfigs[0].natIP)")

echo -e "\n=============================================================="
echo "🎉 DEPLOYMENT SUCCESSFUL VIA GOOGLE CLOUD API!"
echo "🌐 Real Public IP Address: $EXTERNAL_IP"
echo "📡 P2P Consensus Port:     $EXTERNAL_IP:7101"
echo "🔗 Public RPC Endpoint:    http://$EXTERNAL_IP:7100"
echo "=============================================================="
echo "👉 Is External IP ko copy karke chat me bhej dein!"