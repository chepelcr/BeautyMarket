import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ROUTES } from "@/routePaths";
import { ordersApi, ordersOrgPath } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";
import { useLanguage } from "@/contexts/LanguageContext";
import { useConfirmModal } from "@/hooks/useConfirmModal";
import type { Product, Category } from "@/types";
import { Card, Icon, Button, Badge, Menu } from "@/components/ui";
import { ProductDrawerForm, EMPTY_FORM, type ProductFormState } from "@/components/products/ProductDrawerForm";

// ─── Design tokens ─────────────────────────────────────────────────────────
const T = {
  surface: "hsl(var(--card))",
  border: "hsl(var(--border))",
  rose: "#D4A874",
  roseLight: "rgba(212,168,116,0.12)",
  roseBorder: "rgba(212,168,116,0.25)",
  text: "hsl(var(--foreground))",
  muted: "hsl(var(--muted-foreground))",
  fontDisplay: "'Cormorant Garamond', Georgia, serif",
  fontUI: "'DM Sans', 'Barlow', system-ui, sans-serif",
} as const;

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Info row ──────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 0", borderBottom: `1px solid ${T.border}` }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: T.roseLight, border: `1px solid ${T.roseBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name={icon} size={15} style={{ color: T.rose }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.07em", color: T.muted, fontFamily: T.fontUI, marginBottom: 1 }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: T.text, fontFamily: T.fontUI }}>{value}</div>
      </div>
    </div>
  );
}

// ─── Section card ──────────────────────────────────────────────────────────
function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <Card style={{ padding: "20px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <Icon name={icon} size={14} style={{ color: T.rose }} />
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: T.rose, fontFamily: T.fontUI }}>{title}</span>
      </div>
      {children}
    </Card>
  );
}

// ─── Main component ────────────────────────────────────────────────────────
interface Props {
  productId: string;
}

export default function ProductDetailPage({ productId }: Props) {
  const { user } = useAuthContext();
  const { useDefaultOrganization } = useOrganization();
  const { data: org } = useDefaultOrganization(user?.userId);
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const { t } = useLanguage();
  const { confirm, ConfirmModal } = useConfirmModal();

  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState<ProductFormState>({ ...EMPTY_FORM });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [unitsPerBox, setUnitsPerBox] = useState("");
  const [saving, setSaving] = useState(false);

  // Fetch product
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", org?.id, productId],
    enabled: !!org && !!productId,
    queryFn: async () => {
      const result = await ordersApi.get<Product>(ordersOrgPath(org!.id, `/products/${productId}`));
      return result;
    },
  });

  // Fetch categories for edit form
  const { data: categoriesResponse } = useQuery({
    queryKey: ["categories", org?.id],
    enabled: !!org,
    queryFn: () => ordersApi.get<{ data: Category[] } | Category[]>(ordersOrgPath(org!.id, "/categories")),
  });

  const allCategories: Category[] = Array.isArray(categoriesResponse) ? categoriesResponse : (categoriesResponse as any)?.data ?? [];

  const toggleActive = useMutation({
    mutationFn: ({ id, status }: { id: string; status: number }) =>
      ordersApi.patch(ordersOrgPath(org!.id, `/products/${id}/status`), { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["product", org?.id, productId] });
      qc.invalidateQueries({ queryKey: ["products", org?.id] });
    },
  });

  const updateProduct = useMutation({
    mutationFn: ({ id, body }: { id: string; body: object }) =>
      ordersApi.patch(ordersOrgPath(org!.id, `/products/${id}`), body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["product", org?.id, productId] });
      qc.invalidateQueries({ queryKey: ["products", org?.id] });
      setEditOpen(false);
    },
  });

  const deleteProduct = useMutation({
    mutationFn: (id: string) =>
      ordersApi.patch(ordersOrgPath(org!.id, `/products/${id}/status`), { status: 3 }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products", org?.id] });
      navigate(ROUTES.DASHBOARD_PRODUCTS);
    },
  });

  const isActive = product?.status === 1;
  const hasDescription = !!(product?.description?.trim());
  const hasCategory = !!(product?.category);
  const hasInventory = product?.track_inventory;
  const hasFiscalInfo = !!(product?.cabys || (product?.taxes && product.taxes.length > 0));
  const hasDiscounts = !!(product?.discounts && product.discounts.length > 0);

  const openEdit = () => {
    if (!product) return;
    const hasCabys = !!(product.cabys?.trim());
    const hasTaxes = (product.taxes ?? []).length > 0;
    setForm({
      name: product.name,
      description: product.description ?? "",
      price: String(product.price),
      category_id: product.category_id ?? "",
      track_inventory: product.track_inventory ?? false,
      has_fiscal_info: hasCabys || hasTaxes,
      has_package_info: !!(product.units_per_box && product.units_per_box > 0),
      low_stock_threshold: product.low_stock_threshold ? String(product.low_stock_threshold) : "",
      cabys: product.cabys ?? "",
      cabysDescription: "",
      productTypeId: undefined,
      factoryTaxChargeId: undefined,
      hasFactoryTax: false,
      codes: (product.codes ?? []).map((c: any) => ({
        codeTypeId: Number(c.code_type_id),
        codeTypeCode: c.code_type_id,
        codeTypeDescription: "",
        value: c.number,
        reason: c.description,
      })),
      taxes: (product.taxes ?? []).map((t: any) => ({
        taxTypeId: t.tax_type_id,
        taxCode: t.tax_code ?? "",
        taxDescription: "",
        rate: t.rate,
        taxRateId: t.tax_rate?.id,
        taxFactorId: t.tax_factor?.id,
        specialFields: t.special_fields as any,
      })),
      discounts: (product.discounts ?? []).map((d: any, i: number) => ({
        id: `edit-${d.discount_type_id}-${i}`,
        discountTypeId: d.discount_type_id,
        discountCode: "",
        description: "",
        rate: d.percentage ?? d.rate,
        reason: d.reason,
      })),
    });
    setUnitsPerBox(product.units_per_box ? String(product.units_per_box) : "");
    setImageFile(null);
    setEditOpen(true);
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
        track_inventory: form.track_inventory,
        low_stock_threshold: form.track_inventory && form.low_stock_threshold ? Number(form.low_stock_threshold) : undefined,
        units_per_box: unitsPerBox ? Number(unitsPerBox) : undefined,
        cabys: form.cabys && form.productTypeId ? {
          code: form.cabys,
          name: form.cabysDescription || form.cabys,
          type: form.productTypeId,
        } : undefined,
        codes: form.codes.length > 0 ? form.codes.map(c => ({
          code_type_id: String(c.codeTypeId).padStart(2, '0'),
          number: c.value,
          description: c.reason || undefined,
        })) : undefined,
        taxes: form.taxes.length > 0 ? form.taxes.map(t => ({
          tax_type_id: String(t.taxTypeId).padStart(2, '0'),
          tax_rate: t.taxRateId ? {
            id: String(t.taxRateId),
            percentage: t.rate,
          } : undefined,
          tax_factor: t.taxFactorId ? {
            id: String(t.taxFactorId),
            factor: 1,
          } : undefined,
          special_fields: t.specialFields ? {
            quantity: t.specialFields.quantity,
            percentage: t.specialFields.percentage,
            tax_amount: t.specialFields.taxAmountId ? {
              id: String(t.specialFields.taxAmountId),
              amount: 0,
            } : undefined,
            volume_consumption: t.specialFields.volumeConsumption,
          } : undefined,
        })) : undefined,
        discounts: form.discounts.length > 0 ? form.discounts.map(d => ({
          discount_type_id: String(d.discountTypeId).padStart(2, '0'),
          percentage: d.rate,
          reason: d.reason || undefined,
        })) : undefined,
      };

      if (imageFile) {
        const data = await fileToBase64(imageFile);
        body.image = { data, name: imageFile.name, contentType: imageFile.type };
      }

      await updateProduct.mutateAsync({ id: productId, body });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = () => {
    if (!product) return;
    const newStatus = isActive ? 2 : 1;
    confirm({
      title: isActive ? t("products.deactivate") : t("products.activate"),
      message: isActive
        ? t("products.confirmDeactivate", { name: product.name }) || `¿Desactivar "${product.name}"?`
        : t("products.confirmActivate", { name: product.name }) || `¿Activar "${product.name}"?`,
      variant: isActive ? "warning" : "success",
      confirmLabel: t("common.confirm") || "Confirmar",
      cancelLabel: t("common.cancel") || "Cancelar",
      onConfirm: async () => {
        await toggleActive.mutateAsync({ id: productId, status: newStatus });
      },
    });
  };

  const handleDelete = () => {
    if (!product) return;
    confirm({
      title: t("products.delete") || "Eliminar producto",
      message: t("products.confirmDelete", { name: product.name }) || `¿Estás seguro de eliminar "${product.name}"? Esta acción no se puede deshacer.`,
      variant: "destructive",
      confirmLabel: t("common.delete") || "Eliminar",
      cancelLabel: t("common.cancel") || "Cancelar",
      onConfirm: async () => {
        await deleteProduct.mutateAsync(productId);
      },
    });
  };

  if (isLoading) {
    return (
      <div style={{ padding: "48px 24px", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
        <Icon name="refresh" size={18} style={{ color: T.muted, animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: "48px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 14, color: T.muted, fontFamily: T.fontUI }}>Producto no encontrado.</div>
        <button onClick={() => navigate(ROUTES.DASHBOARD_PRODUCTS)} style={{ marginTop: 16, color: T.rose, background: "none", border: "none", cursor: "pointer", fontSize: 13, fontFamily: T.fontUI }}>
          ← Volver a productos
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 24px 48px", maxWidth: 900, margin: "0 auto" }}>
      {/* Back button */}
      <button
        onClick={() => navigate(ROUTES.DASHBOARD_PRODUCTS)}
        className="t-body"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "hsl(var(--muted-foreground))", background: "none", border: "none", cursor: "pointer", marginBottom: 20, padding: "6px 0" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(var(--foreground))")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(var(--muted-foreground))")}
      >
        <Icon name="arrowLeft" size={14} /> Productos
      </button>

      {/* Hero card */}
      <Card style={{ padding: "28px 28px 24px", marginBottom: 14, background: `linear-gradient(135deg, ${T.roseLight} 0%, transparent 60%)`, borderColor: T.roseBorder }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
          {/* Product Image */}
          <div style={{ width: 100, height: 100, borderRadius: 16, background: product.image_url ? "transparent" : T.roseLight, border: `1px solid ${T.roseBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <Icon name="package" size={36} style={{ color: T.rose }} />
            )}
          </div>

          {/* Name + meta */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="t-h1" style={{ margin: "0 0 6px", lineHeight: 1.2 }}>
              {product.name}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
              <span className="t-h2" style={{ color: T.rose }}>
                ₡{product.price.toLocaleString("es-CR")}
              </span>
              <Badge variant={isActive ? "success" : "secondary"}>
                {isActive ? "● Activo" : "○ Inactivo"}
              </Badge>
              {hasCategory && (
                <span style={{ background: T.roseLight, color: T.rose, border: `1px solid ${T.roseBorder}`, padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 700, fontFamily: T.fontUI }}>
                  {product.category?.name}
                </span>
              )}
            </div>
            {hasDescription && (
              <p className="t-body" style={{ color: "hsl(var(--muted-foreground))", margin: 0, lineHeight: 1.5 }}>
                {product.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <Button variant="outline" size="sm" icon="edit" onClick={openEdit}>
              Editar
            </Button>
            <div onClick={(e) => e.stopPropagation()}>
              <Menu
                align="right"
                items={[
                  {
                    label: isActive ? "Desactivar producto" : "Activar producto",
                    icon: isActive ? "xCircle" : "checkCircle",
                    action: handleToggleActive,
                  },
                  {
                    label: "Eliminar producto",
                    icon: "trash",
                    action: handleDelete,
                    variant: "destructive",
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Info sections */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
        {/* Basic Info */}
        <Section title="Información básica" icon="info">
          <InfoRow icon="dollarSign" label="Precio" value={`₡${product.price.toLocaleString("es-CR")}`} />
          {hasCategory && <InfoRow icon="tag" label="Categoría" value={product.category!.name} />}
          {product.sku && <InfoRow icon="barcode" label="SKU" value={product.sku} />}
        </Section>

        {/* Inventory */}
        {hasInventory && (
          <Section title="Inventario" icon="package">
            <InfoRow icon="layers" label="Cantidad en stock" value={product.stock_quantity ?? 0} />
            {product.low_stock_threshold && (
              <InfoRow icon="alertTriangle" label="Umbral de stock bajo" value={product.low_stock_threshold} />
            )}
            {product.units_per_box && (
              <InfoRow icon="box" label="Unidades por caja" value={product.units_per_box} />
            )}
          </Section>
        )}

        {/* Fiscal Info */}
        {hasFiscalInfo && (
          <Section title="Información fiscal" icon="fileText">
            {product.cabys && <InfoRow icon="hash" label="Código CABYS" value={product.cabys} />}
            {product.taxes && product.taxes.length > 0 && (
              <InfoRow icon="percent" label="Impuestos" value={`${product.taxes.length} configurado(s)`} />
            )}
          </Section>
        )}

        {/* Discounts */}
        {hasDiscounts && (
          <Section title="Descuentos" icon="tag">
            <InfoRow icon="percent" label="Descuentos configurados" value={product.discounts!.length} />
          </Section>
        )}
      </div>

      {/* Empty state if no additional info */}
      {!hasInventory && !hasFiscalInfo && !hasDiscounts && (
        <Card style={{ padding: "32px 24px", textAlign: "center", marginTop: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: T.roseLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
            <Icon name="package" size={20} style={{ color: T.rose }} />
          </div>
          <div className="t-body" style={{ color: "hsl(var(--muted-foreground))" }}>
            Sin información adicional registrada.
          </div>
          <button onClick={openEdit} className="t-body" style={{ marginTop: 10, color: T.rose, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
            Agregar información →
          </button>
        </Card>
      )}

      {/* Edit Drawer */}
      <ProductDrawerForm
        open={editOpen}
        drawerProduct={product}
        form={form}
        categories={allCategories}
        saving={saving}
        imageFile={imageFile}
        unitsPerBox={unitsPerBox}
        onClose={() => setEditOpen(false)}
        onFormChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
        onImageChange={setImageFile}
        onUnitsPerBoxChange={setUnitsPerBox}
        onSave={handleSave}
        onDelete={handleDelete}
      />

      {/* Confirmation Modal */}
      <ConfirmModal />
    </div>
  );
}
