#!/usr/bin/env bash
set -euo pipefail

echo "=========================================================================="
echo "   🧙 BOUNTYHUNTER OS // QMOOSA MASTER FINISHER CONTROL PLANE"
echo "   PQ-RDL BLOCKCHAIN — 1-CLICK TESTNET QUALIFICATION PIPELINE"
echo "=========================================================================="
echo ""
echo "Running automated 8-stage testnet qualification sequence:"
echo "1. Multi-Node Infrastructure Boot (Node-1, Node-2, Node-3)"
echo "2. P2P Mutual Challenge Authentication & TLS Handshake"
echo "3. Real Dual Hybrid Transaction (Ed25519 + ML-DSA-65)"
echo "4. Conway Cellular Automaton Proof-of-Automaton Mining"
echo "5. Live P2P State Synchronization across 3 Nodes"
echo "6. Process Kill & Disk Crash Recovery Verification"
echo "7. Audited Evidence Bundle Generation (evidence/*.json)"
echo "8. QMoosa Reality Gate Certification"
echo ""

node scripts/qualify-testnet-1click.mjs
