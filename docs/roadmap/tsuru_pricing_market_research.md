# Tsuru Pricing — Costa Rica Market Research (August 2026)

**Purpose:** sanity-check the draft tier prices in `fe/landing/src/content/plans.json`
against what CR merchants can actually buy today, before `config.draftPricing` is
turned off. **Roadmap:** TSR-084 / TSR-145.

**Everything below is in colones.** Tsuru is a Costa Rican product priced in
colones, in round figures — no USD on any customer-facing surface, no amounts
derived from an exchange rate that moves.

Competitors are converted *into* colones so the comparison is like-for-like
(several of them publish in USD, which is their choice, not ours). Conversions use
**₡452 = US$1** (BCCR window 2026-08-21 → 08-24: buy ₡443–449, sell ₡454–457) and
are **rounded to the nearest ₡1.000** — they are for orientation, not quotes, and
will drift with the rate. Where a vendor quotes "+ IVA" that is noted; it matters
(§7).

---

## 1. The headline

**Tsuru is not competing with invoicing tools. It is competing with POS suites,
and that is a much better neighbourhood to be in.**

| Category | Market range (₡/mes) | What you get |
|---|---|---|
| Free government invoicer | ₡0 | TicoFactura: invoicing only, no POS, no inventory, no reports, no support |
| Pure e-invoicing SaaS | ₡2.500–9.000 | Alegra Emprendedor/Pyme, GTI |
| **POS + e-invoicing (Tsuru's category)** | **₡9.000–36.000** | Alegra POS, POSMOVI, Wolk |

Against that, the draft prices land like this:

| Tsuru tier | ₡/mes | ₡/año | Efectivo ₡/mes | Verdict |
|---|---|---|---|---|
| Semilla | ₡0 | — | ₡0 | **Unique.** Nobody else gives away POS + invoicing. |
| Cosecha | ₡20.000 | ₡180.000 | ₡15.000 | **Defensible** — mid-band, matches POSMOVI Básico. §4 |
| Cooperativa | ₡35.000 | ₡315.000 | ₡26.250 | **In band** after the 2026-08-24 correction. §5 |
| Feria | a convenir | — | — | No comparable. Fine. |

**The market ceiling is ₡36.000/mes** — Alegra POS Plus and POSMOVI Premium land
there independently, which makes it a real ceiling rather than one vendor's quirk.
Every Tsuru tier now sits at or under it.

---

## 2. The competitive set

### 2.1 POS + electronic invoicing — the real comparison

| Product | ₡/mes | ₡/mes anual | (list) | Users | Docs/mes | Branches |
|---|---|---|---|---|---|---|
| **Alegra POS Pyme** | ₡9.000 | ₡7.000 | $20 / $15 | 2 + contador | 500 | 1 |
| **Wolk PV PYME** | ₡16.000 | — | $35 | — | incl. | incl. inventory, AR/AP |
| **POSMOVI Básico** | ₡20.000 | 10 mo = 2 free | $45 | 1 | — | — |
| **Alegra POS Pro** | ₡23.000 | ₡17.000 | $50 / $38 | 3 | 2.500 | 5 |
| **POSMOVI Pro** | ₡29.000 | 10 mo = 2 free | $65 | 5 | — | — |
| **Alegra POS Plus** | **₡36.000** | ₡27.000 | $80 / $60 | 5 | 5.000 | 10 |
| **POSMOVI Premium** | **₡36.000** | 10 mo = 2 free | $80 | ilimitados | — | — |
| **Tsuru Cosecha** | **₡20.000** | **₡15.000** | — | 5 | ilimitados | 1 |
| **Tsuru Cooperativa** | **₡35.000** | **₡26.250** | — | ilimitados | ilimitados | ilimitadas |

**₡36.000/mes is the ceiling.** Alegra's top tier and POSMOVI's top tier land there
independently. Cooperativa now sits ₡1.000 under it with unlimited branches and
seats — the strongest position on the board.

### 2.2 Pure e-invoicing — cheaper, and worth knowing

| Product | ₡/mes | Docs |
|---|---|---|
| **TicoFactura** (Hacienda, TRIBU-CR) | **₡0** | Ilimitados |
| GTI — régimen simplificado | ₡2.700 + IVA | Ilimitados |
| Alegra Emprendedor | ~₡2.000 | — |
| GTI — persona física | ₡7.650 + IVA | Ilimitados |
| Alegra Pyme (invoicing) | ~₡5.000 | — |
| GTI — empresa | ₡12.750 + IVA | 250 |

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

**₡20.000/mes**, **₡15.000/mes efectivo** on the annual plan (₡180.000/año).

**In favour:**
- Lands between Wolk (₡16.000) and Alegra POS Pro (₡23.000), and matches POSMOVI
  Básico (₡20.000) almost exactly — while giving 5 seats where POSMOVI gives 1.
- Unlimited documents where Alegra POS Pyme caps at 500/mes.
- Includes a **public storefront, templates, QR catalog, and WhatsApp orders** —
  Alegra and POSMOVI do not ship a customer-facing store at all. That is a whole
  product category bundled in, and it justifies sitting above Alegra POS Pyme.

**Against:**
- **Alegra POS Pyme at ~₡9.000/mes** is the pressure point. For a shop that only
  needs a register and invoices, that is *less than half* of Cosecha and 500
  docs/mes is plenty. Tsuru's answer has to be the storefront — if a prospect
  doesn't want one, Cosecha is a hard sell at 2.2×.

**Decided 2026-08-24:** keep **₡20.000/mes**, and widen the annual discount from 2
to **3 free months (25%, matching Alegra)** → **₡180.000/año = ₡15.000/mes
efectivo**. That undercuts Alegra POS Pro's annual (₡17.000) while still bundling
a storefront neither Alegra nor POSMOVI ships. Every line of copy that stated the
old 10-for-12 ratio now reads "pagás 9 meses y te regalamos 3".

---

## 5. Cooperativa — corrected

**Was ₡45.000/mes, which was above every competitor's top tier.** Alegra POS Plus
and POSMOVI Premium both stop at ~₡36.000, and POSMOVI Premium already includes
unlimited users — so being 25% over the ceiling needed a reason a buyer would
recognize, and "multi-branch + RBAC" wasn't it.

**Decided 2026-08-24: ₡35.000/mes, ₡315.000/año (₡26.250/mes efectivo).**

| | Was | Now | vs ceiling (₡36.000) |
|---|---|---|---|
| Cooperativa mensual | ₡45.000 | **₡35.000** | ₡1.000 under |
| Cooperativa anual | ₡450.000 (₡37.500/mes) | **₡315.000 (₡26.250/mes)** | well under |

At ₡35.000 Cooperativa undercuts both ceiling products while offering unlimited
branches, unlimited seats, and a storefront — the strongest value position of any
tier on the board, and still 75% more revenue per account than Cosecha.

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

**Why these numbers work:** at ₡80–100/doc, a merchant buying more than ₡20.000 of
packs in a month (roughly 250 documentos) has spent exactly what Cosecha costs —
and Cosecha is unlimited. The upgrade becomes obviously correct at exactly the point where we want
it to, without anyone being blocked or lectured. Below that, the pack is genuinely
the cheaper answer and the merchant keeps selling.

Both sit far under GTI's small-pack rates (₡195–580), so packs never look
predatory next to the market.

---

## 7. Two things the pricing page doesn't say yet

**IVA — decided 2026-08-24: prices are final, IVA included.** Stated on the
pricing page next to the amounts (not buried in the FAQ) and answered directly in
the FAQ. For a brand whose promise is "sin cargos ocultos," a 13% that appears
later would be exactly the hidden charge we say we don't have.

This also means the comparison tables above **understate** Tsuru's position against
GTI, which quotes "+ IVA" throughout — their real cost to a merchant is 13% higher
than listed (persona física ₡7.650 → **₡8.645** final; empresa ₡12.750 →
**₡14.408** final). Alegra and POSMOVI publish USD list prices without stating tax
treatment, so those rows are left as published.

**No USD anywhere — decided 2026-08-24.** Customer-facing surfaces quote colones
and nothing else. The reasoning is about who the customer is, not about
simplicity: **Tsuru is only usable by someone who files with Hacienda.** The whole
product is Costa Rica-specific e-invoicing, so there is no foreign-currency buyer
segment to serve — every customer thinks in colones.

Card conversion is handled where it belongs. A merchant is charged ₡20.000; if
their card is USD-denominated, the network converts at charge time and the issuer
adds its own FX fee. That happens automatically, and **any USD figure we printed
would be systematically low** against what actually posts to their statement — a
number we could not stand behind. Printing one is worse than printing none.

Two consequences:

- The live exchange-rate service (`be/data-be/app/consumer-exchange-rate`, a
  DB-cached passthrough of Hacienda's own rate) stays where it is genuinely
  load-bearing: **the POS**, where Hacienda *requires* the BCCR rate on
  USD-denominated invoices (`fe/pos-system/src/contexts/ExchangeRateContext.tsx`).
  It is Cognito-protected today and needs no public exposure for the landing.
- `fe/pos-landing`'s `usdRateCRC: 600` is not worth "fixing" with a live rate —
  the USD display itself should go. That site carries a CRC|USD currency toggle
  (`CurrencyKey`, `fmtUSD`, a rate field in its admin panel) across ~6 files. It
  is not deployed, so this is parked until/unless the site is revived; the note
  exists so nobody wires a live rate into a display that should be deleted.

---

## 8. Positioning, in one line

> Free where the law is involved. Paid where the business grows.

Nobody else in Costa Rica gives away POS + storefront + unlimited receipt types +
contingency mode. The competition either charges for the POS (Alegra, POSMOVI,
Wolk — ₡9.000–36.000/mes) or gives away only the invoicing with nothing around it
(TicoFactura). Tsuru's free tier is the wedge, and the paid tiers should be priced
to be an obvious upgrade rather than a toll — which is what §5 and §6 are about.

---

## 9. Decisions and remaining actions

**Decided 2026-08-24 (applied to `plans.json`):**

| # | Change | Status |
|---|---|---|
| 1 | Cooperativa ₡45.000 → **₡35.000 / ₡315.000** | ✅ applied |
| 2 | Annual discount 2 → **3 free months (25%)**; Cosecha ₡180.000/año | ✅ applied, copy updated |
| 3 | Semilla's 30-doc cap stays **soft** (warn at 80%, never block) | ✅ spec'd — TSR-145 §5.6 |
| 4 | Document packs **₡2.500/25**, **₡8.000/100**, non-expiring | ✅ spec'd — ships with TSR-146 |
| 5 | **Colones only**, round figures, no USD on any public surface | ✅ applied — `formatCRC` renders CR-style ₡20.000 |
| 6 | Prices are **final, IVA included** — stated beside the amounts + in the FAQ | ✅ applied |

**Still open:**

| # | Action | Why |
|---|---|---|
| 7 | Turn off `config.draftPricing` | IVA is now stated, so the numbers are final — this is the last gate before the prices read as committed. |
| 8 | Remove the CRC\|USD toggle from `fe/pos-landing` (not just the rate) | ✅ decided (§7) — **parked**, that site isn't deployed. Do it if it's ever revived; don't wire a live rate into a display that should be deleted. |

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
