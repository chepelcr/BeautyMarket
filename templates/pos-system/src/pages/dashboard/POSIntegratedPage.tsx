import { useState } from "react";
import { useAssignment } from "@/hooks/useAssignment";
import { useOrganization } from "@/hooks/useOrganization";
import { useSessionContext } from "@/store/sessionContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { useCartFlow } from "@/hooks/useCartFlow";
import { useClientSearch } from "@/hooks/useClientSearch";
import { useSync } from "@/hooks/useSync";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { PosHeader } from "@/components/pos/PosHeader";
import { PosLeftPane } from "@/components/pos/PosLeftPane";
import { CartSidebar } from "@/components/pos/CartSidebar";
import { CheckoutModal } from "@/components/pos/checkout/CheckoutModal";
import { POSPageSkeleton } from "@/components/pos/POSPageSkeleton";
import SessionSetupScreen from "@/pages/pos/SessionSetupScreen";
import type { ClientSearchResult } from "@/hooks/useClientSearch";

type LeftTab = "products" | "clients";

export default function POSIntegratedPage() {
  const syncStatus = useSync();
  const { user } = useAuthContext();
  const { useDefaultOrganization } = useOrganization();
  const { data: org, isLoading: orgLoading } = useDefaultOrganization(user?.userId);
  const { data: assignment, isLoading: assignmentLoading } = useAssignment();
  const sessionCtx = useSessionContext();
  const { t } = useLanguage();
  const isDesktop = useIsDesktop(768);

  const [leftTab, setLeftTab] = useState<LeftTab>("products");
  const [selectedClient, setSelectedClient] = useState<ClientSearchResult | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  const clientsEnabled = leftTab === "clients";
  const { query: clientQuery, setQuery: setClientQuery, clients, isLoading: clientsLoading } =
    useClientSearch(org?.id, clientsEnabled);

  const flow = useCartFlow();

  const handleConfirm = async (invoiceData: any) => {
    if (!assignment || !org || !user) return;
    const branchCode = sessionCtx.branch_code;
    const terminalCode = sessionCtx.terminal_code;
    if (!branchCode || !terminalCode) return;

    await flow.handleConfirmPayment({
      assignmentId: assignment.assignment_id,
      orgId: org.id,
      userId: user.userId,
      branchCode,
      terminalCode,
      selectedClient,
      invoiceData,
    });
    setSelectedClient(null);
    setShowCheckout(false);
  };

  if (orgLoading || assignmentLoading) {
    return <POSPageSkeleton />;
  }

  if (!org) {
    return (
      <div className="flex items-center justify-center h-[60vh] bg-background">
        <span className="text-muted-foreground text-sm">{t("empty.noOrganization")}</span>
      </div>
    );
  }

  if (!sessionCtx.branch_code || !sessionCtx.terminal_code) {
    return <SessionSetupScreen org={org} />;
  }

  const cartSidebar = (
    <CartSidebar
      cartItems={flow.cartItems}
      cartTotal={flow.cartTotal}
      subtotal={flow.subtotal}
      taxAmount={flow.taxAmount}
      items={flow.items}
      selectedClient={selectedClient}
      onAdd={flow.add}
      onRemove={flow.remove}
      onUpdateLine={flow.updateLine}
      onCheckout={() => setShowCheckout(true)}
      onSelectClient={() => setLeftTab("clients")}
      onClearClient={() => setSelectedClient(null)}
    />
  );

  const leftPane = (
    <PosLeftPane
      orgId={org.id}
      activeTab={leftTab}
      onTabChange={(tab) => {
        setLeftTab(tab);
        if (tab === "clients") setClientQuery("");
      }}
      cartItems={flow.cartItems}
      onAddProduct={flow.add}
      clients={clients}
      clientsLoading={clientsLoading}
      clientQuery={clientQuery}
      selectedClient={selectedClient}
      onClientQueryChange={setClientQuery}
      onSelectClient={(c) => {
        setSelectedClient(c);
        setLeftTab("products");
      }}
    />
  );

  return (
    <>
      {/* Desktop layout */}
      {isDesktop ? (
        <div className="flex flex-col bg-background overflow-hidden" style={{ height: "calc(100vh - 56px)" }}>
          <PosHeader
            branchName={sessionCtx.branch_name ?? ""}
            terminalCode={sessionCtx.terminal_code ?? 0}
            userName={user?.firstName ?? user?.name ?? "Cajero"}
            syncStatus={syncStatus}
          />
          <div className="flex-1 grid overflow-hidden" style={{ gridTemplateColumns: "1fr 360px" }}>
            <div className="flex flex-col border-r border-border overflow-hidden">
              {leftPane}
            </div>
            {cartSidebar}
          </div>
        </div>
      ) : (
        /* Mobile layout */
        <div className="flex flex-col bg-background overflow-hidden" style={{ height: "calc(100vh - 56px)" }}>
          <div className="h-12 flex items-center justify-between px-4 border-b border-border bg-card shrink-0">
            <span className="font-display font-bold text-[18px]">
              {sessionCtx.branch_name ?? "POS"}
            </span>
            <span className={cn(
              "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold border",
              syncStatus === "online"
                ? "bg-success/12 text-success border-success/30"
                : "bg-muted text-muted-foreground border-border"
            )}>
              <span className={cn("w-[7px] h-[7px] rounded-full", syncStatus === "online" ? "bg-success" : "bg-muted-foreground")} />
              {syncStatus === "online" ? t("status.online") : syncStatus === "syncing" ? t("status.syncing") : t("status.offline")}
            </span>
          </div>

          <div className="flex-1 overflow-hidden">
            {leftTab === "products" || leftTab === "clients" ? leftPane : cartSidebar}
          </div>

          {/* Mobile bottom tab bar */}
          <div className="flex bg-card border-t border-border shrink-0">
            {(
              [
                { id: "products" as const, label: t("tabs.products") },
                { id: "cart" as const, label: t("tabs.cart"), badge: flow.cartCount },
                { id: "clients" as const, label: t("tabs.clients") },
              ] as const
            ).map(({ id, label, badge }) => (
              <button
                key={id}
                onClick={() => {
                  if (id === "cart") setShowCheckout(false);
                  setLeftTab(id === "cart" ? "products" : id);
                }}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 py-2.5 relative",
                  (id === "cart" ? false : leftTab === id)
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <span className="text-[10px] font-semibold">{label}</span>
                {badge != null && badge > 0 && (
                  <span className="absolute top-1.5 right-[calc(50%-14px)] min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1">
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {showCheckout && (
        <CheckoutModal
          cartItems={flow.cartItems}
          cartTotal={flow.cartTotal}
          subtotal={flow.subtotal}
          taxAmount={flow.taxAmount}
          selectedClient={selectedClient}
          onClose={() => setShowCheckout(false)}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
}
