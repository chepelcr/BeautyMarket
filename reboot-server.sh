#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔄 Rebooting JMarkets server...${NC}"

# Kill existing server processes by name
echo "Stopping existing processes..."
pkill -f "tsx server/src/index.ts" || true
pkill -f "node.*server" || true
pkill -f "vite.*dashboard" || true
pkill -f "vite.*landing" || true
pkill -f "vite.*3001" || true
pkill -f "vite.*3002" || true

# Force kill processes on specific ports
echo "Stopping processes on ports 3001, 3002, 5000, 9000..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:3002 | xargs kill -9 2>/dev/null || true
lsof -ti:5000 | xargs kill -9 2>/dev/null || true
lsof -ti:9000 | xargs kill -9 2>/dev/null || true

# Wait a moment for processes to terminate
sleep 2

# Clean Vite caches
echo "Cleaning Vite caches..."
rm -rf dashboard/node_modules/.vite dashboard/.vite dashboard/dist
rm -rf landing-client/node_modules/.vite landing-client/.vite landing-client/dist
rm -rf client/node_modules/.vite client/.vite client/dist
echo "Caches cleared"

# Create logs directory if it doesn't exist
mkdir -p logs

# Start all services in background using npm run dev:all
echo -e "${GREEN}🚀 Starting all services (server, landing, dashboard)...${NC}"
nohup npm run dev:all > logs/server.log 2>&1 &
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
    echo "  • Store Port: http://localhost:9000"
    echo ""
    echo -e "${YELLOW}Logs:${NC}"
    echo "  • All services: tail -f logs/server.log"
    echo ""
    echo -e "${YELLOW}Commands:${NC}"
    echo "  • Stop all: ./stop-server.sh"
    echo "  • Restart: ./reboot-server.sh"
else
    echo "❌ Services failed to start. Check logs/server.log for details."
    exit 1
fi