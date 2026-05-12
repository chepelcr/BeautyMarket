# POS Invoice Management — Implementation Tasks

> Legend: ✅ Done · 🔄 In Progress · ⬜ Pending · 🚫 Blocked

---

## PHASE 0 — Foundation & Services

### T0.1 BE Documentation
- ✅ Create `docs/BE_IMPLEMENTATION.md` with full schema, DTOs, and endpoint reference

### T0.2 Task Tracker
- ✅ Create `TASKS.md` (this file)

### T0.3 Tax & Discount Calculation Services (faithful port)
- ✅ Port `taxCalculationService.ts` — snake_case field names, identical formulas
  - ✅ `getLineAmounts()` — special → other → IVA processing order
  - ✅ `calculateIvaTaxAmount()` — IVA / IVACE / IVARBU logic
  - ✅ `calculateTaxAmount()` — ISC / IUC / ISEBA / ISEBEC / IPT / ISEC / OTHERS
  - ✅ `hasFactoryTax()` + `hasDiscountsBonusOrGifts()` helpers
- ✅ Create `discountCalculationService.ts` — calculateDiscountAmount / calculateTotalDiscountAmount / calculateSubtotal
- ⬜ Create `scripts/parity-check-tax.ts` — verify results vs JCampos-Biller for 8 standard scenarios

---

## PHASE 1 — Types & State

### T1.1 Invoice Types
- ✅ Create `src/types/invoice.ts` — InvoiceFormData, InvoiceRequest, InvoiceResponse, SaleResponse, SaleListResponse, SaleSummary
- ✅ Create `src/types/lineDetail.ts` — LineDetail, LineTax, TaxSpecialFields, LineDiscount
- ✅ Create `src/types/document.ts` — DocumentResponse, ComplexSearchFilters, DocumentListResponse, AtvValidation, ReceiverValidation
- ✅ Create `src/types/reference.ts` — SaleReference
- ✅ Create `src/types/receiver.ts` — SaleReceiver, Phone

### T1.2 Document Store
- ✅ Create `src/store/documentStore.ts` — Zustand store with:
  - ✅ `open_documents[]` — per-tab { id, type, title, data?, is_dirty? }
  - ✅ `active_document_tab` — string | null
  - ✅ `view_mode` — 'tabs' | 'list'
  - ✅ `is_received` — boolean (documents-list toggle)
  - ✅ Tab actions: addDocumentTab / removeDocumentTab / setActiveDocumentTab / updateDocumentTab / closeAllTabs
  - ✅ View actions: setViewMode / setIsReceived
  - ✅ Persist to localStorage (`pos-document-store`)

### T1.3 Cart Store — extend doc_type
- ✅ Add `doc_type` field to cart store (1=FE, 2=ND, 3=NC, 4=TE, 8=FC, 9=FExport)
- ✅ Add `setDocType()` action

---

## PHASE 2 — API Layer

### T2.1 API Clients
- ✅ Add `salesApi` client + `salesOrgPath()` builder to `src/lib/api.ts`
- ✅ Add `validationApi` client + `validationPath()` builder
- ✅ Add `xmlApi` client + `xmlPath()` builder
- ✅ Add `notifyApi` client + `notifyPath()` builder
- ✅ Add env vars: VITE_SALES_API_URL, VITE_VALIDATION_API_URL, VITE_XML_API_URL, VITE_NOTIFY_API_URL

### T2.2 Invoice Hooks
- ✅ `src/hooks/useSales.ts` — GET list with filters (document_types, issued, search JSON, page, size)
- ✅ `src/hooks/useSale.ts` — GET single sale detail
- ✅ `src/hooks/useUpdateSale.ts` — PUT draft sale
- ✅ `src/hooks/useDeleteSale.ts` — DELETE soft-delete draft
- ✅ `src/hooks/useInvoiceValidation.ts` — GET validation status
- ✅ `src/hooks/useValidationAction.ts` — POST action (accept/partial-accept/reject)
- ✅ `src/hooks/useGenerateXml.ts` — POST /xml/generate (stub)
- ✅ `src/hooks/useXmlFiles.ts` — GET /xml/files
- ✅ `src/hooks/useResendNotification.ts` — POST /notifications/resend

### T2.3 Update useCartFlow
- ✅ Switch from `crossAppApi` to `salesApi` for POST /sales
- ✅ Accept invoice fields from CheckoutModal (document_type, receiver, references, copy_emails, currency_code, multi-payment)
- ✅ Replace inline subtotal/tax math with `getLineAmounts()` aggregation

---

## PHASE 3 — POS Page Re-skin

### T3.1 POSIntegratedPage — Tailwind re-skin
- ✅ Replace all inline POS theme constants with Tailwind tokens
- ✅ Desktop grid: `grid-cols-[1fr_360px]` header + body split
- ✅ 52px header: logo + "Punto de venta" + branch · terminal + user + SyncPill (online badge style)
- ✅ Left pane: Productos / Clientes tabs (Tailwind styled, `border-b-2 border-primary` active)
- ✅ Mobile: bottom tab bar using Tailwind tokens

### T3.2 CartSidebar — re-skin + doc-type selector
- ✅ Cart icon header + count badge + "Limpiar" link
- ✅ Document-type selector (6 options: FE/ND/NC/TE/FC/FExport) — 3-col grid per demo style
- ✅ Dashed-border customer button showing selected name or "Cliente (opcional)"
- ✅ Line items: demo-style card with name, qty `+/–/trash` controls, line total
- ✅ Totals section: subtotal, IVA, total (bold primary colour)
- ✅ Checkout button: `bg-primary text-primary-foreground` + total amount
- ✅ Wire "Cobrar" button to open CheckoutModal (not inline PaymentFlow)

### T3.3 Retire old components
- ✅ PaymentFlow.tsx — functionality moved to CheckoutModal/PaymentTab
- ✅ SaleSuccessOverlay.tsx — replaced by CheckoutModal Receipt step
- ✅ CartLineEditor.tsx — replaced by LineDetailModal

---

## PHASE 4 — Checkout Flow

### T4.1 CheckoutModal
- ✅ `src/components/pos/checkout/CheckoutModal.tsx` — host modal
  - ✅ Bottom-sheet on mobile (`fixed inset-0 items-end sm:items-center`)
  - ✅ Steps: payment → processing → done
  - ✅ Total banner (large primary number + "X ítems · docLabel · customer")
  - ✅ Tab strip inside payment step (shown when doc_type ≠ TE/4)
- ✅ `src/components/pos/checkout/tabs/PaymentTab.tsx`
  - ✅ Multi-method payments (cash/card/SINPE/other) — each gets amount field
  - ✅ Cash: tendered input + quick amounts + change display
  - ✅ Sum-must-equal-total validation
- ✅ `src/components/pos/checkout/tabs/DocumentTab.tsx`
  - ✅ sale_condition_id select (from dataApiClient)
  - ✅ activity_code text input
  - ✅ currency_code: iso_code select + exchange_rate number
  - ✅ notes textarea
- ✅ `src/components/pos/checkout/tabs/ReceiverTab.tsx`
  - ✅ id_type / id_code selects (from dataApiClient)
  - ✅ id_number input
  - ✅ business_name, email inputs
  - ✅ State → County → District cascading selects (from dataApiClient locations)
  - ✅ address textarea
  - ✅ phones (personal/business), economic_activity
  - ✅ Pre-fill from selected cart customer when available
- ✅ `src/components/pos/checkout/tabs/ReferencesTab.tsx`
  - ✅ Add/remove reference rows
  - ✅ reference_type_id select, document_number, reference_date, reference_code
  - ✅ Required for document_type 3 (NC) and 2 (ND)
- ✅ `src/components/pos/checkout/tabs/CopiesTab.tsx`
  - ✅ Add/remove email rows
  - ✅ Email validation
- ✅ `src/components/pos/checkout/Receipt.tsx`
  - ✅ Demo-style receipt (consecutive_number or "Pendiente")
  - ✅ Payment method, change, item count
  - ✅ "Nueva venta" button

### T4.2 LineDetailModal
- ✅ `src/components/pos/line-detail/LineDetailModal.tsx` — host modal
  - ✅ Tab bar: General / Impuestos / Descuentos / Otros
  - ✅ Live "Total línea" footer via `getLineAmounts()`
  - ✅ "Eliminar línea" + "Guardar" buttons
- ✅ `src/components/pos/line-detail/GeneralTab.tsx`
  - ✅ description, quantity, net_price inputs
  - ✅ unit_id select (from dataApiClient measurementUnits)
  - ✅ commercial_unit_measure, customs_part (12 digits)
  - ✅ base_amount (editable only when IVACE or factory tax present)
  - ✅ Subtotal display
- ✅ `src/components/pos/line-detail/TaxesTab.tsx`
  - ✅ IVA section (required, one of 01/07/08) with rate + factor selects
  - ✅ Other taxes list (02/03/04/05/06/12/99) with special_fields per type
  - ✅ Add/remove other tax rows
  - ✅ Factory assumed tax display
  - ✅ Total taxes display
- ✅ `src/components/pos/line-detail/DiscountsTab.tsx`
  - ✅ Add/remove discount rows
  - ✅ discount_type_id select, percentage, reason (required for type 99)
  - ✅ Total discounts display
- ✅ `src/components/pos/line-detail/OtherTab.tsx`
  - ✅ factory_tax_charge_id select (from dataApiClient)
  - ✅ Additional notes textarea

---

## PHASE 5 — Documents Page

### T5.1 Document Store wired to DocumentsPage
- ✅ Auto-redirect: when `open_documents.length === 0` and view_mode === 'tabs' → switch to 'list'

### T5.2 DocumentsPage (thin orchestrator)
- ✅ `src/pages/dashboard/DocumentsPage.tsx` — ~80 LOC max
  - ✅ Composes DocumentsHeader + DocumentTabsView (tabs mode) or DocumentsListView (list mode)
  - ✅ Wired to documentStore.view_mode

### T5.3 Document Header
- ✅ `src/components/documents/DocumentsHeader.tsx`
  - ✅ Title "Documentos"
  - ✅ View-mode toggle: Tabs ↔ Lista (segmented control)
  - ✅ "Nuevo documento" dropdown → 6 types → addDocumentTab + setViewMode('tabs')

### T5.4 Document Tabs View
- ✅ `src/components/documents/DocumentTabsView.tsx`
- ✅ `src/components/documents/DocumentTabBar.tsx`
  - ✅ Tab chips: title + dirty dot + close X
  - ✅ Empty state CTA → setViewMode('list')
- ✅ `src/components/documents/InvoiceForm.tsx`
  - ✅ Section: DocumentInfoSection (doc type, sale condition, currency, activity code, notes)
  - ✅ Section: ReceiverSection (receiver fields)
  - ✅ Section: LineItemsSection (product search, line cards with % button → LineDetailModal)
  - ✅ Section: TotalsSection (subtotal, discounts, IVA, total, observations, [Finalizar])
  - ✅ On change: updateDocumentTab(id, { data, is_dirty: true })
  - ✅ [Finalizar] → opens CheckoutModal in invoice-finalization mode

### T5.5 Documents List View
- ✅ `src/components/documents/DocumentsListView.tsx`
- ✅ `src/components/documents/IssuedReceivedToggle.tsx` — segmented Emitidos ↔ Recibidos
- ✅ `src/components/documents/DocumentsFilters.tsx` — doc-type chips + search + Búsqueda avanzada
- ✅ `src/components/documents/ComplexSearchModal.tsx` — date range + status + sort
- ✅ `src/components/documents/DocumentsGrid.tsx` — calls useSales, paginated
- ✅ `src/components/documents/DocumentCard.tsx` — consecutive #, date, status badge, total, action menu
- ✅ `src/components/documents/DocumentActionModal.tsx`
  - ✅ Ver PDF (iframe of pdf_url; disabled + tooltip when null)
  - ✅ Descargar (links to pdf_url/xml_url/json_url from useXmlFiles)
  - ✅ Validación (atv_validation display; accept/partial-accept/reject buttons for received docs via useValidationAction)
  - ✅ Reenviar correo (copy_emails editor → useResendNotification)

---

## PHASE 6 — Integration & Polish

### T6.1 Route & Navigation
- ⬜ Add `/dashboard/documents` route in router
- ⬜ Add "Documentos" link in sidebar nav

### T6.2 ProductDrawerForm — route through calc services
- ⬜ Replace any inline tax/discount math in ProductDrawerForm and subsections with getLineAmounts() / discountCalculationService
- ⬜ Verify products-form preview matches line-detail modal totals

### T6.3 Parity check script
- ⬜ Create `scripts/parity-check-tax.ts` — 8 test scenarios (IVA-only, IVACE, IVARBU, ISC, IUC, ISEBA, factory-tax, bonus-gift)
- ⬜ Run and confirm identical results vs JCampos-Biller source

### T6.4 CustomerPanel for Clientes left-pane tab
- ⬜ Wire `useClientSearch` to a styled CustomerPanel component matching demo's CustomerList
- ⬜ Clicking a customer: sets as selected + switches left pane back to Productos

### T6.5 Type-check & build
- ⬜ `npm run check` — zero TypeScript errors
- ⬜ `npm run build:template:pos-system` — build passes

---

## BACKEND CHECKLIST (separate work — see docs/BE_IMPLEMENTATION.md)

- ⬜ Run `/be-builder` for sales-api (shared-layer mode)
- ⬜ Run `/be-builder` for validation-api
- ⬜ Run `/be-builder` for xml-generation-api (stub)
- ⬜ Run `/be-builder` for notification-api (stub)
- ⬜ Write Alembic migration for 7 tables
- ⬜ Implement sales-api CRUD endpoints
- ⬜ Implement validation-api GET + POST /invoice-validation
- ⬜ Stub xml-generation-api /generate + /files
- ⬜ Stub notification-api /resend
- ⬜ Deploy shared layer + 4 services
- ⬜ Set custom domains + Route53 records
- ⬜ Set VITE_*_API_URL in pos-system .env.production

---

## Notes

- **Page orchestrator rule:** every `src/pages/dashboard/*.tsx` must stay ≤120 LOC. Feature logic lives in `src/components/{feature}/`.
- **Tailwind tokens:** use `bg-card`, `border-border`, `text-primary`, `text-muted-foreground`, `font-display`, `t-num` — not POS theme constants.
- **snake_case everywhere:** all FE types, API payloads, store state use snake_case. No camelCase in data layer.
- **Hacienda fields are nullable:** `pdf_url`, `xml_url`, `json_url`, `atv_validation` start as `null` — FE shows "Pendiente" affordances.
