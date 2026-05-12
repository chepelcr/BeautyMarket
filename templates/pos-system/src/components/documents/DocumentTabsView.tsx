import { useDocumentStore } from '@/store/documentStore';
import { DocumentTabBar } from './DocumentTabBar';
import { InvoiceForm } from './InvoiceForm';

interface DocumentTabsViewProps {
  orgId: string;
}

export function DocumentTabsView({ orgId }: DocumentTabsViewProps) {
  const { open_documents, active_document_tab } = useDocumentStore();
  const activeDoc = open_documents.find((d) => d.id === active_document_tab) ?? null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <DocumentTabBar tabs={open_documents} activeId={active_document_tab} />
      <div className="flex-1 overflow-auto">
        {activeDoc ? (
          <InvoiceForm orgId={orgId} tab={activeDoc} />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Selecciona una pestaña para editar el documento.
          </div>
        )}
      </div>
    </div>
  );
}
