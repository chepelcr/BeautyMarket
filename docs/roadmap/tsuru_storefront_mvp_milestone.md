# Tsuru Storefront-Deploy MVP — Milestone Map (TSR-118)

**Created:** 2026-06-20. **Owner:** jcampos. **Goal:** a new organization gets a working,
HTTPS storefront auto-deployed at `{slug}.stores.tsuru.jcampos.dev`, consuming a single
shared **public API**, with the storefront codebases living in their own repos. Plus a
landing rebalance so the three product concepts (POS · org store · community/fairs) are in
harmony. Account: **PACIFIC-PROD** (`947999370977`), zone `Z08953202H0791MTWJHTP`.

> Tracking row: **TSR-118** in `tsuru_roadmap.md` §2.F. Sub-items lettered W1–W5 below.
> Locked decisions (owner, 2026-06-20): public-api = new dedicated service (api-generator
> pattern, maps all shared public reads, manual deploy); org domain = dedicated parent
> `*.stores.tsuru.jcampos.dev` + one wildcard ACM cert; templates = per-template repos,
> support user-personalized templates.

---

## W1 — Shared public API service (`tsuru-public-api`)

**What:** a new no-auth, read-only API the storefronts consume, built the same way as the
other backends (swagger/`gen_api_template.py` → SAM API Gateway), exposing ONE contract that
maps the shared public reads. Domain: `public-api.tsuru.jcampos.dev`. Manual deploy first
(SAM, PACIFIC-PROD), GH Actions later.

**Endpoints (the templates' contract — see W4):**
- `GET /api/public/organizations/by-subdomain/{sub}` · `/by-slug/{slug}` · `/{orgId}` (org lookup/details)
- `GET /api/public/organizations/{orgId}/theme | /contact | /pages | /pages/{slug} | /categories`
- `GET /api/public/organizations/{orgId}/products` (+ filters) · `/products/{id}`
- (demo mode) `GET /api/public/templates/{templateId}/...` mirror

**Source mapping** (it aggregates existing public reads — no business logic duplication):
- content (theme/contact/pages/categories) ← management-be `PublicOrgController` / `TemplateController`
- products/categories ← store-be `/api/organizations/{id}/products|categories`
- org lookup ← management-be `OrganizationController` public routes

**Implementation:** thin Node/Express (or FastAPI) lambda that proxies/fans-out to the
underlying public endpoints by orgId, normalizing the response shapes the templates expect
(`{items,pagination}` for products; theme/contact/pages objects). Resolves roadmap **TSR-080**.
New repo `chepelcr/tsuru-public-api` (monorepo-split skill) or `be/public-api` working copy.

**Infra:** deploy-role (OIDC), `tsuru-dev-public-api` lambda + `tsuru-dev-public-api-gateway`
SAM stack, custom domain `public-api.tsuru.jcampos.dev` (needs a CAA record permitting amazon
on that subdomain — same fix as the other api subdomains).

## W2 — Org-site deploy provisioner (sales-be `infrastructure-service-provider`)

1. **Re-enable** it: fix the "pre-existing import error", uncomment in `scripts/pipeline-build.sh`.
2. **Env-drive the domain** (stop hardcoding `j-markets.jcampos.dev`): `route53_service.py:46`,
   `infrastructure_provisioning_service.py:191/320/343` → read `DOMAIN_SUFFIX`. Set
   `.env*`: `DOMAIN_SUFFIX=stores.tsuru.jcampos.dev`, `ROUTE53_HOSTED_ZONE_ID=Z08953202H0791MTWJHTP`,
   `RESOURCE_NAME_PREFIX=tsuru-org`.
3. **TLS:** attach the W3 wildcard `*.stores.tsuru.jcampos.dev` cert to each org CloudFront
   (alias `{slug}.stores.tsuru.jcampos.dev`) instead of per-org ACM requests.
4. **Template source:** clone the per-template repo from W5 (`chepelcr/template-{name}`),
   build, upload to `tsuru-org-{slug}` bucket. Inject the org's public-api base URL + orgId
   at build (so the deployed site is in ORG mode, not demo).
5. Verify the SNS path end-to-end (management-be `ORGANIZATION_TOPIC_ARN` → SQS → provisioner →
   `organization_settings` row `active`). Deploy is container-image; build on GH arm64.

## W3 — Wildcard cert + DNS for org sites ✅ DONE (2026-06-20)

- **Cert ISSUED:** `*.stores.tsuru.jcampos.dev` (+ `stores.tsuru.jcampos.dev`),
  `arn:aws:acm:us-east-1:947999370977:certificate/759f1f4e-e216-42ee-a729-4bcf025b4228`.
- Required a **CAA at `stores.tsuru.jcampos.dev`** permitting amazon (issue + issuewild) —
  because `stores.*` is still under the `tsuru.jcampos.dev` Pages CNAME, the CAA tree-climb
  would otherwise inherit GitHub's restrictive CAA. The CAA stops the climb at `stores.*`.
- Per-org A-alias `{slug}.stores.tsuru.jcampos.dev` → the org's CloudFront (created by W2).

## W4 — Template contract audit + update

For every `templates/{name}` (≈9): repoint `src/lib/apiUtils.ts` base URL
`markets-api.jcampos.dev` → `public-api.tsuru.jcampos.dev`; `subdomain.ts` base domain
`j-markets.jcampos.dev` → `stores.tsuru.jcampos.dev`; confirm every path they call exists in
W1 (notably the previously-missing `/api/public/organizations/{id}/products|categories`).
`.env.example` updated. Demo mode (`/api/public/templates/{id}/...`) kept for previews.

## W5 — Per-template repos (monorepo-split skill)

- Split each `templates/{name}` → `chepelcr/template-{name}` (clean snapshot, own GH Actions
  build, gitignored-marker in monorepo per the split rule). The provisioner (W2) clones these.
- Keep a "starter/base" template that users can fork/personalize (the user wants
  user-generated personalized templates — a base + theme/preset overrides).
- Note: roadmap TSR-083 (collapse 8→1–2) is the longer-term direction; for the MVP we split
  the existing set so the provisioner has real repos to clone.

## W6 — Landing harmony rebalance (`fe/landing`)

Connect the three pillars without false present-tense (fairs stay "coming soon"):
- `landing.json`: hero subtitle gains the community/fairs connection; how-it-works step 3 →
  "comparte, vende y únete a la comunidad"; add a community-spotlight section linking POS+store
  to the fairs vision; clarify the 4 values toward the 3 pillars.
- `features.json`: add a 7th card "Conecta en ferias y trueque" (marked roadmap/accent).
- `community.json`: add a "hoy vs. pronto" section (current community tools now, fairs/barter soon).
- `about.json`: add "de la visión a la práctica: hoy" bridging origin→current product→vision.

---

## Sequencing (dependencies)
W3 (wildcard cert) → W2 (provisioner uses it). W1 (public-api) → W4 (templates point at it) →
W2 (injects public-api URL at build). W5 (repos) → W2 (clones them). W6 is independent (do anytime).

**MVP cut:** W3 + W1 + (W2 re-enable + env/domain/cert/template-source) + W4 + at least one
W5 base template = a real org gets a live `{slug}.stores.tsuru.jcampos.dev`. W6 in parallel.

## Verification
1. Wildcard cert ISSUED; `stores.tsuru.jcampos.dev` zone records present.
2. `public-api.tsuru.jcampos.dev/api/public/organizations/{orgId}/products` → 200 with items;
   theme/contact/pages/categories → 200.
3. Create a test org → SNS → provisioner runs → `organization_settings.status=active`,
   bucket/CloudFront/Route53 created → `https://{slug}.stores.tsuru.jcampos.dev` serves the
   storefront, which loads products from the public API (network tab clean, no CORS/404).
4. Landing: three pillars visible in the hero→features→how-it-works journey; fairs still honest.
