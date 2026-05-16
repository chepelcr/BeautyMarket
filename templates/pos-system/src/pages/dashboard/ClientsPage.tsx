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
import { Icon, Button, Pagination } from "@/components/ui";

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
    <div className="px-6 pt-6 pb-12 max-w-[1300px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-7 flex-wrap gap-3">
        <div>
          <h1 className="t-h1 mb-1.5">{t("clients.title")}</h1>
          <p className="t-body text-muted-foreground">
            {pagination ? `${pagination.total_elements} ${t("clients.registered")}` : t("clients.directory")}
          </p>
        </div>
        <Button variant="primary" size="sm" icon="userPlus" onClick={openCreate}>{t("clients.newClient")}</Button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-[400px]">
        <Icon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder={t("placeholder.searchByNameId")}
          className="pp-input w-full pl-9"
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(265px, 1fr))" }}>
          {Array.from({ length: 8 }).map((_, i) => <ClientSkeletonCard key={i} />)}
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center px-5 py-16">
          <div className="w-16 h-16 rounded-[20px] bg-accent-rose-soft border border-accent-rose-border flex items-center justify-center mx-auto mb-[18px]">
            <Icon name="users" size={28} className="text-accent-rose" />
          </div>
          <div className="t-h2 mb-1.5">
            {search ? t("clients.noResultsFor", { query: search }) : t("clients.noClients")}
          </div>
          <div className={`t-body text-muted-foreground ${search ? "" : "mb-5"}`}>
            {search ? t("clients.tryOtherSearch") : t("empty.addFirst")}
          </div>
          {!search && <Button variant="primary" size="sm" icon="userPlus" onClick={openCreate}>{t("clients.addClient")}</Button>}
        </div>
      ) : (
        <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(265px, 1fr))" }}>
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
