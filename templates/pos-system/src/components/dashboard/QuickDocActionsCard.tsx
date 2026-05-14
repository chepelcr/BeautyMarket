import { useLocation } from "wouter";
import { useDocumentStore, newDocTabId } from "@/store/documentStore";
import { ROUTES, documentEditorPath } from "@/routePaths";
import { DOCUMENT_TYPES } from "@/types/invoice";
import type { DocTypeCode } from "@/types/invoice";
import { Card, Icon } from "@/components/ui";

interface ActionButtonProps {
  label: string;
  icon: string;
  accent: string;
  onClick: () => void;
}

function ActionButton({ label, icon, accent, onClick }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "16px 12px",
        background: "hsl(var(--card))",
        border: "1px solid hsl(var(--border))",
        borderRadius: 10,
        cursor: "pointer",
        transition: "border-color 0.15s, transform 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = accent;
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "hsl(var(--border))";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: accent,
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name={icon} size={18} />
      </div>
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          fontFamily: "var(--font-display)",
          color: "hsl(var(--foreground))",
          textAlign: "center",
        }}
      >
        {label}
      </span>
    </button>
  );
}

export function QuickDocActionsCard() {
  const { addDocumentTab } = useDocumentStore();
  const [, setLocation] = useLocation();

  const openNewDoc = (code: DocTypeCode) => {
    const docType = DOCUMENT_TYPES.find((d) => d.code === code)!;
    const tabId = newDocTabId();
    addDocumentTab({
      id: tabId,
      type: "new",
      title: docType.label,
      doc_type: code,
      data: { document_type: code },
      is_dirty: false,
      opened_at: Date.now(),
    });
    setLocation(documentEditorPath(tabId));
  };

  return (
    <Card style={{ padding: 20 }}>
      <div style={{ marginBottom: 14 }}>
        <div className="t-h3" style={{ fontSize: 14, marginBottom: 4 }}>
          Crear documento
        </div>
        <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
          Empieza una factura electrónica, un tiquete o consulta tus documentos.
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <ActionButton
          label="Crear factura"
          icon="fileText"
          accent="#16a34a"
          onClick={() => openNewDoc(1)}
        />
        <ActionButton
          label="Crear tiquete"
          icon="cash"
          accent="#3b82f6"
          onClick={() => openNewDoc(4)}
        />
        <ActionButton
          label="Ver documentos"
          icon="layers"
          accent="hsl(var(--primary))"
          onClick={() => setLocation(ROUTES.DASHBOARD_DOCUMENTS)}
        />
      </div>
    </Card>
  );
}
