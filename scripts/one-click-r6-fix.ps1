# 🧙 1-CLICK AUTOMATIC R6 & GH006 FIX SCRIPT
# This script commits and pushes the fail-closed, PR-safe R6 workflow to GitHub.

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "🚀 PQ-RDL Gate R6 One-Click Workflow Fix" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan

$RepoPath = Split-Path -Parent $PSScriptRoot
Set-Location $RepoPath

Write-Host "1. Staging fixed .github/workflows/testnet-node.yml..." -ForegroundColor Yellow
git add .github/workflows/testnet-node.yml

Write-Host "2. Committing changes..." -ForegroundColor Yellow
git commit -m "fix(ci): make testnet-node R6 workflow PR-safe, fail-closed, and eliminate GH006"

Write-Host "3. Pushing to GitHub (origin master)..." -ForegroundColor Yellow
git push origin master

Write-Host "`n✅ Done! The fix has been pushed to GitHub." -ForegroundColor Green
Write-Host "👉 Open your repository Actions tab to watch the green build:" -ForegroundColor Cyan
Write-Host "   https://github.com/elon00/pq-rdl-blockchain/actions" -ForegroundColor White
