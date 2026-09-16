@echo off
cd /d "%~dp0"
title PQ-RDL Web4 Blockchain - Public Testnet Gateway
color 0B

echo ==========================================================================
echo    ?? BOUNTYHUNTER OS // QMOOSA MASTER FINISHER CONTROL PLANE
echo    PQ-RDL BLOCKCHAIN -- 1-CLICK PUBLIC TESTNET TUNNEL GATEWAY
echo ==========================================================================
echo.
echo Launching:
echo 1. Local RPC ^& Block Explorer Node on Port 7100
echo 2. Cloudflare Zero-Cost Public HTTPS Tunnel
echo 3. Automated Manifest update with live https://*.trycloudflare.com URL
echo.
echo Press Ctrl+C in this window whenever you wish to stop the tunnel.
echo.

node scripts\start-public-tunnel-node.mjs

if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo [ERROR] Public Tunnel failed to start!
    pause
    exit /b %ERRORLEVEL%
)

pause
