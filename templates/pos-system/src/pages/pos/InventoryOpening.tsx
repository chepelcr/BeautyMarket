import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api, orgPath } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";
import { db } from "@/lib/db";
import { useInventory } from "@/store/inventory";
import type { Product } from "@/types";
import { Icon, Card, Button, SyncPill } from "@/components/ui";

const fmt = (n: number) => "₡" + Math.round(n).toLocaleString("es-CR");

interface InventoryOpeningProps {
  products: Product[];
  assignmentId: string;
  onDone: () => void;
  puestoName?: string;
  sessionName?: string;
  sessionTime?: string;
  onExit?: () => void;
}

export default function InventoryOpening({
  products,
  assignmentId,
  onDone,
  puestoName = "Puesto",
  sessionName = "Sesión activa",
  sessionTime,
  onExit,
}: InventoryOpeningProps) {
  const { user } = useAuthContext();
  const { useDefaultOrganization } = useOrganization();
  const { data: org } = useDefaultOrganization(user?.userId);
  const setOpeningStock = useInventory((s) => s.setOpeningStock);

  const [counts, setCounts] = useState<Record<string, string>>({});
  const [cash, setCash] = useState("25000");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const activeProducts = products.filter((p) => p.status === 1);
  const filledCount = activeProducts.filter((p) => counts[p.product_id] !== "" && counts[p.product_id] !== undefined).length;
  const totalProducts = activeProducts.length;
  const progress = totalProducts > 0 ? (filledCount / totalProducts) * 100 : 0;
  const allDone = filledCount === totalProducts && totalProducts > 0 && cash !== "";
  const totalValue = activeProducts.reduce(
    (s, p) => s + (Number(counts[p.product_id]) || 0) * p.price,
    0,
  );

  const adjustCount = (id: string, delta: number) => {
    setCounts((c) => ({ ...c, [id]: String(Math.max(0, (Number(c[id]) || 0) + delta)) }));
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const items = activeProducts.map((p) => ({
        productId: p.product_id,
        quantity: Number(counts[p.product_id]) || 0,
      }));

      for (const item of items) {
        setOpeningStock(parseInt(item.productId, 10), item.quantity);
        await db.inventory.put({
          productId: parseInt(item.productId, 10),
          assignmentId,
          openingStock: item.quantity,
          currentStock: item.quantity,
        });
      }

      await api.post(orgPath(user!.userId, org!.id, "/inventory/opening"), {
        assignmentId,
        items,
        initialCash: Number(cash) || 0,
      });
    },
    onSuccess: () => {
      setConfirmOpen(false);
      onDone();
    },
  });

  return (
    <div
      style={{
        maxWidth: 440,
        margin: "0 auto",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "hsl(var(--background))",
      }}
    >
      {/* Nav bar */}
      <div
        className="nav-bar"
        style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}
      >
        <button
          className="btn btn-ghost btn-sm btn-icon"
          onClick={onExit}
          aria-label="Volver"
        >
          <Icon name="arrowLeft" size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <div className="t-label" style={{ fontSize: 10 }}>
            Apertura de turno
          </div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Conteo inicial</div>
        </div>
        <SyncPill state="online" />
      </div>

      {/* Context card */}
      <div style={{ padding: "16px 16px 0" }}>
        <Card style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div
              className="icon-pill icon-pill-lg"
              style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
            >
              <Icon name="unlock" size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{puestoName}</div>
              <div className="t-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                {sessionName}{sessionTime ? ` · ${sessionTime}` : ""}
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <div className="t-label">Progreso</div>
            <div className="t-sm" style={{ fontWeight: 700 }}>
              <span className="t-num">{filledCount}</span>/
              <span className="t-num">{totalProducts}</span> productos
            </div>
          </div>
          <div className="progress">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>
        </Card>
      </div>

      {/* Cash input */}
      <div style={{ padding: "14px 16px 0" }}>
        <Card style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div
              className="icon-pill"
              style={{ background: "hsl(var(--success) / 0.12)", color: "hsl(var(--success))" }}
            >
              <Icon name="cash" size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Efectivo inicial</div>
              <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                Fondo entregado por el gerente
              </div>
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                color: "hsl(var(--muted-foreground))",
                fontWeight: 700,
                fontSize: 18,
              }}
            >
              ₡
            </span>
            <input
              className="pp-input pp-input-lg"
              type="number"
              style={{
                paddingLeft: 30,
                fontSize: 22,
                fontWeight: 700,
                fontFamily: "var(--font-display)",
              }}
              value={cash}
              onChange={(e) => setCash(e.target.value)}
              placeholder="0"
            />
          </div>
        </Card>
      </div>

      {/* Product list */}
      <div style={{ flex: 1, padding: "14px 16px 100px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <h3 className="t-label">Productos · contar unidades</h3>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {activeProducts.map((p) => {
            const val = counts[p.product_id];
            const filled = val !== "" && val !== null;
            return (
              <Card
                key={p.product_id}
                style={{
                  padding: 12,
                  borderColor: filled
                    ? "hsl(var(--success) / 0.4)"
                    : "hsl(var(--border))",
                  transition: "border-color .2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 10,
                      background: "hsl(var(--muted))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 26,
                      flexShrink: 0,
                    }}
                  >
                    {p.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{p.name}</div>
                    <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                      SKU {p.sku} · {fmt(p.price)}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      background: "hsl(var(--muted))",
                      borderRadius: 10,
                      padding: 2,
                    }}
                  >
                    <button
                      className="btn btn-ghost btn-sm btn-icon"
                      onClick={() => adjustCount(p.product_id, -1)}
                      aria-label="Restar"
                    >
                      <Icon name="minus" size={14} />
                    </button>
                    <input
                      className="t-num"
                      type="number"
                      value={val}
                      onChange={(e) =>
                        setCounts((c) => ({ ...c, [p.product_id]: e.target.value }))
                      }
                      style={{
                        width: 48,
                        textAlign: "center",
                        fontSize: 16,
                        fontWeight: 800,
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        fontFamily: "var(--font-display)",
                      }}
                      placeholder="0"
                    />
                    <button
                      className="btn btn-ghost btn-sm btn-icon"
                      onClick={() => adjustCount(p.product_id, 1)}
                      aria-label="Sumar"
                    >
                      <Icon name="plus" size={14} />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Fixed footer */}
      <div
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
        <div
          style={{
            maxWidth: 440,
            margin: "0 auto",
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
        >
          <div style={{ flex: 1 }}>
            <div className="t-label" style={{ fontSize: 10 }}>
              Valor inventario
            </div>
            <div className="t-stat" style={{ fontSize: 20 }}>
              {fmt(totalValue)}
            </div>
          </div>
          <Button
            variant="primary"
            size="xl"
            disabled={!allDone}
            onClick={() => setConfirmOpen(true)}
            style={{ flex: 1.2 }}
          >
            <Icon name="check" size={16} /> Abrir turno
          </Button>
        </div>
      </div>

      {/* Confirm modal */}
      {confirmOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={() => setConfirmOpen(false)}
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }}
          />
          <Card
            className="fade-up"
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 360,
              padding: 22,
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <div
              className="icon-pill icon-pill-lg"
              style={{
                margin: "0 auto 14px",
                background: "hsl(var(--success) / 0.15)",
                color: "hsl(var(--success))",
                width: 60,
                height: 60,
              }}
            >
              <Icon name="checkCircle" size={26} />
            </div>
            <h3 className="t-h2" style={{ marginBottom: 6 }}>
              Confirmar apertura
            </h3>
            <p
              className="t-sm"
              style={{ color: "hsl(var(--muted-foreground))", marginBottom: 16 }}
            >
              Al confirmar, el turno queda abierto y no podés cambiar el conteo inicial.
            </p>
            <Card
              style={{
                padding: 12,
                marginBottom: 14,
                background: "hsl(var(--muted) / 0.5)",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  marginBottom: 6,
                }}
              >
                <span style={{ color: "hsl(var(--muted-foreground))" }}>Productos</span>
                <span style={{ fontWeight: 700 }} className="t-num">
                  {totalProducts} items
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  marginBottom: 6,
                }}
              >
                <span style={{ color: "hsl(var(--muted-foreground))" }}>Efectivo inicial</span>
                <span style={{ fontWeight: 700 }} className="t-num">
                  {fmt(Number(cash) || 0)}
                </span>
              </div>
              <div
                style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}
              >
                <span style={{ color: "hsl(var(--muted-foreground))" }}>Valor en stock</span>
                <span style={{ fontWeight: 700 }} className="t-num">
                  {fmt(totalValue)}
                </span>
              </div>
            </Card>
            {mutation.isError && (
              <p className="t-sm" style={{ color: "hsl(var(--destructive))", marginBottom: 12 }}>
                Error al guardar. Intentá de nuevo.
              </p>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                disabled={mutation.isPending}
                onClick={() => mutation.mutate()}
              >
                {mutation.isPending ? "Guardando…" : "Confirmar"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
