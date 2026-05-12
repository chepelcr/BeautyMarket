import { Card, CardFooter, Icon, Badge, Menu } from "@/components/ui";
import { useUpdateClientStatus, clientDisplayName, formatPhone, type Client } from "@/hooks/useClients";
import { ID_TYPE_SHORT } from "@/lib/enums";
import { POS as T } from "@/theme/pos";
import { initials, avatarColor } from "@/utils/avatar";

interface ClientCardProps {
  client: Client;
  orgId: string;
  onNavigate: () => void;
  onEdit: (c: Client) => void;
  onToggleActive?: (client: Client, newStatus: number) => void;
}

export function ClientCard({ client, orgId, onNavigate, onEdit, onToggleActive }: ClientCardProps) {
  const statusMutation = useUpdateClientStatus(orgId);
  const displayName = clientDisplayName(client);
  const [bg, fg] = avatarColor(displayName);
  const idShort = client.identification?.code ? ID_TYPE_SHORT[client.identification.code] : undefined;
  const phone = formatPhone(client.phone);
  const isActive = client.status === 1;

  const handleToggleStatus = () => {
    const newStatus = isActive ? 2 : 1;
    if (onToggleActive) {
      onToggleActive(client, newStatus);
    } else {
      // Fallback to direct call if no handler provided
      statusMutation.mutate({ clientId: client.client_id, status: newStatus });
    }
  };

  return (
    <Card
      hoverable
      onClick={onNavigate}
      style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14, cursor: "pointer", position: "relative" }}
    >
      {/* Avatar + name + menu */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ width: 46, height: 46, borderRadius: 13, background: bg, color: fg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 800, fontFamily: T.fontDisplay, flexShrink: 0, boxShadow: `0 2px 8px ${bg}55` }}>
          {initials(displayName)}
        </div>
        <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text, fontFamily: T.fontUI, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1.3 }}>
            {displayName}
          </div>
          {idShort && client.identification?.number ? (
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
              <span style={{ background: T.roseLight, color: T.rose, border: `1px solid ${T.roseBorder}`, padding: "1px 6px", borderRadius: 4, fontSize: 10, fontWeight: 700 }}>{idShort}</span>
              <span style={{ fontSize: 11, color: T.muted, fontFamily: T.fontUI }}>{client.identification.number}</span>
            </div>
          ) : (
            <div style={{ marginTop: 4 }}>
              <Badge variant={isActive ? "success" : "secondary"} style={{ fontSize: 10 }}>
                {isActive ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          )}
        </div>
        <div onClick={(e) => e.stopPropagation()} style={{ flexShrink: 0, marginTop: -2 }}>
          <Menu
            align="right"
            items={[
              { label: "Ver perfil", icon: "user", action: onNavigate },
              { label: "Editar", icon: "edit", action: () => onEdit(client) },
              {
                label: isActive ? "Desactivar" : "Activar",
                icon: isActive ? "xCircle" : "checkCircle",
                action: handleToggleStatus,
              },
            ]}
          />
        </div>
      </div>

      {/* Contact info */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {client.email && (
          <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: T.muted, fontFamily: T.fontUI }}>
            <Icon name="mail" size={11} style={{ flexShrink: 0, color: T.rose }} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{client.email}</span>
          </div>
        )}
        {phone && (
          <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: T.muted, fontFamily: T.fontUI }}>
            <Icon name="smartphone" size={11} style={{ flexShrink: 0, color: T.rose }} />
            <span>{phone}</span>
          </div>
        )}
        {!client.email && !phone && (
          <div style={{ fontSize: 11, color: "hsl(var(--muted-foreground) / 0.5)", fontFamily: T.fontUI, fontStyle: "italic" }}>Sin datos de contacto</div>
        )}
      </div>

      {/* Footer */}
      <CardFooter style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0 0", borderTop: `1px solid ${T.border}`, margin: "0 -1px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: isActive ? "#32D74B" : T.muted, display: "inline-block", boxShadow: isActive ? "0 0 5px rgba(50,215,75,0.55)" : "none" }} />
          <span style={{ fontSize: 11, color: T.muted, fontFamily: T.fontUI }}>{isActive ? "Activo" : "Inactivo"}</span>
        </div>
        <span style={{ fontSize: 12, color: T.rose, fontWeight: 600, fontFamily: T.fontUI, display: "flex", alignItems: "center", gap: 3 }}>
          Ver perfil <Icon name="chevronRight" size={11} />
        </span>
      </CardFooter>
    </Card>
  );
}
