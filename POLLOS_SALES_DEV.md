# Pollos Sales Local Development

## Running Pollos Sales App Locally

### Run all services (Default)
```bash
./reboot-server.sh
```

This will start:
- ✅ API Server (port 5000)
- ✅ Landing Page (port 3001)
- ✅ Dashboard (port 3002)
- ✅ **Pollos Sales App (port 9000)**

### Run only Pollos Sales
```bash
npm run dev:pollos
```

This will start only the Pollos Sales app on port 9000.

## URLs

- **Pollos Sales**: http://localhost:9000
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

Pollos Sales uses port **9000** (configured in `templates/pollos-sales/vite.config.ts`)

## Package.json Scripts

- `npm run dev:pollos` - Run only pollos-sales
- `npm run dev:all` - Run server + landing + dashboard (without pollos)
- `npm run dev:all:pollos` - Run server + landing + dashboard + pollos-sales (default in reboot-server.sh)
