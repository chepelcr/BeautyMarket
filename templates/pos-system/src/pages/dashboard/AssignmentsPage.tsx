import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, orgPath, crossAppApi, crossAppOrgPath } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";
import { Card, Badge, Button, Icon, Select, EmptyState, Pagination } from "@/components/ui";
import type { BranchListResponse } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";

interface Assignment {
  assignment_id: string;
  user_id: string;
  branch_id: string;
  session_id: string;
  terminal_id: string | null;
  role: "cashier" | "supervisor";
  start_time: string;
  status: number;
}

interface Session {
  session_id: string;
  name: string;
  type: string;
  status: number;
}

interface Branch {
  branch_id: string;
  name: string;
  code: number;
  status: number;
}

interface Member {
  id: string;
  userId: string;
  user: {
    id: string;
    username: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

type Role = "cashier" | "supervisor";

export default function AssignmentsPage() {
  const { user } = useAuthContext();
  const { useDefaultOrganization } = useOrganization();
  const { data: org } = useDefaultOrganization(user?.userId);
  const { t } = useLanguage();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const ROLE_LABEL: Record<Role, string> = {
    cashier: t("assignments.cashier"),
    supervisor: t("assignments.supervisor"),
  };

  const [sessionId, setSessionId] = useState("");
  const [userId, setUserId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [role, setRole] = useState<Role>("cashier");
  const [formError, setFormError] = useState<string | null>(null);

  const { data: assignmentsData, isLoading } = useQuery({
    queryKey: ["assignments", org?.id, page, pageSize],
    enabled: !!user && !!org,
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
        search: "status:1",
      });
      return crossAppApi.get<{ data: Assignment[]; pagination: any }>(crossAppOrgPath(org!.id, `/assignments?${params}`));
    },
  });

  const assignments = assignmentsData?.data ?? [];
  const pagination = assignmentsData?.pagination;

  const { data: sessions = [] } = useQuery({
    queryKey: ["sessions-active", org?.id],
    enabled: !!user && !!org && showForm,
    queryFn: () => {
      const params = new URLSearchParams({
        page_size: "1000",
        search: "status:1",
      });
      return crossAppApi.get<{ data: Session[] }>(crossAppOrgPath(org!.id, `/sessions?${params}`)).then(res => res.data);
    },
  });

  const { data: branchesResponse } = useQuery({
    queryKey: ["branches", org?.id],
    enabled: !!user && !!org && showForm,
    queryFn: () => {
      const params = new URLSearchParams({
        page_size: "1000",
        search: "status:1",
      });
      return crossAppApi.get<BranchListResponse>(crossAppOrgPath(org!.id, `/branches?${params}`));
    },
  });
  const branches: Branch[] = branchesResponse?.data ?? [];

  const { data: members = [] } = useQuery({
    queryKey: ["org-users", org?.id],
    enabled: !!user && !!org && showForm,
    queryFn: () =>
      api.get<Member[]>(orgPath(user!.userId, org!.id, "/members")),
  });

  const createMutation = useMutation({
    mutationFn: () => {
      if (!sessionId || !userId || !branchId)
        throw new Error(t("common.error"));
      return crossAppApi.post(crossAppOrgPath(org!.id, "/assignments"), {
        session_id: sessionId,
        user_id: userId,
        branch_id: branchId,
        role,
        start_time: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assignments", org?.id] });
      setShowForm(false);
      setSessionId(""); setUserId(""); setBranchId(""); setRole("cashier");
      setFormError(null);
    },
    onError: (err: Error) => setFormError(err.message || t("common.error")),
  });

  const deactivateMutation = useMutation({
    mutationFn: (assignmentId: string) =>
      crossAppApi.patch(crossAppOrgPath(org!.id, `/assignments/${assignmentId}/status`), { status: 2 }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assignments", org?.id] }),
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 className="t-h2" style={{ margin: 0 }}>{t("assignments.title")}</h2>
          {!isLoading && (
            <p className="t-sm" style={{ color: "hsl(var(--muted-foreground))", marginTop: 2 }}>
              {t("assignments.count", { n: String(assignments.length) })}
            </p>
          )}
        </div>
        <Button
          variant={showForm ? "outline" : "primary"}
          size="sm"
          icon={showForm ? "close" : "plus"}
          onClick={() => { setShowForm((v) => !v); setFormError(null); }}
        >
          {showForm ? t("common.cancel") : t("assignments.newAssignment")}
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <Card className="fade-up" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div
              className="icon-pill"
              style={{ width: 32, height: 32, background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary))" }}
            >
              <Icon name="userPlus" size={14} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, fontFamily: "var(--font-display)" }}>
              {t("assignments.newAssignment")}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Session */}
            <div>
              <label className="t-label" style={{ display: "block", marginBottom: 6 }}>
                {t("assignments.session")}
              </label>
              <Select value={sessionId} onChange={(e) => setSessionId(e.target.value)}>
                <option value="">{t("session.select")}</option>
                {sessions.map((s) => (
                  <option key={s.session_id} value={s.session_id}>
                    {s.name} ({s.type === "match" ? t("session.match") : t("session.regular")})
                  </option>
                ))}
              </Select>
            </div>

            {/* Member */}
            <div>
              <label className="t-label" style={{ display: "block", marginBottom: 6 }}>
                {t("assignments.seller")}
              </label>
              <Select value={userId} onChange={(e) => setUserId(e.target.value)}>
                <option value="">{t("session.select")}</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {[m.user.firstName, m.user.lastName].filter(Boolean).join(" ") || m.user.email}
                  </option>
                ))}
              </Select>
            </div>

            {/* Branch + Role row */}
            <div className="grid-form" style={{ gap: 12 }}>
              <div>
                <label className="t-label" style={{ display: "block", marginBottom: 6 }}>
                  {t("puestos.title")}
                </label>
                <Select value={branchId} onChange={(e) => setBranchId(e.target.value)}>
                  <option value="">{t("session.select")}</option>
                  {branches.map((b) => (
                    <option key={b.branch_id} value={b.branch_id}>{b.name}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="t-label" style={{ display: "block", marginBottom: 6 }}>
                  {t("assignments.role")}
                </label>
                <Select value={role} onChange={(e) => setRole(e.target.value as Role)}>
                  <option value="cashier">{t("assignments.cashier")}</option>
                  <option value="supervisor">{t("assignments.supervisor")}</option>
                </Select>
              </div>
            </div>

            {formError && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "hsl(var(--destructive))" }}>
                <Icon name="alertTri" size={14} />
                <span className="t-sm">{formError}</span>
              </div>
            )}

            <Button
              variant="success"
              size="md"
              icon="checkCircle"
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !sessionId || !userId || !branchId}
              style={{ width: "100%" }}
            >
              {createMutation.isPending ? t("assignments.assigning") : t("assignments.create")}
            </Button>
          </div>
        </Card>
      )}

      {/* Loading */}
      {isLoading && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "hsl(var(--muted-foreground))" }}>
          <div className="t-sm" style={{ animation: "pulse 1.5s ease-in-out infinite" }}>
            {t("assignments.loading")}
          </div>
        </div>
      )}

      {/* Empty */}
      {!isLoading && assignments.length === 0 && (
        <EmptyState
          icon="users"
          title={t("assignments.noActive")}
          description={t("assignments.noActive")}
        />
      )}

      {/* Assignment cards */}
      {assignments.map((a) => {
        const startTime = new Date(a.start_time).toLocaleTimeString("es-CR", {
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <Card
            key={a.assignment_id}
            className="fade-up"
            style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
              <div
                className="icon-pill"
                style={{
                  width: 36,
                  height: 36,
                  background: a.role === "supervisor"
                    ? "hsl(var(--primary) / 0.1)"
                    : "hsl(var(--muted))",
                  color: a.role === "supervisor"
                    ? "hsl(var(--primary))"
                    : "hsl(var(--muted-foreground))",
                  flexShrink: 0,
                }}
              >
                <Icon name={a.role === "supervisor" ? "star" : "user"} size={15} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {a.user_id}
                  </span>
                  <Badge variant={a.role === "supervisor" ? "primary-soft" : "secondary"}>
                    {ROLE_LABEL[a.role]}
                  </Badge>
                </div>
                <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon name="store" size={11} />
                  {t("assignments.station", { id: a.branch_id })}
                  <span style={{ opacity: 0.5 }}>·</span>
                  <Icon name="clock" size={11} />
                  {t("assignments.start", { time: startTime })}
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => deactivateMutation.mutate(a.assignment_id)}
              disabled={deactivateMutation.isPending}
              style={{ flexShrink: 0, color: "hsl(var(--destructive))", borderColor: "hsl(var(--destructive) / 0.4)" }}
            >
              {t("assignments.finish")}
            </Button>
          </Card>
        );
      })}

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.total_pages}
          totalElements={pagination.total_elements}
          pageSize={pagination.page_size}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          itemName="asignaciones"
          pageSizeOptions={[12, 24, 48, 96]}
        />
      )}

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}
