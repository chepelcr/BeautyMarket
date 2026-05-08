import { useState } from "react";
import { useCart } from "@/store/cart";
import { useInventory } from "@/store/inventory";
import { crossAppApi, crossAppOrgPath } from "@/lib/api";
import { db } from "@/lib/db";
import type { ClientSearchResult } from "@/hooks/useClientSearch";

export type PayMethod = "cash" | "card" | "sinpe";

const fmt = (n: number) => "₡" + Math.round(n).toLocaleString("es-CR");

interface ConfirmPaymentArgs {
  assignmentId: string;
  orgId: string;
  userId: string;
  branchCode: number;
  terminalCode: number;
  selectedClient: ClientSearchResult | null;
}

export function useCartFlow() {
  const { items, add, remove, updateLine, clear, total, count } = useCart();
  const { decrement } = useInventory();

  const [payMethod, setPayMethod] = useState<PayMethod>("cash");
  const [cashGiven, setCashGiven] = useState("");
  const [sinpeCode, setSinpeCode] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastTotal, setLastTotal] = useState(0);
  const [lastChange, setLastChange] = useState(0);
  const [lastMethod, setLastMethod] = useState<PayMethod>("cash");
  const [orderNum, setOrderNum] = useState(0);

  // Enrich cart items with full product data for fiscal payload
  const cartItems = Object.values(items).map(({ product, qty, lineDiscount, lineNote }) => ({
    id: product.product_id,
    name: product.name,
    price: product.sale_price ?? product.price,   // display price (post-tax)
    netPrice: product.price,                       // pre-tax base price sent to BE
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

  // Approximate display values — BE recalculates from detail data
  const subtotal = cartItems.reduce((s, i) => s + i.netPrice * i.qty * (1 - i.lineDiscount / 100), 0);
  const taxAmount = Math.max(0, cartTotal - subtotal);

  const given = Number(cashGiven) || 0;
  const change = Math.max(0, given - cartTotal);
  const canConfirm = payMethod !== "cash" || given >= cartTotal;

  const resetPayment = () => {
    setCashGiven("");
    setSinpeCode("");
    setPayMethod("cash");
    setShowPayment(false);
    setShowSuccess(false);
  };

  const handleConfirmPayment = async ({
    assignmentId,
    orgId,
    userId,
    branchCode,
    terminalCode,
    selectedClient,
  }: ConfirmPaymentArgs) => {
    const saleTotal = cartTotal;
    const saleChange = payMethod === "cash" ? change : undefined;
    const localId = `sale-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const num = Math.floor(Math.random() * 9000) + 1000;

    const payTypeMap: Record<PayMethod, number> = { cash: 1, card: 3, sinpe: 4 };

    const payload = {
      assignment_id: assignmentId,
      branch_code: branchCode,
      terminal_code: terminalCode,
      client_id: selectedClient?.client_id ?? null,
      document_type: 1,
      version_id: 1,
      activity_code: "722000",
      sale_condition_id: 1,
      credit_term: "0",
      receiver: selectedClient
        ? {
            id_type: selectedClient.identification?.code ? parseInt(selectedClient.identification.code, 10) : undefined,
            id_number: selectedClient.identification?.number ?? undefined,
            business_name: selectedClient.business_name || selectedClient.client_name || undefined,
            email: selectedClient.email ?? undefined,
            state_id: selectedClient.residence?.state_id ?? undefined,
            county_id: selectedClient.residence?.county_id ?? undefined,
            district_id: selectedClient.residence?.district_id ?? undefined,
            address: selectedClient.residence?.address ?? undefined,
          }
        : null,
      details: cartItems.map((item, index) => {
        // Build discounts: product-level discounts + per-line discount override
        const discounts = [
          // Product-level discounts
          ...item.discounts.map((d) => ({
            discount_type_id: d.discount_type_id,
            rate: d.rate ?? 0,
          })),
          // Per-line discount override (type 1 = direct line discount)
          ...(item.lineDiscount > 0
            ? [{ discount_type_id: 1, rate: item.lineDiscount }]
            : []),
        ];

        return {
          line_number: index + 1,
          product_id: item.id,
          description: item.lineNote || item.name,
          quantity: item.qty,
          unit_id: 1,  // default: unit/unidad
          net_price: item.netPrice,
          cabys: item.cabys ?? undefined,
          taxes: item.taxes.map((t) => ({
            tax_type_id: t.tax_type_id,
            rate: t.rate,
            special_fields: t.special_fields ?? null,
          })),
          discounts,
        };
      }),
      payments: [{ type: payTypeMap[payMethod], amount: saleTotal }],
      // Totals are informational; BE recalculates from detail data
      subtotal: Math.round(subtotal * 100) / 100,
      discount_amount: 0,
      tax_amount: Math.round(taxAmount * 100) / 100,
      total_amount: saleTotal,
    };

    const syncUrl = crossAppOrgPath(orgId, "/sales");

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
      total: saleTotal,
      paymentMethod: payMethod === "cash" ? "Efectivo" : payMethod === "card" ? "Tarjeta" : "SINPE",
      receivedAmount: payMethod === "cash" ? given : undefined,
      change: saleChange,
      timestamp: Date.now(),
      synced: false,
      syncUrl,
      payload,
    });

    cartItems.forEach(({ id, qty }) => decrement(id, qty));

    try {
      await crossAppApi.post(syncUrl, payload);
      await db.sales.where({ localId }).modify({ synced: true });
    } catch {
      if ("serviceWorker" in navigator && "SyncManager" in window) {
        const reg = await navigator.serviceWorker.ready;
        await (reg as any).sync.register("sync-sales");
      }
    }

    setLastTotal(saleTotal);
    setLastMethod(payMethod);
    setLastChange(saleChange ?? 0);
    setOrderNum(num);
    clear();
    setShowPayment(false);
    setShowSuccess(true);
  };

  return {
    // cart state
    items,
    add,
    remove,
    updateLine,
    cartItems,
    cartTotal,
    cartCount,
    subtotal,
    taxAmount,
    fmt,
    // payment state
    payMethod,
    setPayMethod,
    cashGiven,
    setCashGiven,
    sinpeCode,
    setSinpeCode,
    given,
    change,
    canConfirm,
    showPayment,
    setShowPayment,
    // success state
    showSuccess,
    setShowSuccess,
    lastTotal,
    lastChange,
    lastMethod,
    orderNum,
    resetPayment,
    handleConfirmPayment,
  };
}
