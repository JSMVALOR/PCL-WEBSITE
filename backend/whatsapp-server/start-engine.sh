#!/bin/bash
cd "$(dirname "$0")"

echo "Setting up WhatsApp Engine to run invisibly in the background..."

# Stop it if it's already running
npx pm2 stop whatsapp-engine 2>/dev/null
npx pm2 delete whatsapp-engine 2>/dev/null

# Start it with PM2 (Process Manager)
npx pm2 start server.js --name "whatsapp-engine" --watch

echo ""
echo "=========================================================="
echo "SUCCESS! The WhatsApp Engine is now running in the background."
echo "You can safely close this terminal."
echo "If your Mac Mini restarts, just double click this script again."
echo "=========================================================="
