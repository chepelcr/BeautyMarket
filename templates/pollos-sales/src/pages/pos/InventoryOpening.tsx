import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api, orgPath } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import { db } from "@/lib/db";
import { useInventory } from "@/store/inventory";
import type { Product } from "@/hooks/useProducts";

interface InventoryOpeningProps {
  products: Product[];
  assignmentId: string;
  onDone: () => void;
}

export default function InventoryOpening({
  products,
  assignmentId,
  onDone,
}: InventoryOpeningProps) {
  const { user, org } = useAuthContext();
  const setOpeningStock = useInventory((s) => s.setOpeningStock);
  const [counts, setCounts] = useState<Record<number, string>>({});

  const mutation = useMutation({
    mutationFn: async () => {
      const items = products.map((p) => ({
        productId: p.id,
        quantity: Number(counts[p.id]) || 0,
      }));

      // Store locally
      for (const item of items) {
        setOpeningStock(item.productId, item.quantity);
        await db.inventory.put({
          productId: item.productId,
          assignmentId,
          openingStock: item.quantity,
          currentStock: item.quantity,
        });
      }

      // Sync to backend
      await api.post(orgPath(user!.userId, org!.id, "/inventory/opening"), {
        assignmentId,
        items,
      });
    },
    onSuccess: onDone,
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-4 py-3 bg-surface border-b border-surface-border shrink-0">
        <div className="font-barlow font-extrabold text-xl text-foreground">
          📦 Apertura de Inventario
        </div>
        <div className="text-muted text-xs mt-0.5">
          Contá las unidades disponibles antes de empezar
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {products.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-3 bg-surface border border-surface-border rounded-xl px-4 py-3"
          >
            <span className="text-2xl">{p.emoji}</span>
            <span className="flex-1 font-barlow font-bold text-foreground">
              {p.name}
            </span>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={counts[p.id] ?? ""}
              onChange={(e) =>
                setCounts((c) => ({ ...c, [p.id]: e.target.value }))
              }
              className="w-20 px-3 py-2 bg-surface-high border border-surface-border rounded-lg text-foreground font-barlow font-bold text-xl text-center outline-none focus:border-primary"
            />
          </div>
        ))}
      </div>

      <div className="p-4 bg-surface border-t border-surface-border shrink-0">
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="w-full py-4 bg-primary text-white rounded-xl font-barlow font-extrabold text-xl disabled:opacity-50"
        >
          {mutation.isPending ? "Guardando..." : "✓ INICIAR TURNO"}
        </button>
        {mutation.isError && (
          <p className="text-destructive text-sm text-center mt-2 font-barlow">
            Error al guardar. Intentá de nuevo.
          </p>
        )}
      </div>
    </div>
  );
}
