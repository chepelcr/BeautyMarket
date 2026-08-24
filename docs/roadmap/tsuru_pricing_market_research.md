# Tsuru Pricing — Costa Rica Market Research (August 2026)

**Purpose:** sanity-check the draft tier prices in `fe/landing/src/content/plans.json`
against what CR merchants can actually buy today, before `config.draftPricing` is
turned off. **Roadmap:** TSR-084 / TSR-145.

**FX used throughout: ₡452 = US$1** (BCCR window 2026-08-21 → 08-24: buy ₡443–449,
sell ₡454–457). All competitor prices are list prices as published on their own
sites in August 2026. Where a vendor quotes "+ IVA", that is noted — it matters
(§7).

---

## 1. The headline

**Tsuru is not competing with invoicing tools. It is competing with POS suites,
and that is a much better neighbourhood to be in.**

| Category | Market range | What you get |
|---|---|---|
| Free government invoicer | ₡0 | TicoFactura: invoicing only, no POS, no inventory, no reports, no support |
| Pure e-invoicing SaaS | US$5–20/mo | Alegra Emprendedor/Pyme, GTI |
| **POS + e-invoicing (Tsuru's category)** | **US$20–80/mo** | Alegra POS, POSMOVI, Wolk |

Against that, the draft prices land like this:

| Tsuru tier | Draft ₡/mo | US$/mo | Annual ₡ | US$/mo annual | Verdict |
|---|---|---|---|---|---|
| Semilla | 0 | $0 | — | — | **Unique.** Nobody else offers free POS + invoicing. |
| Cosecha | 20.000 | **$44.25** | 200.000 | **$36.87** | **Defensible**, top of the mid-band. See §4. |
| Cooperativa | 45.000 | **$99.56** | 450.000 | **$82.96** | **Too high — above the entire market ceiling.** See §5. |
| Feria | custom | — | — | — | No comparable. Fine. |

One number needs changing before launch. The rest holds up.

---

## 2. The competitive set

### 2.1 POS + electronic invoicing — the real comparison

| Product | Monthly | Annual (eff. /mo) | Users | Docs/mo | Branches |
|---|---|---|---|---|---|
| **Alegra POS Pyme** | $20 | $15 (−25%) | 2 + contador | 500 | 1 |
| **Wolk PV PYME** | $35 | — | — | incl. | incl. inventory, AR/AP |
| **POSMOVI Básico** | $45 | 10 mo = 2 free | 1 | — | — |
| **Alegra POS Pro** | $50 | $38 (−25%) | 3 | 2.500 | 5 |
| **POSMOVI Pro** | $65 | 10 mo = 2 free | 5 | — | — |
| **Alegra POS Plus** | $80 | $60 (−25%) | 5 | 5.000 | 10 |
| **POSMOVI Premium** | $80 | 10 mo = 2 free | ilimitados | — | — |
| **Tsuru Cosecha** | **$44** | **$37** | 5 | ilimitados | 1 |
| **Tsuru Cooperativa** | **$100** | **$83** | ilimitados | ilimitados | ilimitadas |

**The market ceiling is $80/mo.** Both Alegra's top tier and POSMOVI's top tier
land there independently, which makes it a real ceiling rather than one vendor's
quirk.

### 2.2 Pure e-invoicing — cheaper, and worth knowing

| Product | Price | Docs |
|---|---|---|
| **TicoFactura** (Hacienda, TRIBU-CR) | **₡0** | Unlimited |
| GTI — régimen simplificado | ₡2.700 + IVA/mo | Unlimited |
| Alegra Emprendedor | $5/mo | — |
| GTI — persona física | ₡7.650 + IVA/mo (~$17) | Unlimited |
| Alegra Pyme (invoicing) | $10/mo | — |
| GTI — empresa | ₡12.750 + IVA/mo (~$28) | 250 |

These are not Tsuru's competitors *feature-wise*, but they are the price a merchant
has in their head when they hear "facturación electrónica." Anchoring matters even
when the comparison is unfair.

---

## 3. TicoFactura is the most important line in this document

Since **6 October 2025**, Hacienda ships **TicoFactura** free inside TRIBU-CR
(replacing EDDI7). It issues v4.4 receipts, **unlimited**, at zero cost.

Its documented limits: no accounting, no inventory, no IVA reports, no automatic
REP handling, no native mobile app, no support beyond Hacienda's own docs, no data
import when migrating, and awkward multi-company handling. It is explicitly aimed
at independent professionals issuing **under ~20 documents/month**.

Two consequences, and the second one is easy to miss:

1. **Semilla's differentiation is real.** Free POS + catalog + QR + WhatsApp orders
   + offline selling + a storefront is something no one else gives away. The free
   tier is a genuine moat, not a loss-leader.

2. **Charging for *document volume* on the free tier competes against free.**
   A merchant who hits Semilla's 30-doc cap does not compare Semilla to Cosecha —
   they compare it to TicoFactura, which has no cap and costs nothing. A hard cap
   pushes them toward a *government* product, not toward a Tsuru tier.

   This is the market argument for the soft cap (§6). The 30-doc ceiling should
   never return a 402 on emission.

---

## 4. Cosecha — defensible, with a caveat

$44/mo monthly, $37/mo on annual.

**In favour:**
- Sits between Wolk ($35) and Alegra POS Pro ($50); essentially matches POSMOVI
  Básico ($45) while giving 5 seats where POSMOVI gives 1.
- Unlimited documents where Alegra Pyme caps at 500/mo.
- Includes a **public storefront, templates, QR catalog, and WhatsApp orders** —
  Alegra and POSMOVI do not ship a customer-facing store at all. That is a whole
  product category bundled in, and it justifies sitting above Alegra POS Pyme.

**Against:**
- **Alegra POS Pyme at $20/mo ($15 annual)** is the pressure point. For a small shop
  that only needs a register and invoices, it is *less than half* the price and 500
  docs/month is plenty. Tsuru's answer has to be the storefront — if a prospect
  doesn't want a storefront, Cosecha is a hard sell at 2.2×.
- The monthly/annual gap (17%) is narrower than Alegra's 25%.

**Recommendation:** keep ₡20.000/₡200.000, **but** consider widening the annual
discount to 3 months free (25%, matching Alegra) → **₡180.000/año** (₡15.000/mo,
$33). Better cash flow, better headline, and it closes the gap with Alegra Pro's
annual ($38) exactly.

---

## 5. Cooperativa — this is the one to change

**$99.56/mo is above every competitor's top tier.** Alegra Plus and POSMOVI Premium
both stop at $80, and POSMOVI Premium already includes *unlimited users*.

Being 24% above the market ceiling needs a reason a buyer recognizes, and
"multi-branch + RBAC" is not it — POSMOVI Premium gives unlimited users at $80 and
Alegra Plus gives 10 warehouses at $80.

The annual price ($83/mo) is fine. It is the **monthly** price that is out of band.

**Recommendation:** **₡35.000/mo, ₡350.000/año** ($77.4 / $64.5 per month). That
lands just under both $80 ceilings on monthly and comfortably under Alegra Plus's
annual ($60) — competitive without being a discount brand. If the 25% annual
discount in §4 is adopted, ₡315.000/año ($58/mo).

| | Draft | Recommended | vs market ceiling |
|---|---|---|---|
| Cooperativa monthly | ₡45.000 ($99.6) | **₡35.000 ($77.4)** | $80 → under |
| Cooperativa annual | ₡450.000 ($83.0/mo) | **₡350.000 ($64.5/mo)** | $60–80 → in band |

---

## 6. Document packs (overage)

Requested behaviour: warn at 80%, and let a merchant **buy more documents** when the
allowance runs out rather than being forced to upgrade.

Market anchors for marginal document cost:

| Source | Per document |
|---|---|
| GTI prepaid, 24 docs | ₡580 |
| GTI prepaid, 60 docs | ₡348 |
| GTI prepaid, 150 docs | ₡195 |
| GTI postpaid, 250–500 docs | ₡51 |
| GTI postpaid, 1.000 docs | ₡41 |

Small packs are expensive per document; volume collapses the unit price. Tsuru
should price packs as a **bridge**, not a revenue line — the goal is that a merchant
who needs a lot of documents finds *upgrading* cheaper, on their own arithmetic.

**Recommended packs (one-off, non-expiring):**

| Pack | Price | Per doc |
|---|---|---|
| 25 documentos | ₡2.500 | ₡100 |
| 100 documentos | ₡8.000 | ₡80 |

**Why these numbers work:** at ₡80–100/doc, a merchant buying more than ~₡20.000 of
packs in a month (roughly 250 docs) has spent what Cosecha costs — and Cosecha is
unlimited. The upgrade becomes obviously correct at exactly the point where we want
it to, without anyone being blocked or lectured. Below that, the pack is genuinely
the cheaper answer and the merchant keeps selling.

Both sit far under GTI's small-pack rates (₡195–580), so packs never look
predatory next to the market.

---

## 7. Two things the pricing page doesn't say yet

**IVA.** Every CR competitor quoting to businesses states "+ IVA" explicitly
(GTI does throughout). Tsuru's page shows bare colón amounts with no indication.
Consumer-facing prices in Costa Rica are expected to be displayed IVA-included;
B2B quoting "+ IVA" is the norm. **Decide and state it on the page** — a merchant
discovering 13% at checkout is a trust problem for a brand built on "sin cargos
ocultos." This is a `plans.json` copy change, not code.

**A stale FX constant.** `fe/pos-landing/public/config.json` carries
`usdRateCRC: 600`, which is ~33% off the real rate (~452). Any USD figure that site
renders is wrong today. Either fix it or drop USD display; it is another argument
for §8.

---

## 8. Positioning, in one line

> Free where the law is involved. Paid where the business grows.

Nobody else in Costa Rica gives away POS + storefront + unlimited receipt types +
contingency mode. The competition either charges for the POS (Alegra, POSMOVI,
Wolk, $20–80) or gives away only the invoicing with nothing around it
(TicoFactura). Tsuru's free tier is the wedge, and the paid tiers should be priced
to be an obvious upgrade rather than a toll — which is what §5 and §6 are about.

---

## 9. Recommended changes

| # | Change | Where | Why |
|---|---|---|---|
| 1 | Cooperativa → **₡35.000 / ₡350.000** | `plans.json` | $99.6/mo is above the market's $80 ceiling (§5). |
| 2 | Doc packs at **₡2.500/25** and **₡8.000/100** | TSR-145 build | Bridge, not revenue; makes upgrading obviously right at ~250 docs (§6). |
| 3 | Keep Semilla's 30-doc cap **soft** (warn at 80%, never block) | TSR-145 | A hard cap sends people to free TicoFactura, not to Cosecha (§3). |
| 4 | State the **IVA** treatment on the page | `plans.json` copy | Every competitor does; silence risks the "sin cargos ocultos" promise (§7). |
| 5 | *Consider* 25% annual discount (3 months free) | `plans.json` | Matches Alegra; improves cash flow and the annual headline (§4). |
| 6 | Fix or remove `usdRateCRC: 600` | `fe/pos-landing` | ~33% off the real rate (§7). |

Items 1 and 4 should land before `draftPricing` is turned off.

---

## Sources

- [Alegra POS Costa Rica — precios](https://www.alegra.com/costarica/pos/precios/)
- [Alegra Costa Rica — precios (ERP, facturación, POS)](https://www.alegra.com/costarica/precios/)
- [Alegra — facturador gratuito de Hacienda (TicoFactura)](https://blog.alegra.com/costa-rica/facturador-gratuito-hacienda/)
- [Reseña GTI Costa Rica: precios, TRIBU-CR y límites 2026](https://programascontabilidad.com/analisis-de-herramientas/gti-facturacion-costa-rica/)
- [Facturador electrónico Costa Rica 2026: TicoFactura, Facturele, GTI, Alegra y Alanube](https://programascontabilidad.com/comparativas-de-software/facturador-electronico-ministerio-de-hacienda/)
- [¿Cuánto cuesta un sistema POS en Costa Rica? Guía de precios 2026 — Posmovi](https://posmovi.com/blog/cuanto-cuesta-un-sistema-pos/)
- [Los mejores sistemas POS de Costa Rica en 2026 — FLK Development](https://flkdevelopment.com/mejores-sistemas-pos-costa-rica/)
- [Plan PYME $35/mes — PV Wolk Costa Rica](https://wolksoftcr.com/plan-pyme/)
- [Tico Factura: guía sobre su funcionamiento 2026](https://siemprealdia.co/costa-rica/impuestos/tico-factura/)
- [TRIBU-CR 2026: qué es, cómo ingresar y trámites](https://siemprealdia.co/costa-rica/impuestos/plataforma-tribu-cr/)
- [Tipo de cambio del dólar — La Nación (21 ago 2026)](https://www.nacion.com/economia/indicadores/tipo-de-cambio-del-dolar-miercoles-30-de-agosto/PXD4E7KMCFFHVP2L4ULJYU5Y6I/story/)
- [Tipo de cambio de ventanilla — BCCR](https://gee.bccr.fi.cr/IndicadoresEconomicos/Cuadros/frmConsultaTCVentanilla.aspx)
