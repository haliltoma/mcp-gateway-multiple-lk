#!/bin/bash
exec node /home/laserkopf/Desktop/freelance/mcp-gateway-multiple-lk/build/index.js \
  --config=/home/laserkopf/Desktop/freelance/mcp-gateway-multiple-lk/gateway.config.json \
  2>/tmp/mcp-gateway-debug.log
