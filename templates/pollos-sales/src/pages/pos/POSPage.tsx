import { useState } from "react";
import { useSync } from "@/hooks/useSync";
import { useAssignment } from "@/hooks/useAssignment";
import { useProducts } from "@/hooks/useProducts";
import { useOrganization } from "@/hooks/useOrganization";
import { useCart } from "@/store/cart";
import { useInventory } from "@/store/inventory";
import { useAuthContext } from "@/contexts/AuthContext";
import { api, orgPath } from "@/lib/api";
import { db } from "@/lib/db";
import ClosingFlow from "@/components/pos/ClosingFlow";
import InventoryOpening from "./InventoryOpening";
import { Icon, Badge, Button, Card, SyncPill } from "@/components/ui";

const fmt = (n: number) => "₡" + Math.round(n).toLocaleString("es-CR");

type Screen = "inventory" | "pos" | "closing";
type CartStep = "cart" | "pay" | "done";
type PayMethod = "cash" | "card" | "sinpe";

interface CartItem {
  id: string;
  name: string;
  price: number;
  emoji: string;
  qty: number;
}

export default function POSPage() {
  const syncStatus = useSync();
  const { user } = useAuthContext();
  const { useDefaultOrganization } = useOrganization();
  const { data: org, isLoading: orgLoading } = useDefaultOrganization(user?.userId);
  const { data: assignment, isLoading: assignmentLoading, error: assignmentError } = useAssignment();
  const { data: rawProducts, isLoading: productsLoading } = useProducts();
  const { items, add, remove, clear, total, count } = useCart();
  const { decrement } = useInventory();

  const [screen, setScreen] = useState<Screen>("inventory");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [cartOpen, setCartOpen] = useState(false);

  // CartSheet state
  const [cartStep, setCartStep] = useState<CartStep>("cart");
  const [payMethod, setPayMethod] = useState<PayMethod>("cash");
  const [cashGiven, setCashGiven] = useState("");
  const [sinpeCode, setSinpeCode] = useState("");
  const [lastTotal, setLastTotal] = useState(0);
  const [lastMethod, setLastMethod] = useState<PayMethod>("cash");
  const [lastChange, setLastChange] = useState(0);
  const [orderNum, setOrderNum] = useState(0);

  const productsList = Array.isArray(rawProducts)
    ? rawProducts
    : (rawProducts as any)?.data ?? [];
  const activeProducts = productsList.filter((p: any) => p.status === 1);
  const cartItems: CartItem[] = Object.values(items).map(({ product, qty }: any) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    emoji: product.emoji ?? "🍗",
    qty,
  }));
  const cartTotal = total();
  const cartCount = count();
  const given = Number(cashGiven) || 0;
  const change = Math.max(0, given - cartTotal);

  const allCategories = [
    { categoryId: "all", name: "Todo", icon: "grid" },
    ...(Array.from(new Set(activeProducts.map((p: any) => p.category_id as string))) as string[]).map((id) => {
      const p = activeProducts.find((x: any) => x.category_id === id)!;
      return { categoryId: id, name: (p as any).category?.name ?? id, icon: "burger" };
    }),
  ];

  const filtered = activeProducts
    .filter((p: any) => category === "all" || p.category_id === category)
    .filter((p: any) => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  const openCart = () => {
    setCartStep("cart");
    setCashGiven("");
    setSinpeCode("");
    setCartOpen(true);
  };

  const closeCart = () => setCartOpen(false);

  const handleConfirmPayment = async () => {
    const saleTotal = cartTotal;
    const saleChange = payMethod === "cash" ? change : undefined;
    const localId = `sale-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const num = Math.floor(Math.random() * 900) + 100;

    const paymentMethod = payMethod === "cash" ? "Efectivo" : payMethod === "card" ? "Tarjeta" : "SINPE";

    const payload = {
      assignmentId: assignment!.assignment_id,
      items: cartItems.map(({ id, name, price, qty }) => ({
        productId: parseInt(id, 10),
        name,
        price,
        qty,
      })),
      total: saleTotal,
      paymentMethod,
      receivedAmount: payMethod === "cash" ? given : undefined,
      change: saleChange,
      timestamp: Date.now(),
    };

    const syncUrl = orgPath(user!.userId, org!.id, "/sales");

    await db.sales.add({
      localId,
      assignmentId: assignment!.assignment_id,
      orgId: org!.id,
      userId: user!.userId,
      items: payload.items,
      total: saleTotal,
      paymentMethod,
      receivedAmount: payload.receivedAmount,
      change: saleChange,
      timestamp: payload.timestamp,
      synced: false,
      syncUrl,
      payload,
    });

    cartItems.forEach(({ id, qty }) => decrement(parseInt(id, 10), qty));

    try {
      await api.post(syncUrl, payload);
      await db.sales.where({ localId }).modify({ synced: true });
    } catch {
      if ("serviceWorker" in navigator && "SyncManager" in window) {
        const reg = await navigator.serviceWorker.ready;
        await (reg as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register("sync-sales");
      }
    }

    setLastTotal(saleTotal);
    setLastMethod(payMethod);
    setLastChange(saleChange ?? 0);
    setOrderNum(num);
    clear();
    setCartStep("done");
  };

  const canConfirm = payMethod === "card" || payMethod === "sinpe" || given >= cartTotal;

  if (orgLoading || assignmentLoading || productsLoading) {
    return (
      <div
        style={{
          maxWidth: 440,
          margin: "0 auto",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "hsl(var(--background))",
        }}
      >
        <div className="t-body" style={{ color: "hsl(var(--muted-foreground))" }}>
          Cargando…
        </div>
      </div>
    );
  }

  if (!org || assignmentError || !assignment) {
    return (
      <div
        style={{
          maxWidth: 440,
          margin: "0 auto",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 24,
          background: "hsl(var(--background))",
        }}
      >
        <div className="icon-pill icon-pill-lg" style={{ width: 64, height: 64, background: "hsl(var(--warning) / 0.15)", color: "hsl(var(--warning))" }}>
          <Icon name="alertTri" size={28} />
        </div>
        <div className="t-h3" style={{ textAlign: "center" }}>No hay asignación activa</div>
        <div className="t-sm" style={{ color: "hsl(var(--muted-foreground))", textAlign: "center" }}>
          Contactá al gerente para que te asigne un puesto.
        </div>
      </div>
    );
  }

  if (screen === "inventory") {
    return (
      <InventoryOpening
        products={activeProducts}
        assignmentId={assignment.assignment_id}
        onDone={() => setScreen("pos")}
        puestoName={assignment.branch_id}
        onExit={() => {}}
      />
    );
  }

  if (screen === "closing") {
    return (
      <ClosingFlow
        assignmentId={assignment.assignment_id}
        sessionId={assignment.session_id}
        expectedCash={0}
        expectedSinpe={0}
        expectedCard={0}
        onClose={() => setScreen("pos")}
      />
    );
  }

  return (
    <div
      style={{
        maxWidth: 440,
        margin: "0 auto",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "hsl(var(--background))",
        position: "relative",
      }}
    >
      {/* Nav bar */}
      <div
        className="nav-bar"
        style={{
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <button
          className="btn btn-ghost btn-sm btn-icon"
          onClick={() => setScreen("closing")}
          aria-label="Cerrar turno"
        >
          <Icon name="arrowLeft" size={18} />
        </button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div className="t-label" style={{ fontSize: 10 }}>
            {assignment.branch_id}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>
            {user?.name ?? "Cajero"} · Cajero
          </div>
        </div>
        <SyncPill state={syncStatus === "online" ? "online" : syncStatus === "syncing" ? "syncing" : "offline"} />
      </div>

      {/* Search + categories */}
      <div style={{ padding: "14px 16px 8px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ position: "relative" }}>
          <Icon
            name="search"
            size={16}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "hsl(var(--muted-foreground))",
            }}
          />
          <input
            className="pp-input"
            style={{ paddingLeft: 38 }}
            placeholder="Buscar producto…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div
          style={{
            display: "flex",
            gap: 6,
            overflowX: "auto",
            paddingBottom: 4,
            margin: "0 -16px",
            padding: "0 16px 4px",
          }}
        >
          {allCategories.map((c) => (
            <button
              key={c.categoryId}
              onClick={() => setCategory(c.categoryId)}
              className={
                category === c.categoryId
                  ? "btn btn-primary btn-sm"
                  : "btn btn-outline btn-sm"
              }
              style={{ flexShrink: 0 }}
            >
              <Icon name={c.icon ?? "grid"} size={14} />
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product grid */}
      <div style={{ flex: 1, padding: "8px 16px 120px", overflowY: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {filtered.map((p: any) => {
            const lowStock = (p.stock_quantity ?? 0) > 0 && (p.stock_quantity ?? 0) <= 5;
            return (
              <button
                key={p.id}
                onClick={() => add(p)}
                className="card card-hover"
                style={{
                  padding: 0,
                  textAlign: "left",
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                  font: "inherit",
                  opacity: p.status !== 0 ? 1 : 0.5,
                }}
              >
                <div
                  className="product-image-placeholder"
                  style={{
                    fontSize: 42,
                    borderRadius: "calc(var(--radius) + 4px) calc(var(--radius) + 4px) 0 0",
                    aspectRatio: "16/10",
                  }}
                >
                  <span>{p.emoji}</span>
                </div>
                <div style={{ padding: 12 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 6,
                      marginBottom: 2,
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.25 }}>
                      {p.name}
                    </div>
                    {lowStock && (
                      <Badge
                        variant="warning"
                        style={{ flexShrink: 0, fontSize: 9, padding: "1px 6px" }}
                      >
                        {p.stock_quantity}
                      </Badge>
                    )}
                  </div>
                  <div
                    className="t-stat"
                    style={{ fontSize: 20, color: "hsl(var(--primary))", marginTop: 4 }}
                  >
                    {fmt(p.price)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Close shift link */}
        <button
          onClick={() => setScreen("closing")}
          style={{
            display: "block",
            width: "100%",
            marginTop: 16,
            padding: "10px 0",
            textAlign: "center",
            fontSize: 12,
            color: "hsl(var(--muted-foreground))",
            background: "transparent",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
          }}
        >
          🔒 Cerrar turno
        </button>
      </div>

      {/* Cart bar */}
      {cartItems.length > 0 && (
        <div
          className="fade-up"
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 40,
            background: "hsl(var(--background) / 0.9)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderTop: "1px solid hsl(var(--border))",
            padding: "12px 16px 20px",
          }}
        >
          <div style={{ maxWidth: 440, margin: "0 auto" }}>
            <button
              onClick={openCart}
              className="btn btn-primary btn-xl"
              style={{
                width: "100%",
                justifyContent: "space-between",
                height: 56,
                padding: "0 18px",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    background: "rgba(255,255,255,0.22)",
                    width: 28,
                    height: 28,
                    borderRadius: 999,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {cartCount}
                </span>
                Ver orden
              </span>
              <span className="t-stat" style={{ fontSize: 22, color: "white" }}>
                {fmt(cartTotal)}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Cart Sheet */}
      {cartOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <div
            onClick={closeCart}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              animation: "fadeIn .2s",
            }}
          />
          <div
            className="fade-up"
            style={{
              position: "relative",
              background: "hsl(var(--card))",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              maxWidth: 440,
              margin: "0 auto",
              width: "100%",
            }}
          >
            {/* Handle */}
            <div
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                background: "hsl(var(--muted))",
                margin: "10px auto 4px",
              }}
            />
            {/* Sheet header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 20px",
                borderBottom: "1px solid hsl(var(--border))",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h3 className="t-h3">
                  {cartStep === "cart"
                    ? "Orden actual"
                    : cartStep === "pay"
                    ? "Cobrar"
                    : "Venta completada"}
                </h3>
                {cartStep === "pay" && (
                  <Badge variant="primary-soft">{fmt(cartTotal)}</Badge>
                )}
              </div>
              <button
                className="btn btn-ghost btn-icon btn-sm"
                onClick={closeCart}
                aria-label="Cerrar"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            {/* Step: cart */}
            {cartStep === "cart" && (
              <>
                <div style={{ flex: 1, overflowY: "auto", padding: "8px 20px" }}>
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 0",
                        borderBottom: "1px solid hsl(var(--border))",
                      }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 8,
                          background: "hsl(var(--muted))",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 22,
                          flexShrink: 0,
                        }}
                      >
                        {item.emoji}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{item.name}</div>
                        <div className="t-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                          {fmt(item.price)} c/u
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          background: "hsl(var(--muted))",
                          borderRadius: 20,
                          padding: 2,
                        }}
                      >
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => remove(parseInt(item.id, 10))}
                          style={{ width: 30, height: 30 }}
                        >
                          <Icon name="minus" size={14} />
                        </button>
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            minWidth: 22,
                            textAlign: "center",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {item.qty}
                        </span>
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => add({ id: item.id, name: item.name, price: item.price, emoji: item.emoji, isActive: true } as any)}
                          style={{ width: 30, height: 30 }}
                        >
                          <Icon name="plus" size={14} />
                        </button>
                      </div>
                      <div
                        className="t-num"
                        style={{
                          width: 72,
                          textAlign: "right",
                          fontSize: 14,
                          fontWeight: 700,
                        }}
                      >
                        {fmt(item.price * item.qty)}
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    padding: "16px 20px 20px",
                    borderTop: "1px solid hsl(var(--border))",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 14,
                    }}
                  >
                    <div className="t-label">Total a cobrar</div>
                    <div className="t-stat-xl" style={{ fontSize: 34 }}>
                      {fmt(cartTotal)}
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    size="xl"
                    onClick={() => setCartStep("pay")}
                    style={{ width: "100%" }}
                  >
                    Cobrar {fmt(cartTotal)}
                  </Button>
                </div>
              </>
            )}

            {/* Step: pay */}
            {cartStep === "pay" && (
              <div style={{ padding: 20, overflowY: "auto" }}>
                <div className="t-label" style={{ marginBottom: 10 }}>
                  Método de pago
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 8,
                    marginBottom: 20,
                  }}
                >
                  {(
                    [
                      { id: "cash", icon: "cash", label: "Efectivo" },
                      { id: "card", icon: "card", label: "Tarjeta" },
                      { id: "sinpe", icon: "smartphone", label: "SINPE" },
                    ] as const
                  ).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setPayMethod(m.id)}
                      style={{
                        padding: "14px 10px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                        border:
                          payMethod === m.id
                            ? "2px solid hsl(var(--primary))"
                            : "1px solid hsl(var(--border))",
                        background:
                          payMethod === m.id
                            ? "hsl(var(--primary) / 0.08)"
                            : "hsl(var(--card))",
                        cursor: "pointer",
                        borderRadius: "calc(var(--radius) + 4px)",
                      }}
                    >
                      <Icon
                        name={m.icon}
                        size={22}
                        style={{
                          color:
                            payMethod === m.id
                              ? "hsl(var(--primary))"
                              : "hsl(var(--muted-foreground))",
                        }}
                      />
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{m.label}</span>
                    </button>
                  ))}
                </div>

                {payMethod === "cash" && (
                  <div style={{ marginBottom: 20 }}>
                    <label className="pp-label">Efectivo recibido</label>
                    <div style={{ position: "relative" }}>
                      <span
                        style={{
                          position: "absolute",
                          left: 14,
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "hsl(var(--muted-foreground))",
                          fontWeight: 600,
                        }}
                      >
                        ₡
                      </span>
                      <input
                        className="pp-input pp-input-lg"
                        type="number"
                        style={{
                          paddingLeft: 30,
                          fontSize: 20,
                          fontWeight: 700,
                          fontFamily: "var(--font-display)",
                        }}
                        value={cashGiven}
                        onChange={(e) => setCashGiven(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                      {[1000, 2000, 5000, 10000, 20000].map((v) => (
                        <button
                          key={v}
                          onClick={() => setCashGiven(String(v))}
                          className="btn btn-outline btn-xs"
                          style={{ flex: 1 }}
                        >
                          {v / 1000}k
                        </button>
                      ))}
                    </div>
                    {given > 0 && (
                      <Card
                        style={{ marginTop: 14, padding: 14, background: "hsl(var(--muted) / 0.5)" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 14,
                            marginBottom: 6,
                          }}
                        >
                          <span style={{ color: "hsl(var(--muted-foreground))" }}>Recibido</span>
                          <span className="t-num" style={{ fontWeight: 700 }}>
                            {fmt(given)}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 14,
                            marginBottom: 6,
                          }}
                        >
                          <span style={{ color: "hsl(var(--muted-foreground))" }}>Total</span>
                          <span className="t-num" style={{ fontWeight: 700 }}>
                            −{fmt(cartTotal)}
                          </span>
                        </div>
                        <div className="separator" style={{ margin: "8px 0" }} />
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span className="t-label" style={{ color: "hsl(var(--success))" }}>
                            Vuelto
                          </span>
                          <span
                            className="t-stat"
                            style={{ color: "hsl(var(--success))" }}
                          >
                            {fmt(change)}
                          </span>
                        </div>
                      </Card>
                    )}
                  </div>
                )}

                {payMethod === "card" && (
                  <Card
                    style={{
                      padding: 20,
                      marginBottom: 20,
                      textAlign: "center",
                      background: "hsl(var(--muted) / 0.4)",
                    }}
                  >
                    <div
                      className="icon-pill icon-pill-lg"
                      style={{
                        margin: "0 auto 10px",
                        background: "hsl(var(--info) / 0.15)",
                        color: "hsl(var(--info))",
                        width: 56,
                        height: 56,
                      }}
                    >
                      <Icon name="card" size={24} />
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                      Pasar tarjeta en el POS
                    </div>
                    <div className="t-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                      Monto a cobrar: {fmt(cartTotal)}
                    </div>
                  </Card>
                )}

                {payMethod === "sinpe" && (
                  <Card style={{ padding: 20, marginBottom: 20 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 10,
                      }}
                    >
                      <div
                        className="icon-pill"
                        style={{
                          background: "hsl(var(--success) / 0.12)",
                          color: "hsl(var(--success))",
                        }}
                      >
                        <Icon name="smartphone" size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>SINPE móvil</div>
                        <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                          Al 8888-1234 · Pollos Porteños S.A.
                        </div>
                      </div>
                    </div>
                    <label className="pp-label">Últimos 4 dígitos del SMS</label>
                    <input
                      className="pp-input pp-input-lg"
                      placeholder="0000"
                      maxLength={4}
                      value={sinpeCode}
                      onChange={(e) => setSinpeCode(e.target.value)}
                    />
                  </Card>
                )}

                <Button
                  variant="primary"
                  size="xl"
                  onClick={handleConfirmPayment}
                  style={{ width: "100%" }}
                  disabled={!canConfirm}
                >
                  <Icon name="check" size={18} /> Confirmar cobro {fmt(cartTotal)}
                </Button>
                <button
                  onClick={() => setCartStep("cart")}
                  className="btn btn-ghost btn-sm"
                  style={{ width: "100%", marginTop: 8 }}
                >
                  Volver a la orden
                </button>
              </div>
            )}

            {/* Step: done */}
            {cartStep === "done" && (
              <div style={{ padding: "32px 20px 28px", textAlign: "center" }}>
                <div
                  className="icon-pill icon-pill-lg"
                  style={{
                    margin: "0 auto 18px",
                    background: "hsl(var(--success) / 0.15)",
                    color: "hsl(var(--success))",
                    width: 72,
                    height: 72,
                  }}
                >
                  <Icon name="check" size={32} strokeWidth={3} />
                </div>
                <h3 className="t-h2" style={{ marginBottom: 6 }}>
                  ¡Venta registrada!
                </h3>
                <div
                  className="t-body"
                  style={{ color: "hsl(var(--muted-foreground))", marginBottom: 18 }}
                >
                  Orden #{orderNum} · {fmt(lastTotal)} en{" "}
                  {lastMethod === "cash"
                    ? "efectivo"
                    : lastMethod === "card"
                    ? "tarjeta"
                    : "SINPE"}
                </div>
                {lastMethod === "cash" && lastChange > 0 && (
                  <Card
                    style={{
                      padding: 14,
                      marginBottom: 20,
                      background: "hsl(var(--success) / 0.08)",
                      borderColor: "hsl(var(--success) / 0.3)",
                    }}
                  >
                    <div className="t-label" style={{ color: "hsl(var(--success))" }}>
                      Entregar vuelto
                    </div>
                    <div
                      className="t-stat-xl"
                      style={{ color: "hsl(var(--success))" }}
                    >
                      {fmt(lastChange)}
                    </div>
                  </Card>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <Button variant="outline" icon="print">
                    Imprimir
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setCartStep("cart");
                      closeCart();
                    }}
                  >
                    Nueva venta
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
