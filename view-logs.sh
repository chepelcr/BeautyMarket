#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

LOG_FILE="logs/server.log"

if [ ! -f "$LOG_FILE" ]; then
    echo "❌ Log file not found: $LOG_FILE"
    echo "Make sure the server is running (./reboot-server.sh)"
    exit 1
fi

echo -e "${GREEN}📋 Viewing server logs...${NC}"
echo -e "${YELLOW}Press Ctrl+C to exit${NC}"
echo ""

tail -f "$LOG_FILE"
