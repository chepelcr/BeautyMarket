#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Check if --pollos flag is passed
RUN_POLLOS=false
if [[ "$1" == "--pollos" ]]; then
  RUN_POLLOS=true
fi

echo -e "${GREEN}🔄 Rebooting JMarkets server...${NC}"

# Kill existing server processes by name
echo "Stopping existing processes..."
taskkill //F //IM node.exe 2>/dev/null || true
taskkill //F //IM tsx.exe 2>/dev/null || true

# Force kill processes on specific ports
echo "Stopping processes on ports 3001, 3002, 5000, 5180, 9000..."
for port in 3001 3002 5000 5180 9000; do
  pid=$(netstat -ano | grep ":$port" | grep LISTENING | awk '{print $5}' | head -1)
  if [ ! -z "$pid" ]; then
    taskkill //F //PID $pid 2>/dev/null || true
  fi
done

# Wait a moment for processes to terminate
sleep 2

# Clean Vite caches
echo "Cleaning Vite caches..."
rm -rf dashboard/node_modules/.vite dashboard/.vite dashboard/dist
rm -rf landing-client/node_modules/.vite landing-client/.vite landing-client/dist
rm -rf client/node_modules/.vite client/.vite client/dist
if [ "$RUN_POLLOS" = true ]; then
  rm -rf templates/pollos-sales/node_modules/.vite templates/pollos-sales/.vite templates/pollos-sales/dist
fi
echo "Caches cleared"

# Create logs directory if it doesn't exist
mkdir -p logs

# Start all services in background
if [ "$RUN_POLLOS" = true ]; then
  echo -e "${GREEN}🚀 Starting all services (server, landing, dashboard, pollos-sales)...${NC}"
  nohup npm run dev:all:pollos > logs/server.log 2>&1 &
else
  echo -e "${GREEN}🚀 Starting all services (server, landing, dashboard)...${NC}"
  nohup npm run dev:all > logs/server.log 2>&1 &
fi
DEV_ALL_PID=$!

# Wait a moment to check if process started successfully
sleep 3

# Check if process is still running
if ps -p $DEV_ALL_PID > /dev/null; then
    echo -e "${GREEN}✅ All services started successfully!${NC}"
    echo ""
    echo -e "${YELLOW}Process PID:${NC} $DEV_ALL_PID"
    echo ""
    echo -e "${YELLOW}URLs:${NC}"
    echo "  • API Server: http://localhost:5000"
    echo "  • Landing: http://localhost:3001"
    echo "  • Dashboard: http://localhost:3002"
    if [ "$RUN_POLLOS" = true ]; then
      echo -e "  • ${MAGENTA}Pollos Sales: http://localhost:5180${NC}"
    fi
    echo "  • Store Port: http://localhost:9000"
    echo ""
    echo -e "${YELLOW}Logs:${NC}"
    echo "  • All services: tail -f logs/server.log"
    echo ""
    echo -e "${YELLOW}Commands:${NC}"
    echo "  • Stop all: ./stop-server.sh"
    echo "  • Restart: ./reboot-server.sh"
    if [ "$RUN_POLLOS" = false ]; then
      echo "  • Run with Pollos: ./reboot-server.sh --pollos"
    fi
else
    echo "❌ Services failed to start. Check logs/server.log for details."
    exit 1
fi