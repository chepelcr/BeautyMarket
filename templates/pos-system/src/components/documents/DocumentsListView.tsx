import { useState } from 'react';
import { useDocumentStore } from '@/store/documentStore';
import { useSales } from '@/hooks/useSales';
import { FadeIn, EmptyState, Pagination } from '@/components/ui';
import { IssuedReceivedToggle } from './IssuedReceivedToggle';
import { DocumentsFilters } from './DocumentsFilters';
import { DocumentCard } from './DocumentCard';
import { DocumentCardSkeleton } from './DocumentCardSkeleton';
import { DocumentActionModal } from './DocumentActionModal';
import type { DocumentListItem, ComplexSearchFilters } from '@/types/document';

const SKELETON_COUNT = 6;
const PAGE_SIZE = 20;

interface DocumentsListViewProps {
  orgId: string;
}

export function DocumentsListView({ orgId }: DocumentsListViewProps) {
  const { is_received } = useDocumentStore();

  const [selectedTypes, setSelectedTypes] = useState<number[]>([]);
  const [search, setSearch] = useState<ComplexSearchFilters>({});
  const [page, setPage] = useState(0);
  const [actionModal, setActionModal] = useState<{
    doc: DocumentListItem;
    action: string;
  } | null>(null);

  const { data, isLoading, error, refetch } = useSales({
    orgId,
    document_types: selectedTypes.length ? selectedTypes : undefined,
    issued: !is_received,
    search,
    page,
    size: PAGE_SIZE,
  });

  const docs = data?.data ?? [];
  const pagination = data?.pagination;

  const handleTypesChange = (types: number[]) => {
    setSelectedTypes(types);
    setPage(0);
  };

  const handleSearchChange = (next: ComplexSearchFilters) => {
    setSearch(next);
    setPage(0);
  };

  return (
    <div 
      className="flex flex-col h-full"
      style={{
        animation: 'fadeIn 0.2s ease-in-out',
      }}
    >
      {/* Toggle + total count */}
      <div className="px-4 py-2.5 flex items-center justify-between border-b border-border bg-card">
        <IssuedReceivedToggle />
        <span className="text-[12px] text-muted-foreground">
          {pagination ? `${pagination.total_elements} documentos` : ''}
        </span>
      </div>

      {/* Filters */}
      <DocumentsFilters
        selectedTypes={selectedTypes}
        search={search}
        onTypesChange={handleTypesChange}
        onSearchChange={handleSearchChange}
      />

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
          >
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <DocumentCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <EmptyState
              icon="alertCircle"
              title="Error al cargar documentos"
              description={
                error instanceof Error
                  ? error.message
                  : 'No se pudieron cargar los documentos. Por favor, intenta de nuevo.'
              }
              action={
                <button
                  onClick={() => refetch()}
                  className="btn btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 16px',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  <span>Reintentar</span>
                </button>
              }
            />
          </div>
        ) : docs.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <EmptyState
              icon="fileText"
              title="Sin documentos"
              description={
                is_received
                  ? 'No hay documentos recibidos que coincidan con los filtros.'
                  : 'No hay documentos emitidos que coincidan con los filtros.'
              }
            />
          </div>
        ) : (
          <>
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
            >
              {docs.map((doc, i) => (
                <FadeIn key={doc.sale_id} delay={i * 0.04} duration={0.3}>
                  <DocumentCard
                    doc={doc}
                    isReceived={is_received}
                    onAction={(d, action) => setActionModal({ doc: d, action })}
                    delay={i * 0.04}
                  />
                </FadeIn>
              ))}
            </div>

            {pagination && pagination.total_pages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={page}
                  totalPages={pagination.total_pages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Action modal */}
      {actionModal && (
        <DocumentActionModal
          orgId={orgId}
          doc={actionModal.doc}
          initialAction={actionModal.action}
          isReceived={is_received}
          onClose={() => setActionModal(null)}
        />
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
