import { Card, CardTitle, CardDescription, Badge } from "@/components/ui";
import { ProductImage } from "@/components/ui/ProductImage";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Product } from "@/hooks/useProducts";

interface Branch {
  branch_id: string;
  name: string;
  code: number;
  type: "stand" | "restaurant";
  status: number;
}

interface InventoryTableProps {
  products: Product[];
  selectedBranches: Branch[];
  selectedProducts: Set<string>;
  inventory: Record<string, Record<string, number>>;
  toggleProduct: (productId: string) => void;
  setInventory: React.Dispatch<React.SetStateAction<Record<string, Record<string, number>>>>;
}

const fmt = (n: number) => "₡" + Math.round(Number(n) || 0).toLocaleString("es-CR");

const thStyle: React.CSSProperties = {
  padding: "12px 16px",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "hsl(var(--muted-foreground))",
  textAlign: "left",
  fontFamily: "var(--font-display)",
};

const tdStyle: React.CSSProperties = { padding: "14px 16px", fontSize: 13 };

export default function InventoryTable({
  products,
  selectedBranches,
  selectedProducts,
  inventory,
  toggleProduct,
  setInventory,
}: InventoryTableProps) {
  const { t } = useLanguage();

  const activeProducts = products.filter((p) => p.status === 1);

  return (
    <Card style={{ padding: 0 }}>
      <div
        style={{
          padding: "18px 24px",
          borderBottom: "1px solid hsl(var(--border))",
        }}
      >
        <CardTitle>{t("session.inventoryTitle")}</CardTitle>
        <CardDescription>{t("session.inventoryDesc")}</CardDescription>
      </div>

      {/* Desktop table layout */}
      <div className="inv-desktop" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "hsl(var(--muted) / 0.4)" }}>
              <th style={{ ...thStyle, width: 40 }}>
                <input
                  type="checkbox"
                  checked={selectedProducts.size === activeProducts.length && activeProducts.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      toggleProduct("__SELECT_ALL__");
                    } else {
                      toggleProduct("__DESELECT_ALL__");
                    }
                  }}
                />
              </th>
              <th style={thStyle}>Producto</th>
              {selectedBranches.map((b) => (
                <th key={b.branch_id} style={{ ...thStyle, textAlign: "center" }}>
                  {b.name}
                </th>
              ))}
              {selectedBranches.length === 0 && (
                <th style={{ ...thStyle, textAlign: "center" }}>
                  {t("session.selectFirst")}
                </th>
              )}
              <th style={{ ...thStyle, textAlign: "right" }}>{t("session.total")}</th>
            </tr>
          </thead>
          <tbody>
            {activeProducts.map((p) => {
              const needsInventory = p.track_inventory === true;
              const total = needsInventory
                ? selectedBranches.reduce(
                    (s, b) => s + (inventory[b.branch_id]?.[p.product_id] ?? 0),
                    0
                  )
                : 0;
              const isSelected = selectedProducts.has(p.product_id);

              return (
                <tr
                  key={p.product_id}
                  style={{
                    borderBottom: "1px solid hsl(var(--border))",
                    opacity: isSelected ? 1 : 0.5,
                  }}
                >
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleProduct(p.product_id)}
                    />
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <ProductImage imageUrl={p.image_url} name={p.name} size={32} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                        <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                          {fmt(p.price)}
                          {!needsInventory && (
                            <Badge variant="secondary" style={{ marginLeft: 6, fontSize: 9 }}>
                              {t("session.noInventoryTracking")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  {selectedBranches.map((b) => (
                    <td key={b.branch_id} style={{ ...tdStyle, textAlign: "center" }}>
                      {needsInventory ? (
                        <input
                          className="input input-sm t-num"
                          type="number"
                          min={0}
                          disabled={!isSelected}
                          style={{
                            width: 70,
                            margin: "0 auto",
                            textAlign: "center",
                            fontWeight: 700,
                            fontFamily: "var(--font-display)",
                            display: "block",
                          }}
                          value={inventory[b.branch_id]?.[p.product_id] ?? 0}
                          onChange={(e) =>
                            setInventory((inv) => ({
                              ...inv,
                              [b.branch_id]: {
                                ...inv[b.branch_id],
                                [p.product_id]: Number(e.target.value),
                              },
                            }))
                          }
                        />
                      ) : (
                        <span className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                          —
                        </span>
                      )}
                    </td>
                  ))}
                  {selectedBranches.length === 0 && (
                    <td
                      style={{
                        ...tdStyle,
                        textAlign: "center",
                        color: "hsl(var(--muted-foreground))",
                      }}
                    >
                      —
                    </td>
                  )}
                  <td
                    style={{
                      ...tdStyle,
                      textAlign: "right",
                      fontWeight: 800,
                      fontFamily: "var(--font-display)",
                    }}
                    className="t-num"
                  >
                    {needsInventory ? total : "—"}
                  </td>
                </tr>
              );
            })}
            {activeProducts.length === 0 && (
              <tr>
                <td
                  colSpan={selectedBranches.length + 3}
                  style={{
                    ...tdStyle,
                    textAlign: "center",
                    color: "hsl(var(--muted-foreground))",
                    padding: 32,
                  }}
                >
                  {t("session.noActiveProducts")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card layout */}
      <div className="inv-mobile">
        {activeProducts.length === 0 ? (
          <p
            className="t-sm"
            style={{
              color: "hsl(var(--muted-foreground))",
              textAlign: "center",
              padding: "24px 0",
            }}
          >
            {t("session.noActiveProducts")}
          </p>
        ) : (
          activeProducts.map((p) => {
            const needsInventory = p.track_inventory === true;
            const isSelected = selectedProducts.has(p.product_id);

            return (
              <div
                key={p.product_id}
                style={{
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 10,
                  overflow: "hidden",
                  opacity: isSelected ? 1 : 0.55,
                }}
              >
                {/* Card header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "12px 14px",
                    background: "hsl(var(--muted) / 0.35)",
                    borderBottom:
                      needsInventory && selectedBranches.length > 0
                        ? "1px solid hsl(var(--border))"
                        : undefined,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleProduct(p.product_id)}
                    style={{ flexShrink: 0 }}
                  />
                  <ProductImage imageUrl={p.image_url} name={p.name} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {p.name}
                    </div>
                    <div
                      className="t-xs"
                      style={{
                        color: "hsl(var(--muted-foreground))",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        flexWrap: "wrap",
                      }}
                    >
                      {fmt(p.price)}
                      {!needsInventory && (
                        <Badge variant="secondary" style={{ fontSize: 9 }}>
                          {t("session.noInventoryTracking")}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Branch quantity rows — only when inventory tracking is on */}
                {needsInventory && selectedBranches.length > 0 && (
                  <div>
                    {selectedBranches.map((b, bi) => (
                      <div
                        key={b.branch_id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "10px 14px",
                          borderBottom:
                            bi < selectedBranches.length - 1
                              ? "1px solid hsl(var(--border))"
                              : undefined,
                          gap: 10,
                        }}
                      >
                        <span
                          className="t-sm"
                          style={{ fontWeight: 500, color: "hsl(var(--muted-foreground))" }}
                        >
                          {b.name}
                        </span>
                        <input
                          className="input input-sm t-num"
                          type="number"
                          min={0}
                          disabled={!isSelected}
                          style={{
                            width: 80,
                            textAlign: "center",
                            fontWeight: 700,
                            fontFamily: "var(--font-display)",
                          }}
                          value={inventory[b.branch_id]?.[p.product_id] ?? 0}
                          onChange={(e) =>
                            setInventory((inv) => ({
                              ...inv,
                              [b.branch_id]: {
                                ...inv[b.branch_id],
                                [p.product_id]: Number(e.target.value),
                              },
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                )}

                {needsInventory && selectedBranches.length === 0 && (
                  <div style={{ padding: "10px 14px" }}>
                    <span className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {t("session.selectFirst")}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
