param (
    [string]$Mode = "local"
)

Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host "🏛️ PQ-RDL WEB4 BLOCKCHAIN — CLOUD TESTNET BOOTSTRAPPER (WINDOWS)" -ForegroundColor Cyan
Write-Host "==========================================================================" -ForegroundColor Cyan

if ($Mode -eq "docker") {
    Write-Host "🐳 Launching 3-Node BFT Testnet Cluster via Docker Compose..." -ForegroundColor Green
    docker compose -f docker-compose.testnet.yml up -d
    Write-Host "✅ Cluster launched! Check status: docker compose -f docker-compose.testnet.yml ps" -ForegroundColor Green
    Write-Host "🌐 Web UI / Explorer: http://localhost:3000" -ForegroundColor Yellow
    exit 0
}

Write-Host "📦 Step 1: Checking Node.js and Rust..." -ForegroundColor White
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js is not found on PATH."
    exit 1
}

if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) {
    Write-Error "Cargo / Rust is not found on PATH."
    exit 1
}

Write-Host "⚙️ Step 2: Compiling Rust Node..." -ForegroundColor White
cargo build --release --workspace

Write-Host "📦 Step 3: Building Web & RPC Server..." -ForegroundColor White
npm run build

Write-Host "🤖 Step 4: Testing Telegram Cloud Bot Controller..." -ForegroundColor White
npx tsx services/telegram-bot/bot.ts --test

Write-Host "🚀 Step 5: Launching PQ-RDL Testnet Gateway..." -ForegroundColor Green
Write-Host "--------------------------------------------------------------------------"
Write-Host "🌐 Web Explorer & JSON-RPC Gateway: http://localhost:3000" -ForegroundColor Yellow
Write-Host "💧 Faucet & AMM Swap:               http://localhost:3000" -ForegroundColor Yellow
Write-Host "--------------------------------------------------------------------------"

node dist/server.cjs
