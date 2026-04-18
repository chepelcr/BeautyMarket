import { useState } from "react";
import { useSync } from "@/hooks/useSync";
import { useAssignment } from "@/hooks/useAssignment";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/store/cart";
import { useInventory } from "@/store/inventory";
import { useAuthContext } from "@/contexts/AuthContext";
import { api, orgPath } from "@/lib/api";
import { db } from "@/lib/db";
import POSLayout from "@/components/layout/POSLayout";
import ProductGrid from "@/components/pos/ProductGrid";
import CartBar from "@/components/pos/CartBar";
import PaymentScreen from "./PaymentScreen";
import SuccessScreen from "./SuccessScreen";

type Screen = "pos" | "payment" | "success";

interface SaleResult {
  total: number;
  paymentMethod: "Efectivo" | "SINPE" | "Tarjeta";
  change?: number;
}

export default function POSPage() {
  const syncStatus = useSync();
  const { user, org } = useAuthContext();
  const { data: assignment, isLoading: assignmentLoading, error: assignmentError } = useAssignment();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { items, add, remove, clear, total, count } = useCart();
  const decrement = useInventory((s) => s.decrement);

  const [screen, setScreen] = useState<Screen>("pos");
  const [category, setCategory] = useState("Todos");
  const [lastSale, setLastSale] = useState<SaleResult | null>(null);

  const cartItems = Object.values(items);

  const handleConfirmPayment = async (
    paymentMethod: "Efectivo" | "SINPE" | "Tarjeta",
    receivedAmount?: number
  ) => {
    const saleTotal = total();
    const change = receivedAmount ? receivedAmount - saleTotal : undefined;
    const localId = `sale-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const payload = {
      assignmentId: assignment!.id,
      items: cartItems.map(({ product, qty }) => ({
        productId: product.id,
        name: product.name,
        price: product.price,
        qty,
      })),
      total: saleTotal,
      paymentMethod,
      receivedAmount,
      change,
      timestamp: Date.now(),
    };

    const syncUrl = orgPath(user!.userId, org!.id, "/sales");

    // Write to IndexedDB first
    await db.sales.add({
      localId,
      assignmentId: assignment!.id,
      orgId: org!.id,
      userId: user!.userId,
      items: payload.items,
      total: saleTotal,
      paymentMethod,
      receivedAmount,
      change,
      timestamp: payload.timestamp,
      synced: false,
      syncUrl,
      payload,
    });

    // Decrement local inventory
    cartItems.forEach(({ product, qty }) => decrement(product.id, qty));

    // Attempt sync
    try {
      await api.post(syncUrl, payload);
      await db.sales.where({ localId }).modify({ synced: true });
    } catch {
      // Will sync via service worker background sync
      if ("serviceWorker" in navigator && "SyncManager" in window) {
        const reg = await navigator.serviceWorker.ready;
        await (reg as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register("sync-sales");
      }
    }

    setLastSale({ total: saleTotal, paymentMethod, change });
    clear();
    setScreen("success");
  };

  if (assignmentLoading || productsLoading) {
    return (
      <POSLayout syncStatus={syncStatus}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-muted font-barlow text-lg animate-pulse">Cargando...</div>
        </div>
      </POSLayout>
    );
  }

  if (assignmentError || !assignment) {
    return (
      <POSLayout syncStatus={syncStatus}>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
          <div className="text-4xl">⚠️</div>
          <div className="text-destructive font-barlow font-bold text-xl text-center">
            No hay asignación activa
          </div>
          <div className="text-muted text-sm text-center">
            Contactá al gerente para que te asigne un puesto.
          </div>
        </div>
      </POSLayout>
    );
  }

  return (
    <POSLayout
      syncStatus={syncStatus}
      standName={assignment.standName}
      context={assignment.context}
      sessionName={assignment.sessionName}
    >
      {screen === "pos" && (
        <>
          <ProductGrid
            products={products.filter((p) => p.isActive)}
            cart={Object.fromEntries(
              Object.entries(items).map(([id, { qty }]) => [id, qty])
            )}
            onAdd={add}
            category={category}
            onCategoryChange={setCategory}
          />
          <CartBar
            items={cartItems}
            total={total()}
            count={count()}
            onAdd={add}
            onRemove={remove}
            onCheckout={() => cartItems.length > 0 && setScreen("payment")}
          />
        </>
      )}

      {screen === "payment" && (
        <PaymentScreen
          total={total()}
          onBack={() => setScreen("pos")}
          onConfirm={handleConfirmPayment}
        />
      )}

      {screen === "success" && lastSale && (
        <SuccessScreen
          total={lastSale.total}
          paymentMethod={lastSale.paymentMethod}
          change={lastSale.change}
          onNewSale={() => setScreen("pos")}
        />
      )}
    </POSLayout>
  );
}
