# Pollos Sales Local Development

## Running Pollos Sales App Locally

### Option 1: Run with all services (Recommended)
```bash
./reboot-server.sh --pollos
```

This will start:
- ✅ API Server (port 5000)
- ✅ Landing Page (port 3001)
- ✅ Dashboard (port 3002)
- ✅ **Pollos Sales App (port 5180)**
- ✅ Store Port (port 9000)

### Option 2: Run only Pollos Sales
```bash
npm run dev:pollos
```

This will start only the Pollos Sales app on port 5180.

### Option 3: Run without Pollos Sales (default)
```bash
./reboot-server.sh
```

This will start only server, landing, and dashboard (no pollos-sales).

## URLs

When running with `--pollos` flag:
- **Pollos Sales**: http://localhost:5180
- API Server: http://localhost:5000
- Landing: http://localhost:3001
- Dashboard: http://localhost:3002

## Logs

View all service logs:
```bash
tail -f logs/server.log
```

## Stop Services

```bash
./stop-server.sh
```

## Package.json Scripts

- `npm run dev:pollos` - Run only pollos-sales
- `npm run dev:all` - Run server + landing + dashboard
- `npm run dev:all:pollos` - Run server + landing + dashboard + pollos-sales

## Port Configuration

Pollos Sales uses port **5180** (configured in `templates/pollos-sales/vite.config.ts`)

## Features

The Pollos Sales app includes:
- 🔐 AWS Cognito authentication
- 🏢 Organization selection
- 🍗 POS system for cashiers
- 📊 Dashboard for managers
- 🌐 Offline-first with service worker
- 📱 Mobile-optimized UI

## Development Notes

- The app uses a dark theme with black background (#111111)
- Auto-redirects authenticated users from login page
- Role-based routing (cajero → POS, gerente → Dashboard)
- Session stored in sessionStorage
