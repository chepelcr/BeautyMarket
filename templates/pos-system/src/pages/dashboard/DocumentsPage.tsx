import { useOrganization } from '@/hooks/useOrganization';
import { useAuthContext } from '@/contexts/AuthContext';
import { useDocumentStore } from '@/store/documentStore';
import { DocumentsHeader } from '@/components/documents/DocumentsHeader';
import { DocumentTabsView } from '@/components/documents/DocumentTabsView';
import { DocumentsListView } from '@/components/documents/DocumentsListView';

export default function DocumentsPage() {
  const { user } = useAuthContext();
  const { useDefaultOrganization } = useOrganization();
  const { data: org, isLoading } = useDefaultOrganization(user?.userId);
  const { view_mode } = useDocumentStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <span className="text-muted-foreground text-sm">Cargando…</span>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <span className="text-muted-foreground text-sm">Sin organización activa.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <DocumentsHeader />
      <div className="flex-1 overflow-hidden">
        {view_mode === 'tabs'
          ? <DocumentTabsView orgId={org.id} />
          : <DocumentsListView orgId={org.id} />
        }
      </div>
    </div>
  );
}
