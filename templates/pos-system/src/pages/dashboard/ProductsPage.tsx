import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ROUTES } from "@/routePaths";
import { ordersApi, ordersOrgPath } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";
import { useConfirmModal } from "@/hooks/useConfirmModal";
import type { Product, Category } from "@/types";
import { Icon, Card, Button, EmptyState, Pagination } from "@/components/ui";
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
  const { confirm, ConfirmModal } = useConfirmModal();
  const [, navigate] = useLocation();

  const [view, setView] = useState<"grid" | "table">("grid");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [selected, setSelected] = useState<string[]>([]);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState("");
  const [drawerProduct, setDrawerProduct] = useState<Product | "new" | null>(null);
  const [form, setForm] = useState<ProductFormState>({ ...EMPTY_FORM });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [unitsPerBox, setUnitsPerBox] = useState("");
  const [saving, setSaving] = useState(false);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const { data: productsResponse, isLoading } = useQuery({
    queryKey: ["products", org?.id, search, page, pageSize],
    enabled: !!user && !!org,
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize), // Backend uses snake_case
        ...(search && { search }),
      });
      const result = await ordersApi.get<{ data: Product[] } | Product[]>(
        `${ordersOrgPath(org!.id, "/products")}?${params}`
      );
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
  const pagination = (productsResponse as any)?.pagination;
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

  const openNew = () => { setForm({ ...EMPTY_FORM }); setImageFile(null); setUnitsPerBox(""); setDrawerProduct("new"); };

  const openEdit = (p: Product) => {
    const hasCabys = !!(p.cabys?.trim());
    const hasTaxes = (p.taxes ?? []).length > 0;
    setForm({
      name: p.name,
      description: p.description ?? "",
      price: String(p.price),
      category_id: p.category_id ?? "",
      track_inventory: p.track_inventory ?? false,
      has_fiscal_info: hasCabys || hasTaxes,
      has_package_info: !!(p.units_per_box && p.units_per_box > 0),
      low_stock_threshold: p.low_stock_threshold ? String(p.low_stock_threshold) : "",
      cabys: p.cabys ?? "",
      cabysDescription: "",
      productTypeId: undefined,
      factoryTaxChargeId: undefined,
      hasFactoryTax: false,
      codes: (p.codes ?? []).map((c: any) => ({
        codeTypeId: Number(c.code_type_id),
        codeTypeCode: c.code_type_id,
        codeTypeDescription: "",
        value: c.number,
        reason: c.description,
      })),
      taxes: (p.taxes ?? []).map((t: any) => ({
        taxTypeId: t.tax_type_id,
        taxCode: t.tax_code ?? "",
        taxDescription: "",
        rate: t.rate,
        taxRateId: t.tax_rate?.id,
        taxFactorId: t.tax_factor?.id,
        specialFields: t.special_fields as any,
      })),
      discounts: (p.discounts ?? []).map((d: any, i: number) => ({
        id: `edit-${d.discount_type_id}-${i}`,
        discountTypeId: d.discount_type_id,
        discountCode: "",
        description: "",
        rate: d.percentage ?? d.rate,
        reason: d.reason,
      })),
    });
    setUnitsPerBox(p.units_per_box ? String(p.units_per_box) : "");
    setImageFile(null);
    setDrawerProduct(p);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        // Basic fields
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price: Number(form.price),
        category_id: form.category_id || undefined,
        track_inventory: form.track_inventory,
        low_stock_threshold: form.track_inventory && form.low_stock_threshold ? Number(form.low_stock_threshold) : undefined,
        
        // Packaging
        units_per_box: unitsPerBox ? Number(unitsPerBox) : undefined,
        
        // Fiscal - CABYS (backend expects object with code, name, type)
        cabys: form.cabys && form.productTypeId ? {
          code: form.cabys,
          name: form.cabysDescription || form.cabys,
          type: form.productTypeId,
        } : undefined,
        
        // Product codes (barcode, manufacturer, etc.)
        codes: form.codes.length > 0 ? form.codes.map(c => ({
          code_type_id: String(c.codeTypeId).padStart(2, '0'),
          number: c.value,
          description: c.reason || undefined,
        })) : undefined,
        
        // Taxes with full structure
        taxes: form.taxes.length > 0 ? form.taxes.map(t => ({
          tax_type_id: String(t.taxTypeId).padStart(2, '0'),
          tax_rate: t.taxRateId ? {
            id: String(t.taxRateId),
            percentage: t.rate,
          } : undefined,
          tax_factor: t.taxFactorId ? {
            id: String(t.taxFactorId),
            factor: 1, // Factor value is looked up by backend
          } : undefined,
          special_fields: t.specialFields ? {
            quantity: t.specialFields.quantity,
            percentage: t.specialFields.percentage,
            tax_amount: t.specialFields.taxAmountId ? {
              id: String(t.specialFields.taxAmountId),
              amount: 0, // Amount is looked up by backend
            } : undefined,
            volume_consumption: t.specialFields.volumeConsumption,
          } : undefined,
        })) : undefined,
        
        // Discounts with reason field
        discounts: form.discounts.length > 0 ? form.discounts.map(d => ({
          discount_type_id: String(d.discountTypeId).padStart(2, '0'),
          percentage: d.rate,
          reason: d.reason || undefined,
        })) : undefined,
      };
      
      // Image upload
      if (imageFile) {
        const data = await fileToBase64(imageFile);
        body.image = { data, name: imageFile.name, contentType: imageFile.type };
      }
      
      if (drawerProduct === "new") await createProduct.mutateAsync(body);
      else if (drawerProduct) await updateProduct.mutateAsync({ id: drawerProduct.product_id, body });
    } finally { setSaving(false); }
  };

  const categoryLabels = ["Todos", ...allCategories.map(c => c.name)];

  const filtered = products.filter((p) => {
    const matchCat = categoryFilter === "Todos" || p.category?.name === categoryFilter;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const toggleSelect = (id: string) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const toggleAll = () => setSelected((s) => s.length === filtered.length ? [] : filtered.map((p) => p.product_id));
  
  // Navigate to product detail page
  const goToDetail = (productId: string) => navigate(`${ROUTES.DASHBOARD_PRODUCTS}/${productId}`);
  
  // Handle status toggle with confirmation
  const handleToggleActive = (id: string, newStatus: number) => {
    const product = products.find(p => p.product_id === id);
    if (!product) return;
    
    const isActivating = newStatus === 1;
    confirm({
      title: isActivating ? t("products.activate") : t("products.deactivate"),
      message: isActivating 
        ? t("products.confirmActivate", { name: product.name }) || `¿Activar "${product.name}"?`
        : t("products.confirmDeactivate", { name: product.name }) || `¿Desactivar "${product.name}"?`,
      variant: isActivating ? "success" : "warning",
      confirmLabel: t("common.confirm") || "Confirmar",
      cancelLabel: t("common.cancel") || "Cancelar",
      onConfirm: async () => {
        await toggleActive.mutateAsync({ id, status: newStatus });
      },
    });
  };

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
            <input 
              className="pp-input" 
              style={{ paddingLeft: 36 }} 
              placeholder={t("products.searchPlaceholder")} 
              value={search} 
              onChange={(e) => { setSearch(e.target.value); setPage(1); }} 
            />
          </div>
          <select 
            className="pp-input" 
            value={categoryFilter} 
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} 
            style={{ width: 180 }}
          >
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
              onToggleActive={handleToggleActive}
              onNavigate={goToDetail}
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
              onToggleActive={handleToggleActive}
              onNavigate={goToDetail}
              {...priceEditorProps}
            />
          )}
        </>
      )}

      {/* Pagination */}
      {pagination && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.total_pages}
          totalElements={pagination.total_elements}
          pageSize={pagination.page_size} // Use backend's actual page_size
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          itemName="productos"
          pageSizeOptions={[12, 24, 48, 96]}
        />
      )}

      <ProductDrawerForm
        open={drawerProduct !== null}
        drawerProduct={drawerProduct}
        form={form}
        categories={allCategories}
        saving={saving}
        imageFile={imageFile}
        unitsPerBox={unitsPerBox}
        onClose={() => setDrawerProduct(null)}
        onFormChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
        onImageChange={setImageFile}
        onUnitsPerBoxChange={setUnitsPerBox}
        onSave={handleSave}
        onDelete={() => { if (drawerProduct && drawerProduct !== "new") deleteProduct.mutate(drawerProduct.product_id); }}
      />

      {/* Confirmation Modal */}
      <ConfirmModal />
    </div>
  );
}
