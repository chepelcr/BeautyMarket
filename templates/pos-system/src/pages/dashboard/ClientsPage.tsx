import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ROUTES } from "@/routePaths";
import { useOrgContext } from "@/contexts/OrgContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useClients, useUpdateClientStatus, clientDisplayName, type Client } from "@/hooks/useClients";
import { useConfirmModal } from "@/hooks/useConfirmModal";
import { ClientCard } from "@/components/clients/ClientCard";
import { ClientSkeletonCard } from "@/components/clients/ClientSkeletonCard";
import { ClientDrawerForm } from "@/components/clients/ClientDrawerForm";
import { Icon, Button, Pagination, Spinner } from "@/components/ui";

export default function ClientsPage() {
  const { orgId } = useOrgContext();
  const [, navigate] = useLocation();
  const { confirm, ConfirmModal } = useConfirmModal();
  const { t } = useLanguage();
  const statusMutation = useUpdateClientStatus(orgId);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const { data: listData, isLoading } = useClients(orgId, { search: search || undefined, page, page_size: 24 });
  const clients = listData?.data ?? [];
  const pagination = listData?.pagination;

  const goToDetail = (clientId: string) => navigate(`${ROUTES.DASHBOARD_CLIENTS}/${clientId}`);
  const openCreate = () => { setEditingClient(null); setDrawerOpen(true); };
  const openEdit = (c: Client) => { setEditingClient(c); setDrawerOpen(true); };

  const handleToggleActive = (client: Client, newStatus: number) => {
    const isActivating = newStatus === 1;
    confirm({
      title: isActivating ? t("clients.activateClient") : t("clients.deactivateClient"),
      message: isActivating
        ? t("clients.confirmActivate", { name: clientDisplayName(client) })
        : t("clients.confirmDeactivate", { name: clientDisplayName(client) }),
      variant: isActivating ? "success" : "warning",
      confirmLabel: t("common.confirm"),
      cancelLabel: t("common.cancel"),
      onConfirm: async () => {
        await statusMutation.mutateAsync({ clientId: client.client_id, status: newStatus });
      },
    });
  };

  return (
    <div style={{ padding: "24px 24px 48px", maxWidth: 1300, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="t-h1" style={{ marginBottom: 6 }}>{t("clients.title")}</h1>
          <p className="t-body" style={{ color: "hsl(var(--muted-foreground))" }}>
            {pagination ? `${pagination.total_elements} ${t("clients.registered")}` : t("clients.directory")}
          </p>
        </div>
        <Button variant="primary" size="sm" icon="userPlus" onClick={openCreate}>{t("clients.newClient")}</Button>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 24, maxWidth: 400 }}>
        <Icon name="search" size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "hsl(var(--muted-foreground))", pointerEvents: "none" }} />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder={t("placeholder.searchByNameId")}
          className="pp-input"
          style={{ width: "100%", paddingLeft: 36 }}
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(265px, 1fr))", gap: 14 }}>
          {Array.from({ length: 8 }).map((_, i) => <ClientSkeletonCard key={i} />)}
        </div>
      ) : clients.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 20px" }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(212,168,116,0.12)", border: "1px solid rgba(212,168,116,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
            <Icon name="users" size={28} style={{ color: "#D4A874" }} />
          </div>
          <div className="t-h2" style={{ marginBottom: 6 }}>
            {search ? t("clients.noResultsFor", { query: search }) : t("clients.noClients")}
          </div>
          <div className="t-body" style={{ color: "hsl(var(--muted-foreground))", marginBottom: search ? 0 : 20 }}>
            {search ? t("clients.tryOtherSearch") : t("empty.addFirst")}
          </div>
          {!search && <Button variant="primary" size="sm" icon="userPlus" onClick={openCreate}>{t("clients.addClient")}</Button>}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(265px, 1fr))", gap: 14 }}>
          {clients.map((c, i) => (
            <ClientCard key={c.client_id} client={c} orgId={orgId} onNavigate={() => goToDetail(c.client_id)} onEdit={openEdit} onToggleActive={handleToggleActive} delay={i * 0.03} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.total_pages}
          totalElements={pagination.total_elements}
          pageSize={pagination.page_size}
          onPageChange={setPage}
          itemName="clientes"
        />
      )}

      <ClientDrawerForm 
        open={drawerOpen} 
        onClose={() => {
          setDrawerOpen(false);
          setEditingClient(null);
        }} 
        client={editingClient} 
        orgId={orgId} 
      />
      
      {/* Confirmation Modal */}
      <ConfirmModal />
    </div>
  );
}
