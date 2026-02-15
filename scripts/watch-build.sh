#!/usr/bin/env bash
# watch-build.sh - Continuous TypeScript build watcher for MCP Gateway
# Used by systemd user service to keep build/ up-to-date

set -euo pipefail

# nvm is not available in systemd context, hardcode the path
NODE_DIR="/home/laserkopf/.nvm/versions/node/v24.12.0/bin"
export PATH="${NODE_DIR}:${PATH}"

PROJECT_DIR="/home/laserkopf/Desktop/freelance/mcp-gateway-multiple-lk"
cd "${PROJECT_DIR}"

# Initial full build
echo "[mcp-gateway-watcher] Running initial build..."
npx tsc
chmod 755 build/index.js

echo "[mcp-gateway-watcher] Starting watch mode..."
# exec replaces shell process so systemd signals reach tsc directly
exec npx tsc --watch --preserveWatchOutput
