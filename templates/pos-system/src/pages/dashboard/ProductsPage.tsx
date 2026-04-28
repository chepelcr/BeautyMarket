import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi, ordersOrgPath } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";
import type { Product, Category } from "@/types";
import {
  Icon, Card, Badge, Button, EmptyState, Drawer,
} from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import { ProductImage } from "@/components/ui/ProductImage";
import { ImagePicker } from "@/components/ui/ImagePicker";

const fmt = (n: number) => "₡" + Math.round(Number(n) || 0).toLocaleString("es-CR");

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  category_id: "",
  sku: "",
  track_inventory: false,
  low_stock_threshold: "",
};

export default function ProductsPage() {
  const { user } = useAuthContext();
  const { useDefaultOrganization } = useOrganization();
  const { data: org } = useDefaultOrganization(user?.userId);
  const qc = useQueryClient();

  const [view, setView] = useState<"grid" | "table">("grid");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [selected, setSelected] = useState<string[]>([]);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState("");

  // Drawer state: null = closed, "new" = create, Product = edit
  const [drawerProduct, setDrawerProduct] = useState<Product | null | "new">(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const { t } = useLanguage();

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

  const { data: categoriesResponse } = useQuery({
    queryKey: ["categories", org?.id],
    enabled: !!org,
    queryFn: () =>
      ordersApi.get<{ data: Category[] } | Category[]>(
        ordersOrgPath(org!.id, "/categories")
      ),
  });

  const products: Product[] = (productsResponse as any)?.data ?? [];
  const allCategories: Category[] =
    Array.isArray(categoriesResponse)
      ? categoriesResponse
      : (categoriesResponse as any)?.data ?? [];

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
      ordersApi.patch(ordersOrgPath(org!.id, `/products/${id}/status`), { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products", org?.id] }),
  });

  const createProduct = useMutation({
    mutationFn: (body: object) =>
      ordersApi.post(ordersOrgPath(org!.id, "/products"), body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products", org?.id] });
      setDrawerProduct(null);
    },
  });

  const updateProduct = useMutation({
    mutationFn: ({ id, body }: { id: string; body: object }) =>
      ordersApi.patch(ordersOrgPath(org!.id, `/products/${id}`), body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products", org?.id] });
      setDrawerProduct(null);
    },
  });

  const deleteProduct = useMutation({
    mutationFn: (id: string) =>
      ordersApi.patch(ordersOrgPath(org!.id, `/products/${id}/status`), { status: 3 }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products", org?.id] });
      setDrawerProduct(null);
      setSelected([]);
    },
  });

  const openNew = () => {
    setForm({ ...EMPTY_FORM });
    setImageFile(null);
    setDrawerProduct("new");
  };

  const openEdit = (p: Product) => {
    setForm({
      name: p.name,
      description: p.description ?? "",
      price: String(p.price),
      category_id: p.category_id ?? "",
      sku: p.sku ?? "",
      track_inventory: false,
      low_stock_threshold: "",
    });
    setImageFile(null);
    setDrawerProduct(p);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price: Number(form.price),
        category_id: form.category_id || undefined,
        sku: form.sku.trim() || undefined,
        track_inventory: form.track_inventory,
        low_stock_threshold:
          form.track_inventory && form.low_stock_threshold
            ? Number(form.low_stock_threshold)
            : undefined,
      };
      if (imageFile) {
        const data = await fileToBase64(imageFile);
        body.image = {
          data,
          name: imageFile.name,
          contentType: imageFile.type,
        };
      }
      if (drawerProduct === "new") {
        await createProduct.mutateAsync(body);
      } else if (drawerProduct) {
        await updateProduct.mutateAsync({ id: drawerProduct.product_id, body });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleBulkDelete = async () => {
    for (const id of selected) {
      await deleteProduct.mutateAsync(id);
    }
  };

  const categoryLabels = [
    "Todos",
    ...Array.from(new Set(products.map((p) => p.category?.name ?? "Sin categoría"))),
  ];

  const filtered = products.filter((p) => {
    const matchCat =
      categoryFilter === "Todos" || p.category?.name === categoryFilter;
    const matchSearch =
      !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const toggleSelect = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const toggleAll = () =>
    setSelected((s) =>
      s.length === filtered.length ? [] : filtered.map((p) => p.product_id)
    );

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
            {t("products.title")}
          </h1>
          <p className="t-body" style={{ color: "hsl(var(--muted-foreground))" }}>
            {t("products.subtitle")}
          </p>
        </div>
        <Button variant="primary" icon="plus" onClick={openNew}>
          {t("products.newProduct")}
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
              placeholder={t("products.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="pp-input"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ width: 180 }}
          >
            {categoryLabels.map((c) => (
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
              <Icon name="grid" size={12} /> {t("products.cards")}
            </button>
            <button
              className="tab"
              aria-selected={view === "table"}
              onClick={() => setView("table")}
            >
              <Icon name="sort" size={12} /> {t("products.table")}
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
              {t("products.selected", { n: String(selected.length) })}
            </span>
            <div style={{ flex: 1 }} />
            <Button variant="outline" size="xs" icon="eye">
              {t("common.activate")}
            </Button>
            <Button variant="outline" size="xs" icon="eyeOff">
              {t("common.deactivate")}
            </Button>
            <Button
              variant="outline"
              size="xs"
              icon="trash"
              onClick={handleBulkDelete}
            >
              {t("common.delete")}
            </Button>
          </div>
        )}
      </Card>

      {isLoading ? (
        <div className="t-body" style={{ color: "hsl(var(--muted-foreground))", padding: 24 }}>
          {t("products.loading")}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="package"
          title={t("products.noProducts")}
          description={t("products.noResults")}
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
                    <ProductImage
                      imageUrl={p.image_url}
                      name={p.name}
                      size={0}
                      style={{
                        width: "100%",
                        height: "auto",
                        aspectRatio: "1/1",
                        borderRadius: 0,
                        objectFit: "cover",
                      }}
                    />
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
                        <Badge variant="secondary">{t("products.inactive")}</Badge>
                      )}
                      {lowStock(p) && (
                        <Badge variant="warning">{t("products.stock", { n: String(p.stock_quantity) })}</Badge>
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
                      <div style={{ display: "flex", gap: 4 }}>
                        <Button
                          variant="ghost"
                          size="xs"
                          icon="edit"
                          onClick={() => openEdit(p)}
                        />
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
                      <th className="pp-th" style={{ width: 40 }}>
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
                      <th className="pp-th">{t("products.product")}</th>
                      <th className="pp-th">{t("products.category")}</th>
                      <th className="pp-th" style={{ textAlign: "right" }}>
                        {t("products.price")}
                      </th>
                      <th className="pp-th" style={{ textAlign: "center" }}>
                        {t("products.status")}
                      </th>
                      <th className="pp-th" style={{ width: 100 }} />
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
                            <ProductImage
                              imageUrl={p.image_url}
                              name={p.name}
                              size={36}
                            />
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
                            {p.status === 1 ? t("products.activeLabel") : t("products.inactiveLabel")}
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
                              icon="edit"
                              onClick={() => openEdit(p)}
                            />
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
                  {t("products.showing", { n: String(filtered.length), total: String(products.length) })}
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Create / Edit Drawer */}
      <Drawer
        open={drawerProduct !== null}
        onClose={() => setDrawerProduct(null)}
        title={drawerProduct === "new" ? t("products.newProduct") : t("products.editProduct")}
        subtitle={drawerProduct !== "new" && drawerProduct ? drawerProduct.name : undefined}
        icon="package"
        width="min(420px, 100vw)"
        footer={
          <div
            style={{
              padding: "16px 24px",
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            {drawerProduct !== "new" && (
              <Button
                variant="ghost"
                size="sm"
                icon="trash"
                onClick={() => {
                  if (drawerProduct) {
                    deleteProduct.mutate(drawerProduct.product_id);
                  }
                }}
                style={{ color: "hsl(var(--destructive))" }}
              >
                {t("common.delete")}
              </Button>
            )}
            <div style={{ flex: 1 }} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDrawerProduct(null)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={saving || !form.name.trim() || !form.price}
            >
              {saving ? t("common.saving") : t("common.save")}
            </Button>
          </div>
        }
      >
        <div
          style={{
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
              {/* Imagen */}
              <div>
                <label className="pp-label">{t("products.image")}</label>
                <ImagePicker
                  currentUrl={
                    drawerProduct !== "new" && drawerProduct !== null ? (drawerProduct.image_url ?? undefined) : undefined
                  }
                  onFileChange={setImageFile}
                  size={100}
                />
              </div>

              {/* Nombre */}
              <div>
                <label className="pp-label">
                  {t("products.name")}{" "}
                  <span style={{ color: "hsl(var(--destructive))" }}>*</span>
                </label>
                <input
                  className="pp-input"
                  placeholder={t("products.namePlaceholder")}
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="pp-label">{t("products.description")}</label>
                <textarea
                  className="pp-input"
                  rows={3}
                  placeholder={t("products.descriptionPlaceholder")}
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  style={{ resize: "vertical" }}
                />
              </div>

              {/* Precio */}
              <div>
                <label className="pp-label">
                  {t("products.priceLabel")}{" "}
                  <span style={{ color: "hsl(var(--destructive))" }}>*</span>
                </label>
                <input
                  type="number"
                  className="pp-input"
                  placeholder="0"
                  min={0}
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: e.target.value }))
                  }
                />
              </div>

              {/* Categoría */}
              <div>
                <label className="pp-label">{t("products.categoryLabel")}</label>
                <select
                  className="pp-input"
                  value={form.category_id}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category_id: e.target.value }))
                  }
                >
                  <option value="">{t("products.noCategory")}</option>
                  {allCategories.map((c) => (
                    <option key={c.category_id} value={c.category_id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* SKU */}
              <div>
                <label className="pp-label">{t("products.sku")}</label>
                <input
                  className="pp-input"
                  placeholder={t("products.internalCode")}
                  value={form.sku}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sku: e.target.value }))
                  }
                />
              </div>

              {/* Rastrear inventario */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  background: "hsl(var(--muted) / 0.4)",
                  borderRadius: 8,
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                    {t("products.trackInventory")}
                  </div>
                  <div
                    className="t-xs"
                    style={{ color: "hsl(var(--muted-foreground))" }}
                  >
                    {t("products.trackInventoryDesc")}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={form.track_inventory}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, track_inventory: e.target.checked }))
                  }
                  style={{
                    width: 18,
                    height: 18,
                    accentColor: "hsl(var(--primary))",
                    cursor: "pointer",
                  }}
                />
              </div>

              {/* Stock mínimo (condicional) */}
              {form.track_inventory && (
                <div>
                  <label className="pp-label">{t("products.minStockLabel")}</label>
                  <input
                    type="number"
                    className="pp-input"
                    placeholder={t("products.minStockPlaceholder")}
                    min={0}
                    value={form.low_stock_threshold}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        low_stock_threshold: e.target.value,
                      }))
                    }
                  />
                </div>
              )}
            </div>
          </Drawer>
    </div>
  );
}
