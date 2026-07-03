# Pollo Porteño Storefront Template

Landing page + menu storefront for **Pollo Porteño**, owned by **María Leticia Vega**.

- 📍 Location: <https://maps.app.goo.gl/oK8JHCuUQuXiGXJw9>
- 📘 Facebook: <https://www.facebook.com/photo/?fbid=534237635277587&set=a.534237618610922>

## Architecture

- React 18 + Vite + TypeScript + Tailwind CSS.
- Anonymous Cognito guest authentication via AWS Amplify (Identity Pool with
  `allowGuestAccess: true`). Visitors do **not** belong to the organization —
  they are external customers buying from the configured store.
- Organization ID is loaded from `public/config.json` at runtime, so the same
  build can be deployed to multiple buckets simply by swapping the config file.

## DTO compatibility

The `src/types/product.ts` and `src/types/organization.ts` DTOs are intentionally
identical to the **POS System** template (`templates/pos-system/src/types/`). The
storefront and the POS share the same product/menu contract.

## Configuration

### `public/config.json` (preferred, runtime)

```json
{
  "organizationId": "org_abc123",
  "mode": "prod"
}
```

### Environment variables (build-time fallback)

See `.env.example`:

```env
VITE_API_URL=https://api.tsuru.jcampos.dev
VITE_AWS_REGION=us-east-1
VITE_AWS_COGNITO_USER_POOL_ID=
VITE_AWS_COGNITO_CLIENT_ID=
VITE_AWS_COGNITO_IDENTITY_POOL_ID=
VITE_ORGANIZATION_ID=
```

## API endpoints consumed

All anonymous, scoped to the organization in `config.json`:

| Endpoint                                                  | Purpose          |
| --------------------------------------------------------- | ---------------- |
| `GET /api/public/organizations/:orgId`                    | Org info         |
| `GET /api/public/organizations/:orgId/theme`              | Theme/styles     |
| `GET /api/public/organizations/:orgId/contact`            | Contact info     |
| `GET /api/public/organizations/:orgId/categories`         | Menu categories  |
| `GET /api/public/organizations/:orgId/products?status=1`  | Active products  |

## Develop

```bash
# From repo root
npm run dev:template:pollo-porteno   # http://localhost:3009

# Or inside the template folder
cd templates/pollo-porteno
npm install
npm run dev
```

## Build

```bash
# From repo root
npm run build:template:pollo-porteno   # → dist/templates/pollo-porteno
```

## Logo

Drop the official PNG at `public/logo.png`. A temporary `public/logo.svg`
placeholder is included until the official artwork is added.
