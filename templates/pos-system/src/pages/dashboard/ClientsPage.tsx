import { useState } from "react";
import { useLocation } from "wouter";
import { ROUTES } from "@/routePaths";
import { useOrgContext } from "@/contexts/OrgContext";
import { useClients, type Client } from "@/hooks/useClients";
import { ClientCard } from "@/components/clients/ClientCard";
import { ClientSkeletonCard } from "@/components/clients/ClientSkeletonCard";
import { ClientDrawerForm } from "@/components/clients/ClientDrawerForm";
import { Icon, Button } from "@/components/ui";
import { POS as T } from "@/theme/pos";

export default function ClientsPage() {
  const { orgId } = useOrgContext();
  const [, navigate] = useLocation();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const { data: listData, isLoading } = useClients(orgId, { search: search || undefined, page, page_size: 24 });
  const clients = listData?.data ?? [];
  const pagination = listData?.pagination;

  const goToDetail = (clientId: string) => navigate(`${ROUTES.DASHBOARD_CLIENTS}/${clientId}`);
  const openCreate = () => { setEditingClient(null); setDrawerOpen(true); };
  const openEdit = (c: Client) => { setEditingClient(c); setDrawerOpen(true); };

  return (
    <div style={{ padding: "24px 24px 48px", maxWidth: 1300, margin: "0 auto", fontFamily: T.fontUI }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 700, fontFamily: T.fontDisplay, color: T.text, margin: "0 0 4px" }}>Clientes</h1>
          <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>
            {pagination ? `${pagination.total_elements} clientes registrados` : "Directorio de clientes"}
          </p>
        </div>
        <Button variant="primary" size="sm" icon="userPlus" onClick={openCreate}>Nuevo cliente</Button>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 24, maxWidth: 400 }}>
        <Icon name="search" size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: T.muted, pointerEvents: "none" }} />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Buscar por nombre, razón social, cédula…"
          style={{ width: "100%", padding: "10px 12px 10px 36px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, color: T.text, fontSize: 13, fontFamily: T.fontUI, outline: "none", boxSizing: "border-box" }}
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(265px, 1fr))", gap: 14 }}>
          {Array.from({ length: 8 }).map((_, i) => <ClientSkeletonCard key={i} />)}
        </div>
      ) : clients.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 20px" }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: T.roseLight, border: `1px solid ${T.roseBorder}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
            <Icon name="users" size={28} style={{ color: T.rose }} />
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: T.fontDisplay, color: T.text, marginBottom: 6 }}>
            {search ? `Sin resultados para "${search}"` : "Sin clientes aún"}
          </div>
          <div style={{ fontSize: 13, color: T.muted, marginBottom: search ? 0 : 20 }}>
            {search ? "Prueba con otro nombre o número de cédula." : "Agrega tu primer cliente con el botón de arriba."}
          </div>
          {!search && <Button variant="primary" size="sm" icon="userPlus" onClick={openCreate}>Agregar cliente</Button>}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(265px, 1fr))", gap: 14 }}>
          {clients.map((c) => (
            <ClientCard key={c.client_id} client={c} orgId={orgId} onNavigate={() => goToDetail(c.client_id)} onEdit={openEdit} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 24, flexWrap: "wrap", gap: 10 }}>
          <span style={{ fontSize: 13, color: T.muted }}>
            Página {pagination.page} de {pagination.total_pages} · {pagination.total_elements} registros
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { label: "← Anterior", action: () => setPage((p) => Math.max(1, p - 1)), disabled: page <= 1 },
              { label: "Siguiente →", action: () => setPage((p) => Math.min(pagination.total_pages, p + 1)), disabled: page >= pagination.total_pages },
            ].map(({ label, action, disabled }) => (
              <button key={label} onClick={action} disabled={disabled} style={{ padding: "8px 16px", border: `1px solid ${T.border}`, borderRadius: 8, background: "transparent", color: disabled ? T.muted : T.text, fontSize: 13, fontFamily: T.fontUI, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.45 : 1 }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      <ClientDrawerForm open={drawerOpen} onClose={() => setDrawerOpen(false)} client={editingClient} orgId={orgId} />
    </div>
  );
}
