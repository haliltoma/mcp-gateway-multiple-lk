#!/usr/bin/env bash
# setup-watcher.sh - One-time setup for MCP Gateway build watcher service
# Run this once to install and enable the systemd user service

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVICE_FILE="${SCRIPT_DIR}/mcp-gateway-watcher.service"
SYSTEMD_USER_DIR="${HOME}/.config/systemd/user"

echo "[setup] Installing MCP Gateway watcher service..."

# Ensure systemd user directory exists
mkdir -p "${SYSTEMD_USER_DIR}"

# Copy service file
cp "${SERVICE_FILE}" "${SYSTEMD_USER_DIR}/mcp-gateway-watcher.service"
echo "[setup] Copied service file to ${SYSTEMD_USER_DIR}/"

# Make watch-build.sh executable
chmod +x "${SCRIPT_DIR}/watch-build.sh"

# Reload systemd, enable and start the service
systemctl --user daemon-reload
systemctl --user enable mcp-gateway-watcher.service
systemctl --user start mcp-gateway-watcher.service
echo "[setup] Service enabled and started."

# Enable linger so the service starts on boot without login
loginctl enable-linger "$(whoami)"
echo "[setup] Linger enabled for $(whoami) - service will start on boot."

echo ""
echo "[setup] Done! Check status with:"
echo "  systemctl --user status mcp-gateway-watcher"
echo "  journalctl --user -u mcp-gateway-watcher -f"
