import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi, ordersOrgPath } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";
import type { Product } from "@/types";
import { Icon, Card, Badge, Button, EmptyState } from "@/components/ui";

const fmt = (n: number) => "₡" + Math.round(Number(n) || 0).toLocaleString("es-CR");

export default function ProductsPage() {
  const { user } = useAuthContext();
  const { useDefaultOrganization } = useOrganization();
  const { data: org } = useDefaultOrganization(user?.userId);
  const qc = useQueryClient();

  const [view, setView] = useState<"grid" | "table">("grid");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const [selected, setSelected] = useState<string[]>([]);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState("");

  const { data: productsResponse, isLoading } = useQuery({
    queryKey: ["products", org?.id],
    enabled: !!user && !!org,
    queryFn: async () => {
      const result = await ordersApi.get<{ data: Product[] } | Product[]>(
        ordersOrgPath(org!.id, "/products")
      );
      if (Array.isArray(result)) return { data: result, pagination: null };
      return result;
    },
  });

  const products: Product[] = (productsResponse as any)?.data ?? [];

  const updatePrice = useMutation({
    mutationFn: ({ id, price }: { id: string; price: number }) =>
      ordersApi.patch(ordersOrgPath(org!.id, `/products/${id}`), { price }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products", org?.id] });
      setEditingPrice(null);
    },
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, status }: { id: string; status: number }) =>
      ordersApi.patch(ordersOrgPath(org!.id, `/products/${id}`), { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products", org?.id] }),
  });

  const categories = ["Todos", ...Array.from(new Set(products.map((p) => p.category?.name ?? "Sin categoría")))];

  const filtered = products.filter((p) => {
    const matchCat = category === "Todos" || p.category?.name === category;
    const matchSearch =
      !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const toggleSelect = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const toggleAll = () =>
    setSelected((s) => (s.length === filtered.length ? [] : filtered.map((p) => p.product_id)));

  const lowStock = (p: Product) =>
    (p.stock_quantity ?? 0) > 0 && (p.stock_quantity ?? 0) <= 5;

  return (
    <div style={{ padding: "24px 24px 40px", maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1 className="t-h1" style={{ marginBottom: 6 }}>
            Catálogo
          </h1>
          <p className="t-body" style={{ color: "hsl(var(--muted-foreground))" }}>
            Productos compartidos por todas las sucursales.
          </p>
        </div>
        <Button variant="primary" icon="plus">
          Nuevo producto
        </Button>
      </div>

      {/* Toolbar */}
      <Card style={{ padding: 14, marginBottom: 14 }}>
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative", flex: "1 1 280px" }}>
            <Icon
              name="search"
              size={15}
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
              style={{ paddingLeft: 36 }}
              placeholder="Buscar por nombre…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="pp-input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ width: 180 }}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <div className="tabs">
            <button
              className="tab"
              aria-selected={view === "grid"}
              onClick={() => setView("grid")}
            >
              <Icon name="grid" size={12} /> Tarjetas
            </button>
            <button
              className="tab"
              aria-selected={view === "table"}
              onClick={() => setView("table")}
            >
              <Icon name="sort" size={12} /> Tabla
            </button>
          </div>
        </div>

        {selected.length > 0 && (
          <div
            style={{
              marginTop: 12,
              padding: "10px 14px",
              background: "hsl(var(--primary) / 0.08)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span className="t-sm" style={{ fontWeight: 700 }}>
              {selected.length} seleccionados
            </span>
            <div style={{ flex: 1 }} />
            <Button variant="outline" size="xs" icon="eye">
              Activar
            </Button>
            <Button variant="outline" size="xs" icon="eyeOff">
              Desactivar
            </Button>
            <Button variant="outline" size="xs" icon="trash">
              Eliminar
            </Button>
          </div>
        )}
      </Card>

      {isLoading ? (
        <div className="t-body" style={{ color: "hsl(var(--muted-foreground))", padding: 24 }}>
          Cargando…
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="package"
          title="No hay productos"
          description="No se encontraron productos con esos filtros."
        />
      ) : (
        <>
          {/* Grid view */}
          {view === "grid" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 14,
              }}
            >
              {filtered.map((p) => (
                <Card
                  key={p.product_id}
                  hoverable
                  style={{
                    padding: 0,
                    overflow: "hidden",
                    opacity: p.status !== 0 ? 1 : 0.6,
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <div
                      className="product-image-placeholder"
                      style={{
                        fontSize: 56,
                        borderRadius: 0,
                        aspectRatio: "1/1",
                      }}
                    >
                      {p.emoji}
                    </div>
                    <div style={{ position: "absolute", top: 8, left: 8 }}>
                      <input
                        type="checkbox"
                        checked={selected.includes(p.product_id)}
                        onChange={() => toggleSelect(p.product_id)}
                        style={{
                          width: 18,
                          height: 18,
                          accentColor: "hsl(var(--primary))",
                          cursor: "pointer",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        display: "flex",
                        gap: 4,
                      }}
                    >
                      {p.status === 0 && (
                        <Badge variant="secondary">Inactivo</Badge>
                      )}
                      {lowStock(p) && (
                        <Badge variant="warning">Stock {p.stock_quantity}</Badge>
                      )}
                    </div>
                  </div>
                  <div style={{ padding: 14 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          lineHeight: 1.2,
                        }}
                      >
                        {p.name}
                      </div>
                      <Badge
                        variant="outline"
                        style={{ flexShrink: 0, fontSize: 9 }}
                      >
                        {p.category?.name ?? "—"}
                      </Badge>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: 10,
                      }}
                    >
                      {editingPrice === p.product_id ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <input
                            type="number"
                            value={priceInput}
                            onChange={(e) => setPriceInput(e.target.value)}
                            autoFocus
                            className="pp-input pp-input-sm"
                            style={{ width: 90 }}
                          />
                          <button
                            className="btn btn-success btn-xs"
                            onClick={() =>
                              updatePrice.mutate({ id: p.product_id, price: Number(priceInput) })
                            }
                          >
                            <Icon name="check" size={12} />
                          </button>
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => setEditingPrice(null)}
                          >
                            <Icon name="close" size={12} />
                          </button>
                        </div>
                      ) : (
                        <button
                          className="t-stat"
                          style={{
                            fontSize: 20,
                            color: "hsl(var(--primary))",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontFamily: "var(--font-display)",
                            fontWeight: 800,
                          }}
                          onClick={() => {
                            setEditingPrice(p.product_id);
                            setPriceInput(String(p.price));
                          }}
                        >
                          {fmt(p.price)}
                        </button>
                      )}
                      <Button
                        variant="ghost"
                        size="xs"
                        icon={p.status === 1 ? "eye" : "eyeOff"}
                        onClick={() =>
                          toggleActive.mutate({
                            id: p.product_id,
                            status: p.status === 1 ? 0 : 1,
                          })
                        }
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Table view */}
          {view === "table" && (
            <Card style={{ padding: 0 }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "hsl(var(--muted) / 0.4)" }}>
                      <th
                        className="pp-th"
                        style={{ width: 40 }}
                      >
                        <input
                          type="checkbox"
                          checked={
                            selected.length === filtered.length &&
                            filtered.length > 0
                          }
                          onChange={toggleAll}
                          style={{ accentColor: "hsl(var(--primary))" }}
                        />
                      </th>
                      <th className="pp-th">Producto</th>
                      <th className="pp-th">Categoría</th>
                      <th className="pp-th" style={{ textAlign: "right" }}>
                        Precio
                      </th>
                      <th className="pp-th" style={{ textAlign: "center" }}>
                        Estado
                      </th>
                      <th className="pp-th" style={{ width: 80 }} />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p, i) => (
                      <tr
                        key={p.product_id}
                        style={{
                          borderBottom:
                            i < filtered.length - 1
                              ? "1px solid hsl(var(--border))"
                              : "none",
                        }}
                      >
                        <td className="pp-td">
                          <input
                            type="checkbox"
                            checked={selected.includes(p.product_id)}
                            onChange={() => toggleSelect(p.product_id)}
                            style={{ accentColor: "hsl(var(--primary))" }}
                          />
                        </td>
                        <td className="pp-td">
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <div
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 6,
                                background: "hsl(var(--muted))",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 18,
                              }}
                            >
                              {p.emoji}
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 700 }}>
                              {p.name}
                            </div>
                          </div>
                        </td>
                        <td className="pp-td">
                          <Badge variant="outline">
                            {p.category?.name ?? "—"}
                          </Badge>
                        </td>
                        <td
                          className="pp-td t-num"
                          style={{ textAlign: "right" }}
                        >
                          {editingPrice === p.product_id ? (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                                gap: 6,
                              }}
                            >
                              <input
                                type="number"
                                value={priceInput}
                                onChange={(e) => setPriceInput(e.target.value)}
                                autoFocus
                                className="pp-input pp-input-sm"
                                style={{ width: 90 }}
                              />
                              <button
                                className="btn btn-success btn-xs"
                                onClick={() =>
                                  updatePrice.mutate({
                                    id: p.product_id,
                                    price: Number(priceInput),
                                  })
                                }
                              >
                                <Icon name="check" size={12} />
                              </button>
                              <button
                                className="btn btn-ghost btn-xs"
                                onClick={() => setEditingPrice(null)}
                              >
                                <Icon name="close" size={12} />
                              </button>
                            </div>
                          ) : (
                            <button
                              style={{
                                fontWeight: 700,
                                fontFamily: "var(--font-display)",
                                color: "hsl(var(--primary))",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                fontSize: 13,
                              }}
                              onClick={() => {
                                setEditingPrice(p.product_id);
                                setPriceInput(String(p.price));
                              }}
                            >
                              {fmt(p.price)}
                            </button>
                          )}
                        </td>
                        <td
                          className="pp-td"
                          style={{ textAlign: "center" }}
                        >
                          <Badge
                            variant={p.status === 1 ? "success" : "secondary"}
                          >
                            {p.status === 1 ? "Activo" : "Inactivo"}
                          </Badge>
                        </td>
                        <td className="pp-td">
                          <div
                            style={{
                              display: "flex",
                              gap: 4,
                              justifyContent: "flex-end",
                            }}
                          >
                            <Button
                              variant="ghost"
                              size="xs"
                              icon={p.status === 1 ? "eyeOff" : "eye"}
                              onClick={() =>
                                toggleActive.mutate({
                                  id: p.product_id,
                                  status: p.status === 1 ? 0 : 1,
                                })
                              }
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div
                style={{
                  padding: "14px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: "1px solid hsl(var(--border))",
                }}
              >
                <div
                  className="t-sm"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                >
                  Mostrando{" "}
                  <strong className="t-num">{filtered.length}</strong> de{" "}
                  <strong className="t-num">{products.length}</strong>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
