import { useCart } from "@/store/cart";
import { useInventory } from "@/store/inventory";
import { salesApi, salesOrgPath } from "@/lib/api";
import { db } from "@/lib/db";
import type { ClientSearchResult } from "@/hooks/useClientSearch";
import type { SaleReceiver } from "@/types/receiver";
import type { SaleReference } from "@/types/reference";
import type { CurrencyCode } from "@/types/invoice";

interface InvoiceCheckoutData {
  document_type: number;
  sale_condition_id: number;
  activity_code: string;
  credit_term: string;
  notes?: string;
  currency_code: CurrencyCode;
  receiver?: SaleReceiver | null;
  references?: SaleReference[];
  copy_emails?: string[];
  payments: Array<{ payment_type_id: number; amount: number }>;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
}

interface ConfirmPaymentArgs {
  assignmentId: string;
  orgId: string;
  userId: string;
  branchCode: number;
  terminalCode: number;
  selectedClient: ClientSearchResult | null;
  invoiceData: InvoiceCheckoutData;
}

export function useCartFlow() {
  const { items, add, remove, updateLine, clear, total, count } = useCart();
  const { decrement } = useInventory();

  // Enrich cart items with full product data for fiscal payload
  const cartItems = Object.values(items).map(({ product, qty, lineDiscount, lineNote }) => ({
    id: product.product_id,
    name: product.name,
    price: product.sale_price ?? product.price,
    netPrice: product.price,
    image_url: product.image_url ?? null,
    qty,
    lineDiscount: lineDiscount ?? 0,
    lineNote: lineNote ?? "",
    cabys: product.cabys ?? undefined,
    taxes: product.taxes ?? [],
    discounts: product.discounts ?? [],
    product,
  }));

  const cartTotal = total();
  const cartCount = count();
  const subtotal = cartItems.reduce(
    (s, i) => s + i.netPrice * i.qty * (1 - i.lineDiscount / 100),
    0
  );
  const taxAmount = Math.max(0, cartTotal - subtotal);

  const handleConfirmPayment = async ({
    assignmentId,
    orgId,
    userId,
    branchCode,
    terminalCode,
    selectedClient,
    invoiceData,
  }: ConfirmPaymentArgs) => {
    const localId = `sale-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    // Build receiver: prefer checkout form data, fall back to selected cart client
    const receiver: SaleReceiver | null =
      invoiceData.receiver ??
      (selectedClient
        ? {
            id_type: selectedClient.identification?.code
              ? parseInt(selectedClient.identification.code, 10)
              : undefined,
            id_number: selectedClient.identification?.number,
            business_name:
              selectedClient.business_name || selectedClient.client_name || undefined,
            email: selectedClient.email ?? undefined,
            state_id: selectedClient.residence?.state_id,
            county_id: selectedClient.residence?.county_id,
            district_id: selectedClient.residence?.district_id,
            address: selectedClient.residence?.address,
          }
        : null);

    const payload = {
      assignment_id: assignmentId,
      branch_code: branchCode,
      terminal_code: terminalCode,
      client_id: selectedClient?.client_id ?? null,
      // Invoice fields from CheckoutModal
      document_type: invoiceData.document_type,
      version_id: 1,
      activity_code: invoiceData.activity_code,
      sale_condition_id: invoiceData.sale_condition_id,
      credit_term: invoiceData.credit_term,
      notes: invoiceData.notes ?? null,
      copy_emails: invoiceData.copy_emails?.filter(Boolean) ?? [],
      currency_code: invoiceData.currency_code,
      receiver,
      references: invoiceData.references ?? [],
      // Line details from cart
      details: cartItems.map((item, index) => {
        const lineDiscounts = [
          ...item.discounts.map((d: any) => ({
            discount_type_id: d.discount_type_id ?? d.discountTypeId,
            percentage: d.rate ?? d.percentage ?? 0,
          })),
          ...(item.lineDiscount > 0
            ? [{ discount_type_id: 1, percentage: item.lineDiscount }]
            : []),
        ];

        return {
          line_number: index + 1,
          product_id: item.id,
          description: item.lineNote || item.name,
          quantity: item.qty,
          unit_id: item.product.unit_id ?? 1,
          net_price: item.netPrice,
          cabys: item.cabys,
          taxes: item.taxes.map((t: any) => ({
            tax_type_id: t.tax_type_id ?? t.taxId,
            rate: t.rate,
            special_fields: t.special_fields ?? t.specialFields ?? null,
          })),
          discounts: lineDiscounts,
        };
      }),
      payments: invoiceData.payments,
      subtotal: invoiceData.subtotal,
      discount_amount: invoiceData.discount_amount,
      tax_amount: invoiceData.tax_amount,
      total_amount: invoiceData.total_amount,
    };

    const syncUrl = salesOrgPath(orgId);

    // Persist to IndexedDB first for offline resilience
    await db.sales.add({
      localId,
      assignmentId,
      orgId,
      userId,
      items: cartItems.map((c) => ({
        productId: parseInt(c.id, 10),
        name: c.name,
        price: c.price,
        qty: c.qty,
      })),
      total: invoiceData.total_amount,
      paymentMethod: invoiceData.payments
        .map((p) =>
          p.payment_type_id === 1
            ? "Efectivo"
            : p.payment_type_id === 3
            ? "Tarjeta"
            : p.payment_type_id === 4
            ? "SINPE"
            : "Otro"
        )
        .join(", "),
      timestamp: Date.now(),
      synced: false,
      syncUrl,
      payload,
    });

    cartItems.forEach(({ id, qty }) => decrement(id, qty));

    // POST to sales-api; on failure register background sync
    try {
      const sale = await salesApi.post(syncUrl, payload);
      await db.sales.where({ localId }).modify({ synced: true });
      clear();
      return sale;
    } catch (err) {
      if ("serviceWorker" in navigator && "SyncManager" in window) {
        const reg = await navigator.serviceWorker.ready;
        await (reg as any).sync.register("sync-sales");
      }
      clear();
      throw err;
    }
  };

  return {
    // Cart state
    items,
    add,
    remove,
    updateLine,
    cartItems,
    cartTotal,
    cartCount,
    subtotal,
    taxAmount,
    // Checkout
    handleConfirmPayment,
  };
}
