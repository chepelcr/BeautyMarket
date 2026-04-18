import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, orgPath } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import { fmt } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Product } from "@/hooks/useProducts";

type Category = "Todos" | "Comida" | "Bebida";

export default function ProductsPage() {
  const { user, org } = useAuthContext();
  const qc = useQueryClient();
  const [category, setCategory] = useState<Category>("Todos");
  const [editingPrice, setEditingPrice] = useState<number | null>(null);
  const [priceInput, setPriceInput] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", emoji: "🍔", price: "", category: "Comida" });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", org?.id],
    enabled: !!user && !!org,
    queryFn: () => api.get<Product[]>(orgPath(user!.userId, org!.id, "/products")),
  });

  const updatePrice = useMutation({
    mutationFn: ({ id, price }: { id: number; price: number }) =>
      api.patch(orgPath(user!.userId, org!.id, `/products/${id}`), { price }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products", org?.id] });
      setEditingPrice(null);
    },
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      api.patch(orgPath(user!.userId, org!.id, `/products/${id}`), { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products", org?.id] }),
  });

  const createProduct = useMutation({
    mutationFn: () =>
      api.post(orgPath(user!.userId, org!.id, "/products"), {
        name: newProduct.name,
        emoji: newProduct.emoji,
        price: Number(newProduct.price),
        category: newProduct.category,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products", org?.id] });
      setShowNew(false);
      setNewProduct({ name: "", emoji: "🍔", price: "", category: "Comida" });
    },
  });

  const filtered = category === "Todos" ? products : products.filter((p) => p.category === category);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-barlow font-extrabold text-2xl text-foreground tracking-wide">
          🛒 PRODUCTOS
        </h2>
        <button
          onClick={() => setShowNew(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg font-barlow font-bold text-sm"
        >
          + Nuevo
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2">
        {(["Todos", "Comida", "Bebida"] as Category[]).map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              "px-4 py-2 rounded-lg font-barlow font-bold text-sm transition-colors",
              category === c ? "bg-primary text-white" : "bg-surface border border-surface-border text-muted"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {/* New product form */}
      {showNew && (
        <div className="bg-surface border border-primary/40 rounded-2xl p-5 flex flex-col gap-3">
          <div className="font-barlow font-bold text-foreground">Nuevo producto</div>
          <div className="flex gap-3">
            <input value={newProduct.emoji} onChange={(e) => setNewProduct((p) => ({ ...p, emoji: e.target.value }))}
              className="w-16 px-3 py-2 bg-surface-high border border-surface-border rounded-lg text-foreground text-2xl text-center outline-none" />
            <input value={newProduct.name} onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))}
              placeholder="Nombre" className="flex-1 px-3 py-2 bg-surface-high border border-surface-border rounded-lg text-foreground font-barlow outline-none focus:border-primary" />
          </div>
          <div className="flex gap-3">
            <input type="number" value={newProduct.price} onChange={(e) => setNewProduct((p) => ({ ...p, price: e.target.value }))}
              placeholder="Precio ₡" className="flex-1 px-3 py-2 bg-surface-high border border-surface-border rounded-lg text-foreground font-barlow outline-none focus:border-primary" />
            <select value={newProduct.category} onChange={(e) => setNewProduct((p) => ({ ...p, category: e.target.value }))}
              className="flex-1 px-3 py-2 bg-surface-high border border-surface-border rounded-lg text-foreground font-barlow outline-none">
              <option>Comida</option>
              <option>Bebida</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowNew(false)} className="flex-1 py-2 bg-surface-high border border-surface-border rounded-lg font-barlow font-bold text-muted">Cancelar</button>
            <button onClick={() => createProduct.mutate()} disabled={createProduct.isPending}
              className="flex-1 py-2 bg-primary text-white rounded-lg font-barlow font-bold disabled:opacity-50">
              {createProduct.isPending ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      )}

      {/* Products table */}
      {isLoading ? (
        <div className="text-muted font-barlow animate-pulse">Cargando...</div>
      ) : (
        <div className="bg-surface border border-surface-border rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="text-left px-4 py-3 text-xs text-muted font-barlow tracking-widest">PRODUCTO</th>
                <th className="text-left px-4 py-3 text-xs text-muted font-barlow tracking-widest">CATEGORÍA</th>
                <th className="text-right px-4 py-3 text-xs text-muted font-barlow tracking-widest">PRECIO</th>
                <th className="text-center px-4 py-3 text-xs text-muted font-barlow tracking-widest">ACTIVO</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-surface-border last:border-0 hover:bg-surface-high transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{p.emoji}</span>
                      <span className="font-barlow font-bold text-foreground">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted text-sm font-barlow">{p.category}</td>
                  <td className="px-4 py-3 text-right">
                    {editingPrice === p.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <input
                          type="number"
                          value={priceInput}
                          onChange={(e) => setPriceInput(e.target.value)}
                          autoFocus
                          className="w-28 px-2 py-1 bg-surface-high border border-primary rounded-lg text-foreground font-barlow text-right outline-none"
                        />
                        <button onClick={() => updatePrice.mutate({ id: p.id, price: Number(priceInput) })}
                          className="text-success text-sm font-bold">✓</button>
                        <button onClick={() => setEditingPrice(null)} className="text-muted text-sm">✕</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditingPrice(p.id); setPriceInput(String(p.price)); }}
                        className="text-primary font-barlow font-bold hover:underline"
                      >
                        {fmt(p.price)}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleActive.mutate({ id: p.id, isActive: !p.isActive })}
                      className={cn(
                        "w-10 h-6 rounded-full transition-colors relative",
                        p.isActive ? "bg-success" : "bg-surface-border"
                      )}
                    >
                      <span className={cn(
                        "absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform",
                        p.isActive ? "translate-x-4" : "translate-x-0.5"
                      )} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
