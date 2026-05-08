import { useState } from "react";
import { useAssignment } from "@/hooks/useAssignment";
import { useOrganization } from "@/hooks/useOrganization";
import { useSessionContext } from "@/store/sessionContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { useCartFlow } from "@/hooks/useCartFlow";
import { useClientSearch } from "@/hooks/useClientSearch";
import { SyncPill } from "@/components/ui";
import { useSync } from "@/hooks/useSync";
import { useLanguage } from "@/contexts/LanguageContext";
import { POS } from "@/theme/pos";
import { ProductsPanel } from "@/components/pos/ProductsPanel";
import { CartSidebar } from "@/components/pos/CartSidebar";
import { ClientSelector } from "@/components/pos/ClientSelector";
import { SaleSuccessOverlay } from "@/components/pos/SaleSuccessOverlay";
import SessionSetupScreen from "@/pages/pos/SessionSetupScreen";
import type { ClientSearchResult } from "@/hooks/useClientSearch";
import { Icon } from "@/components/ui";

type ActiveTab = "products" | "cart" | "clients";

export default function POSIntegratedPage() {
  const syncStatus = useSync();
  const { user } = useAuthContext();
  const { useDefaultOrganization } = useOrganization();
  const { data: org, isLoading: orgLoading } = useDefaultOrganization(user?.userId);
  const { data: assignment, isLoading: assignmentLoading } = useAssignment();
  const sessionCtx = useSessionContext();
  const { t } = useLanguage();
  const isDesktop = useIsDesktop(1024);

  const [activeTab, setActiveTab] = useState<ActiveTab>("products");
  const [selectedClient, setSelectedClient] = useState<ClientSearchResult | null>(null);

  const clientsEnabled = activeTab === "clients" || false;
  const { query: clientQuery, setQuery: setClientQuery, clients, isLoading: clientsLoading } = useClientSearch(org?.id, clientsEnabled);

  const flow = useCartFlow();

  const handleConfirm = async () => {
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
    });
    setSelectedClient(null);
  };

  if (orgLoading || assignmentLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", background: POS.bg }}>
        <div style={{ color: POS.muted, fontFamily: POS.fontUI, fontSize: 14 }}>{t("common.loading")}</div>
      </div>
    );
  }

  if (!org) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", background: POS.bg }}>
        <div style={{ color: POS.muted, fontFamily: POS.fontUI, fontSize: 14 }}>Sin organización activa.</div>
      </div>
    );
  }

  if (!sessionCtx.branch_code || !sessionCtx.terminal_code) {
    return <SessionSetupScreen org={org} />;
  }

  if (flow.showSuccess) {
    return (
      <SaleSuccessOverlay
        total={flow.lastTotal}
        change={flow.lastChange}
        method={flow.lastMethod}
        orderNum={flow.orderNum}
        onNewSale={flow.resetPayment}
      />
    );
  }

  const cartSidebar = (
    <CartSidebar
      cartItems={flow.cartItems}
      cartTotal={flow.cartTotal}
      subtotal={flow.subtotal}
      taxAmount={flow.taxAmount}
      items={flow.items}
      selectedClient={selectedClient}
      showPayment={flow.showPayment}
      payMethod={flow.payMethod}
      cashGiven={flow.cashGiven}
      sinpeCode={flow.sinpeCode}
      given={flow.given}
      change={flow.change}
      canConfirm={flow.canConfirm}
      onAdd={flow.add}
      onRemove={flow.remove}
      onUpdateLine={flow.updateLine}
      onShowPayment={() => flow.setShowPayment(true)}
      onHidePayment={() => flow.setShowPayment(false)}
      onSelectClient={() => {
        setActiveTab("clients");
        if (!isDesktop) flow.setShowPayment(false);
      }}
      onClearClient={() => setSelectedClient(null)}
      onPayMethodChange={flow.setPayMethod}
      onCashGivenChange={flow.setCashGiven}
      onSinpeCodeChange={flow.setSinpeCode}
      onConfirmPayment={handleConfirm}
    />
  );

  const productsPanel = (
    <ProductsPanel
      orgId={org.id}
      cartItems={flow.cartItems}
      isDesktop={isDesktop}
      onAdd={flow.add}
    />
  );

  const clientsPanel = (
    <ClientSelector
      clients={clients}
      isLoading={clientsLoading}
      query={clientQuery}
      selected={selectedClient}
      onQueryChange={setClientQuery}
      onSelect={(c) => {
        setSelectedClient(c);
        if (!isDesktop) setActiveTab("cart");
      }}
    />
  );

  if (isDesktop) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 420px",
          gridTemplateRows: "52px 1fr",
          height: "calc(100vh - 56px)",
          background: POS.bg,
          overflow: "hidden",
          fontFamily: POS.fontUI,
        }}
      >
        {/* Header bar */}
        <div
          style={{
            gridColumn: "1 / -1",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            height: 52,
            background: POS.surface,
            borderBottom: `1px solid ${POS.border}`,
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontFamily: POS.fontDisplay, fontSize: 20, fontWeight: 600, color: POS.text }}>Punto de venta</div>
            <span style={{ fontFamily: POS.fontUI, fontSize: 12, color: POS.muted }}>·</span>
            <span style={{ fontFamily: POS.fontUI, fontSize: 13, color: POS.muted }}>
              {sessionCtx.branch_name} · Terminal {sessionCtx.terminal_code}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: POS.fontUI, fontSize: 12, color: POS.muted }}>
              {user?.firstName ?? user?.name ?? "Cajero"}
            </span>
            <SyncPill state={syncStatus === "online" ? "online" : syncStatus === "syncing" ? "syncing" : "offline"} />
          </div>
        </div>

        {/* Left: products/clients with tab bar */}
        <div style={{ overflow: "hidden", display: "flex", flexDirection: "column", background: POS.bg }}>
          <div style={{ display: "flex", borderBottom: `1px solid ${POS.border}`, background: POS.surface }}>
            {(["products", "clients"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  padding: "12px 0",
                  border: "none",
                  background: "transparent",
                  color: activeTab === tab ? POS.rose : POS.muted,
                  fontFamily: POS.fontUI,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  borderBottom: activeTab === tab ? `2px solid ${POS.rose}` : "2px solid transparent",
                }}
              >
                {tab === "products" ? "Productos" : "Clientes"}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            {activeTab === "clients" ? clientsPanel : productsPanel}
          </div>
        </div>

        {/* Right: cart */}
        {cartSidebar}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 56px)",
        background: POS.bg,
        fontFamily: POS.fontUI,
        overflow: "hidden",
      }}
    >
      {/* Mobile header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          height: 48,
          background: POS.surface,
          borderBottom: `1px solid ${POS.border}`,
          flexShrink: 0,
        }}
      >
        <div style={{ fontFamily: POS.fontDisplay, fontSize: 18, fontWeight: 600, color: POS.text }}>
          {sessionCtx.branch_name ?? "POS"}
        </div>
        <SyncPill state={syncStatus === "online" ? "online" : syncStatus === "syncing" ? "syncing" : "offline"} />
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        {activeTab === "products" && productsPanel}
        {activeTab === "cart" && (
          <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
            {cartSidebar}
          </div>
        )}
        {activeTab === "clients" && clientsPanel}
      </div>

      {/* Bottom tab bar */}
      <div style={{ display: "flex", background: POS.surface, borderTop: `1px solid ${POS.border}`, flexShrink: 0 }}>
        {(
          [
            { id: "products" as const, icon: "grid", label: "Productos" },
            { id: "cart" as const, icon: "cart", label: "Carrito", badge: flow.cartCount },
            { id: "clients" as const, icon: "users", label: "Clientes" },
          ]
        ).map(({ id, icon, label, badge }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{
              flex: 1,
              padding: "10px 0 12px",
              border: "none",
              background: "transparent",
              color: activeTab === id ? POS.rose : POS.muted,
              cursor: "pointer",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
            }}
          >
            <Icon name={icon} size={22} style={{ color: activeTab === id ? POS.rose : POS.muted }} />
            <span style={{ fontFamily: POS.fontUI, fontSize: 10, fontWeight: 600 }}>{label}</span>
            {badge != null && badge > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 6,
                  right: "calc(50% - 18px)",
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: POS.rose,
                  color: "#1C1C1E",
                  fontSize: 10,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: POS.fontUI,
                }}
              >
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
