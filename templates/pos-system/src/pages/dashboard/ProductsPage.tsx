import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi, ordersOrgPath } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";
import type { Product, Category } from "@/types";
import { Icon, Card, Button, EmptyState } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import { ProductGridView } from "@/components/products/ProductGridView";
import { ProductTableView } from "@/components/products/ProductTableView";
import { ProductBulkBar } from "@/components/products/ProductBulkBar";
import { ProductDrawerForm, EMPTY_FORM, type ProductFormState } from "@/components/products/ProductDrawerForm";

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ProductsPage() {
  const { user } = useAuthContext();
  const { useDefaultOrganization } = useOrganization();
  const { data: org } = useDefaultOrganization(user?.userId);
  const qc = useQueryClient();
  const { t } = useLanguage();

  const [view, setView] = useState<"grid" | "table">("grid");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [selected, setSelected] = useState<string[]>([]);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState("");
  const [drawerProduct, setDrawerProduct] = useState<Product | "new" | null>(null);
  const [form, setForm] = useState<ProductFormState>({ ...EMPTY_FORM });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: productsResponse, isLoading } = useQuery({
    queryKey: ["products", org?.id],
    enabled: !!user && !!org,
    queryFn: async () => {
      const result = await ordersApi.get<{ data: Product[] } | Product[]>(ordersOrgPath(org!.id, "/products"));
      if (Array.isArray(result)) return { data: result, pagination: null };
      return result;
    },
  });

  const { data: categoriesResponse } = useQuery({
    queryKey: ["categories", org?.id],
    enabled: !!org,
    queryFn: () => ordersApi.get<{ data: Category[] } | Category[]>(ordersOrgPath(org!.id, "/categories")),
  });

  const products: Product[] = (productsResponse as any)?.data ?? [];
  const allCategories: Category[] = Array.isArray(categoriesResponse) ? categoriesResponse : (categoriesResponse as any)?.data ?? [];

  const updatePrice = useMutation({
    mutationFn: ({ id, price }: { id: string; price: number }) =>
      ordersApi.patch(ordersOrgPath(org!.id, `/products/${id}`), { price }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["products", org?.id] }); setEditingPrice(null); },
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, status }: { id: string; status: number }) =>
      ordersApi.patch(ordersOrgPath(org!.id, `/products/${id}/status`), { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products", org?.id] }),
  });

  const createProduct = useMutation({
    mutationFn: (body: object) => ordersApi.post(ordersOrgPath(org!.id, "/products"), body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["products", org?.id] }); setDrawerProduct(null); },
  });

  const updateProduct = useMutation({
    mutationFn: ({ id, body }: { id: string; body: object }) =>
      ordersApi.patch(ordersOrgPath(org!.id, `/products/${id}`), body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["products", org?.id] }); setDrawerProduct(null); },
  });

  const deleteProduct = useMutation({
    mutationFn: (id: string) =>
      ordersApi.patch(ordersOrgPath(org!.id, `/products/${id}/status`), { status: 3 }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["products", org?.id] }); setDrawerProduct(null); setSelected([]); },
  });

  const openNew = () => { setForm({ ...EMPTY_FORM }); setImageFile(null); setDrawerProduct("new"); };

  const openEdit = (p: Product) => {
    const hasCabys = !!(p.cabys?.trim());
    const hasTaxes = (p.taxes ?? []).length > 0;
    setForm({
      name: p.name,
      description: p.description ?? "",
      price: String(p.price),
      category_id: p.category_id ?? "",
      sku: p.sku ?? "",
      track_inventory: p.track_inventory ?? false,
      has_fiscal_info: hasCabys || hasTaxes,
      has_package_info: false,
      low_stock_threshold: "",
      cabys: p.cabys ?? "",
      cabysDescription: "",
      factoryTaxChargeId: undefined,
      hasFactoryTax: false,
      codes: [],
      taxes: (p.taxes ?? []).map(t => ({
        taxTypeId: t.tax_type_id,
        taxCode: t.tax_code ?? "",
        taxDescription: "",
        rate: t.rate,
        specialFields: t.special_fields as any,
      })),
      discounts: (p.discounts ?? []).map((d, i) => ({
        id: `edit-${d.discount_type_id}-${i}`,
        discountTypeId: d.discount_type_id,
        discountCode: "",
        description: "",
        rate: d.rate,
      })),
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
        low_stock_threshold: form.track_inventory && form.low_stock_threshold ? Number(form.low_stock_threshold) : undefined,
        cabys: form.cabys.trim() || undefined,
        taxes: form.taxes.length > 0 ? form.taxes.map(t => ({
          tax_type_id: t.taxTypeId,
          rate: t.rate,
          special_fields: t.specialFields ?? null,
        })) : undefined,
        discounts: form.discounts.length > 0 ? form.discounts.map(d => ({
          discount_type_id: d.discountTypeId,
          rate: d.rate,
        })) : undefined,
      };
      if (imageFile) {
        const data = await fileToBase64(imageFile);
        body.image = { data, name: imageFile.name, contentType: imageFile.type };
      }
      if (drawerProduct === "new") await createProduct.mutateAsync(body);
      else if (drawerProduct) await updateProduct.mutateAsync({ id: drawerProduct.product_id, body });
    } finally { setSaving(false); }
  };

  const categoryLabels = ["Todos", ...Array.from(new Set(products.map((p) => p.category?.name ?? "Sin categoría")))];

  const filtered = products.filter((p) => {
    const matchCat = categoryFilter === "Todos" || p.category?.name === categoryFilter;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const toggleSelect = (id: string) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const toggleAll = () => setSelected((s) => s.length === filtered.length ? [] : filtered.map((p) => p.product_id));

  const priceEditorProps = {
    editingPrice,
    priceInput,
    onStartEditPrice: (id: string, price: number) => { setEditingPrice(id); setPriceInput(String(price)); },
    onPriceInputChange: setPriceInput,
    onSavePrice: (id: string, price: number) => updatePrice.mutate({ id, price }),
    onCancelEditPrice: () => setEditingPrice(null),
  };

  return (
    <div style={{ padding: "24px 24px 40px", maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="t-h1" style={{ marginBottom: 6 }}>{t("products.title")}</h1>
          <p className="t-body" style={{ color: "hsl(var(--muted-foreground))" }}>{t("products.subtitle")}</p>
        </div>
        <Button variant="primary" icon="plus" onClick={openNew}>{t("products.newProduct")}</Button>
      </div>

      {/* Toolbar */}
      <Card style={{ padding: 14, marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 280px" }}>
            <Icon name="search" size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "hsl(var(--muted-foreground))" }} />
            <input className="pp-input" style={{ paddingLeft: 36 }} placeholder={t("products.searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="pp-input" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ width: 180 }}>
            {categoryLabels.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="tabs">
            <button className="tab" aria-selected={view === "grid"} onClick={() => setView("grid")}>
              <Icon name="grid" size={12} /> {t("products.cards")}
            </button>
            <button className="tab" aria-selected={view === "table"} onClick={() => setView("table")}>
              <Icon name="sort" size={12} /> {t("products.table")}
            </button>
          </div>
        </div>
        {selected.length > 0 && (
          <ProductBulkBar count={selected.length} onDelete={async () => { for (const id of selected) await deleteProduct.mutateAsync(id); }} />
        )}
      </Card>

      {isLoading ? (
        <div className="t-body" style={{ color: "hsl(var(--muted-foreground))", padding: 24 }}>{t("products.loading")}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="package" title={t("products.noProducts")} description={t("products.noResults")} />
      ) : (
        <>
          {view === "grid" && (
            <ProductGridView
              products={filtered}
              selected={selected}
              onToggleSelect={toggleSelect}
              onEdit={openEdit}
              onToggleActive={(id, status) => toggleActive.mutate({ id, status })}
              {...priceEditorProps}
            />
          )}
          {view === "table" && (
            <ProductTableView
              products={filtered}
              allProducts={products}
              selected={selected}
              onToggleSelect={toggleSelect}
              onToggleAll={toggleAll}
              onEdit={openEdit}
              onToggleActive={(id, status) => toggleActive.mutate({ id, status })}
              {...priceEditorProps}
            />
          )}
        </>
      )}

      <ProductDrawerForm
        open={drawerProduct !== null}
        drawerProduct={drawerProduct}
        form={form}
        categories={allCategories}
        saving={saving}
        imageFile={imageFile}
        onClose={() => setDrawerProduct(null)}
        onFormChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
        onImageChange={setImageFile}
        onSave={handleSave}
        onDelete={() => { if (drawerProduct && drawerProduct !== "new") deleteProduct.mutate(drawerProduct.product_id); }}
      />
    </div>
  );
}
