#!/bin/bash

echo "Rebooting JMarkets server..."

# Kill existing server process
pkill -f "tsx server/src/index.ts" || true
pkill -f "node.*server" || true

# Wait a moment for processes to terminate
sleep 2

# Start the server
npm run dev:all