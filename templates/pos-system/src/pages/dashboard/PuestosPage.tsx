import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";
import { crossAppApi, crossAppOrgPath } from "@/lib/api";
import { Icon, Input, Button, Drawer, EmptyState, Pagination, Spinner } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import { BranchCard } from "@/components/puestos/BranchCard";
import { BranchForm } from "@/components/puestos/BranchForm";
import { TerminalForm } from "@/components/puestos/TerminalForm";
import { BranchSkeletonCard } from "@/components/puestos/BranchSkeletonCard";
import type {
  Branch, BranchListResponse, CreateBranchRequest, CreateTerminalRequest, BranchType, BranchStatus,
} from "@/types";

export default function PuestosPage() {
  const qc = useQueryClient();
  const { user } = useAuthContext();
  const { useDefaultOrganization } = useOrganization();
  const { data: org } = useDefaultOrganization(user?.userId);
  const { t } = useLanguage();

  const [filter, setFilter] = useState<"all" | BranchType>("all");
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);
  const [branchDrawer, setBranchDrawer] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [termDrawer, setTermDrawer] = useState(false);
  const [addTermBranch, setAddTermBranch] = useState<Branch | null>(null);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const searchParam = showOnlyActive ? "status:1" : "";
  const { data: branchesData, isLoading } = useQuery({
    queryKey: ["branches", org?.id, searchParam, page, pageSize],
    enabled: !!org,
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
        ...(searchParam && { search: searchParam }),
      });
      return crossAppApi.get<BranchListResponse>(crossAppOrgPath(org!.id, `/branches?${params}`));
    },
  });

  const branches = (branchesData?.data ?? []).filter((b) => {
    if (filter !== "all" && b.type !== filter) return false;
    if (search && !b.name.toLowerCase().includes(search.toLowerCase()) && !String(b.code).includes(search)) return false;
    return true;
  });

  const pagination = branchesData?.pagination;

  const createMutation = useMutation({
    mutationFn: (data: CreateBranchRequest) => crossAppApi.post(crossAppOrgPath(org!.id, "/branches"), data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["branches", org?.id] }); setBranchDrawer(false); setEditingBranch(null); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateBranchRequest> }) =>
      crossAppApi.patch(crossAppOrgPath(org!.id, `/branches/${id}`), data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["branches", org?.id] }); setBranchDrawer(false); setEditingBranch(null); },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: BranchStatus }) =>
      crossAppApi.patch(crossAppOrgPath(org!.id, `/branches/${id}`), { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["branches", org?.id] }),
  });

  const addTerminalMutation = useMutation({
    mutationFn: ({ branchId, data }: { branchId: string; data: CreateTerminalRequest }) =>
      crossAppApi.post(crossAppOrgPath(org!.id, `/branches/${branchId}/terminals`), data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["terminals", org?.id, vars.branchId] });
      qc.invalidateQueries({ queryKey: ["branches", org?.id] });
      setTermDrawer(false);
      setAddTermBranch(null);
    },
  });

  const handleSaveBranch = (data: CreateBranchRequest) => {
    editingBranch ? updateMutation.mutate({ id: editingBranch.branch_id, data }) : createMutation.mutate(data);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending || statusMutation.isPending;
  const total = pagination?.total_elements ?? 0;
  const activeCount = branchesData?.data?.filter((b) => b.status === 1).length ?? 0;

  return (
    <div style={{ padding: "24px 24px 48px", maxWidth: 1400, margin: "0 auto" }}>
      {/* Page header */}
      <div className="fade-up" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 className="t-h1" style={{ marginBottom: 4 }}>{t("puestos.title")}</h1>
          <p className="t-body" style={{ color: "hsl(var(--muted-foreground))" }}>
            {total === 0 ? t("puestos.title") : t("puestos.subtitle", { active: String(activeCount), total: String(total) })}
          </p>
        </div>
        <Button variant="primary" icon="plus" onClick={() => { setEditingBranch(null); setBranchDrawer(true); }}>
          {t("puestos.newStation")}
        </Button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200, maxWidth: 340 }}>
          <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "hsl(var(--muted-foreground))", pointerEvents: "none" }}>
            <Icon name="search" size={14} />
          </div>
          <Input
            inputSize="sm"
            style={{ paddingLeft: 36 }}
            placeholder="Buscar por nombre o código…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {(["all", "stand", "restaurant"] as const).map((f) => (
            <button key={f} type="button" onClick={() => { setFilter(f); setPage(1); }} className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-outline"}`}>
              {f === "all" ? t("puestos.all") : f === "stand" ? t("puestos.stand") : t("puestos.restaurant")}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => { setShowOnlyActive((v) => !v); setPage(1); }} className={`btn btn-sm ${showOnlyActive ? "btn-success" : "btn-outline"}`} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name={showOnlyActive ? "checkCircle" : "eye"} size={14} />
          {t("puestos.onlyActive")}
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
          {Array.from({ length: pageSize }).map((_, i) => <BranchSkeletonCard key={i} />)}
        </div>
      ) : branches.length === 0 ? (
        <EmptyState
          icon="store"
          title={search || filter !== "all" ? t("common.noResults") : t("puestos.title")}
          description={search || filter !== "all" ? t("common.noResults") : t("puestos.newStation")}
          action={!search && filter === "all" ? (
            <Button variant="primary" icon="plus" onClick={() => { setEditingBranch(null); setBranchDrawer(true); }}>
              {t("puestos.newStation")}
            </Button>
          ) : undefined}
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
          {branches.map((branch, i) => (
            <BranchCard
              key={branch.branch_id}
              branch={branch}
              orgId={org!.id}
              onEdit={(b) => { setEditingBranch(b); setBranchDrawer(true); }}
              onStatusChange={(b, s) => statusMutation.mutate({ id: b.branch_id, status: s })}
              onAddTerminal={(b) => { setAddTermBranch(b); setTermDrawer(true); }}
              delay={i * 0.03}
            />
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
          onPageSizeChange={setPageSize}
          itemName="puestos"
          pageSizeOptions={[12, 24, 48, 96]}
        />
      )}

      {/* Branch drawer */}
      <Drawer
        open={branchDrawer}
        onClose={() => { setBranchDrawer(false); setEditingBranch(null); }}
        title={editingBranch ? t("common.edit") + " " + t("puestos.title") : t("puestos.newStation")}
        subtitle={editingBranch ? String(editingBranch.code) : t("puestos.newStation")}
        icon="store"
      >
        <BranchForm
          editing={editingBranch}
          onSave={handleSaveBranch}
          isSaving={isSaving}
          onClose={() => { setBranchDrawer(false); setEditingBranch(null); }}
        />
      </Drawer>

      {/* Terminal drawer */}
      <Drawer
        open={termDrawer}
        onClose={() => { setTermDrawer(false); setAddTermBranch(null); }}
        title={t("puestos.addTerminal")}
        subtitle={addTermBranch?.name}
        icon="sliders"
        iconBg="hsl(220 100% 60% / 0.12)"
        iconColor="hsl(220 100% 55%)"
        width={400}
      >
        {addTermBranch && (
          <TerminalForm
            branchId={addTermBranch.branch_id}
            onSave={(data) => addTerminalMutation.mutate({ branchId: addTermBranch.branch_id, data })}
            isSaving={addTerminalMutation.isPending}
            onClose={() => { setTermDrawer(false); setAddTermBranch(null); }}
          />
        )}
      </Drawer>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}
