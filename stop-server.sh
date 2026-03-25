#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Stopping JMarkets server...${NC}"

# Kill node processes (Windows)
taskkill //F //IM node.exe 2>/dev/null && echo -e "${GREEN}Node processes stopped.${NC}" || echo "No node processes found."

# Force kill any processes on dev ports
echo "Stopping processes on ports 3001, 3002, 5000..."
for port in 3001 3002 5000 9000; do
  pid=$(netstat -ano | grep ":$port" | grep LISTENING | awk '{print $5}' | head -1)
  if [ ! -z "$pid" ]; then
    taskkill //F //PID $pid 2>/dev/null || true
    echo "  Killed PID $pid on port $port"
  fi
done

echo -e "${GREEN}Done.${NC}"
echo ""
