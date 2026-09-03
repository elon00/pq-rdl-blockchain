#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="${1:-$HOME/Downloads/pq-rdl-live}"
BRANCH="qmoosa-master-finisher"

cd "$REPO_DIR"
git fetch origin "$BRANCH"

# Preserve generated local evidence so checkout is never blocked.
git stash push -u -m "qmoosa-auto-backup-$(date +%Y%m%d-%H%M%S)" >/dev/null 2>&1 || true

git checkout -B "$BRANCH" "origin/$BRANCH"

npm ci
npm run qmoosa:magic
