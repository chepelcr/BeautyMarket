#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🛑 Stopping JMarkets server...${NC}"

# Kill server processes
pkill -f "tsx server/src/index.ts" && echo -e "${GREEN}✅ Server stopped successfully${NC}" || echo "No server process found"
pkill -f "node.*server" || true

echo ""
echo "Server processes terminated."
