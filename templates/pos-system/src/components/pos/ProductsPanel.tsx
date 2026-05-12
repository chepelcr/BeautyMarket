import { useState, useCallback } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { ProductImage } from "@/components/ui/ProductImage";
import { FadeIn } from "@/components/ui/FadeIn";
import { ProductGridSkeleton } from "./ProductGridSkeleton";
import { POS } from "@/theme/pos";
import type { Product } from "@/types";

const fmt = (n: number) => "₡" + Math.round(n).toLocaleString("es-CR");

interface CartItem { id: string; qty: number; }

interface ProductsPanelProps {
  orgId: string;
  cartItems: CartItem[];
  isDesktop: boolean;
  onAdd: (product: Product) => void;
}

export function ProductsPanel({ orgId, cartItems, isDesktop, onAdd }: ProductsPanelProps) {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);

  const { data: productsResp, isLoading } = useProducts({
    search,
    category_id: categoryId,
    page,
    page_size: isDesktop ? 24 : 12,
  });

  const { data: categoriesResp } = useCategories(orgId);

  const products = productsResp?.data ?? [];
  const pagination = productsResp?.pagination;
  const categories = categoriesResp?.data ?? [];

  const handleCategoryChange = useCallback((id: string) => {
    setCategoryId(id);
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((v: string) => {
    setSearch(v);
    setPage(1);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Search + categories */}
      <div style={{ padding: "16px 20px 12px", flexShrink: 0, borderBottom: `1px solid ${POS.border}` }}>
        <div style={{ position: "relative", marginBottom: 12 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: POS.muted, display: "flex", alignItems: "center", pointerEvents: "none" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </span>
          <input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar producto..."
            style={{
              width: "100%",
              padding: "10px 14px 10px 38px",
              background: "rgba(255,255,255,0.06)",
              border: `1px solid ${POS.border}`,
              borderRadius: 10,
              color: POS.text,
              fontFamily: POS.fontUI,
              fontSize: 14,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
        {categories.length > 0 && (
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
            <button
              onClick={() => handleCategoryChange("")}
              style={{
                flexShrink: 0,
                padding: "6px 14px",
                borderRadius: 20,
                border: !categoryId ? `1.5px solid ${POS.rose}` : `1px solid ${POS.border}`,
                background: !categoryId ? POS.roseLight : "transparent",
                color: !categoryId ? POS.rose : POS.muted,
                fontFamily: POS.fontUI,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Todo
            </button>
            {categories.map((c) => (
              <button
                key={c.category_id}
                onClick={() => handleCategoryChange(c.category_id)}
                style={{
                  flexShrink: 0,
                  padding: "6px 14px",
                  borderRadius: 20,
                  border: categoryId === c.category_id ? `1.5px solid ${POS.rose}` : `1px solid ${POS.border}`,
                  background: categoryId === c.category_id ? POS.roseLight : "transparent",
                  color: categoryId === c.category_id ? POS.rose : POS.muted,
                  fontFamily: POS.fontUI,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
        {isLoading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isDesktop ? "repeat(auto-fill, minmax(160px, 1fr))" : "repeat(2, 1fr)",
              gap: 12,
            }}
          >
            {Array.from({ length: isDesktop ? 12 : 6 }).map((_, i) => (
              <ProductGridSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 48, color: POS.muted, fontFamily: POS.fontUI }}>
            Sin productos
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isDesktop ? "repeat(auto-fill, minmax(160px, 1fr))" : "repeat(2, 1fr)",
              gap: 12,
            }}
          >
            {products.map((p, i) => {
              const lowStock = (p.stock_quantity ?? 0) > 0 && (p.stock_quantity ?? 0) <= 5;
              const inCart = cartItems.find((c) => c.id === p.product_id);
              return (
                <FadeIn key={p.product_id} delay={i * 0.02} duration={0.3}>
                  <button
                    onClick={() => onAdd(p)}
                    style={{
                      padding: 0,
                      textAlign: "left",
                      display: "flex",
                      flexDirection: "column",
                      cursor: "pointer",
                      font: "inherit",
                      background: inCart ? POS.roseDim : POS.card,
                      border: inCart ? `1.5px solid ${POS.rose}` : `1px solid ${POS.border}`,
                      borderRadius: 12,
                      overflow: "hidden",
                      transition: "transform .1s, border-color .1s",
                      width: "100%",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "none"; }}
                  >
                    <ProductImage
                      imageUrl={p.image_url}
                      name={p.name ?? ""}
                      size={0}
                      style={{ width: "100%", height: "auto", aspectRatio: "4/3", objectFit: "cover" }}
                    />
                    <div style={{ padding: "10px 12px 12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 4 }}>
                        <div style={{ fontFamily: POS.fontUI, fontWeight: 600, fontSize: 13, color: POS.text, lineHeight: 1.3 }}>
                          {p.name}
                        </div>
                        {lowStock && (
                          <span style={{ background: "rgba(255,159,10,0.2)", color: "#FF9F0A", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 20, flexShrink: 0, fontFamily: POS.fontUI }}>
                            {p.stock_quantity}
                          </span>
                        )}
                      </div>
                      <div style={{ fontFamily: POS.fontDisplay, fontSize: 20, fontWeight: 600, color: POS.rose, marginTop: 4 }}>
                        {fmt(p.price ?? 0)}
                      </div>
                      {inCart && (
                        <div style={{ fontFamily: POS.fontUI, fontSize: 10, color: POS.rose, marginTop: 2 }}>
                          × {inCart.qty} en carrito
                        </div>
                      )}
                    </div>
                  </button>
                </FadeIn>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "12px 20px",
            borderTop: `1px solid ${POS.border}`,
            flexShrink: 0,
          }}
        >
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              border: `1px solid ${POS.border}`,
              background: "transparent",
              color: page <= 1 ? POS.muted : POS.text,
              fontFamily: POS.fontUI,
              fontSize: 13,
              cursor: page <= 1 ? "default" : "pointer",
              opacity: page <= 1 ? 0.4 : 1,
            }}
          >
            ←
          </button>
          <span style={{ fontFamily: POS.fontUI, fontSize: 12, color: POS.muted }}>
            {page} / {pagination.total_pages}
          </span>
          <button
            disabled={page >= pagination.total_pages}
            onClick={() => setPage((p) => p + 1)}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              border: `1px solid ${POS.border}`,
              background: "transparent",
              color: page >= pagination.total_pages ? POS.muted : POS.text,
              fontFamily: POS.fontUI,
              fontSize: 13,
              cursor: page >= pagination.total_pages ? "default" : "pointer",
              opacity: page >= pagination.total_pages ? 0.4 : 1,
            }}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
