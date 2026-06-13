import { useEffect } from 'react';
import { CalendarCheck, Plus } from 'lucide-react';
import { PageLoader } from '@/components/ui/page-loader';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { useConfirmations } from '@/hooks/useConfirmations';
import { useConfirmationListStore } from '@/store/confirmation-list-store';
import { ConfirmationCard } from '@/components/confirmations/ConfirmationCard';
import { CreateConfirmationDialog } from '@/components/confirmations/CreateConfirmationDialog';
import { Pagination } from '@/components/products/Pagination';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';

export default function ConfirmationsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { useDefaultOrganization } = useOrganization();
  const { data: organization, isLoading: orgLoading } = useDefaultOrganization(user?.id);
  const [, navigate] = useLocation();
  const { t } = useLanguage();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const organizationId = organization?.id;

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Store state
  const { page, pageSize, setPage, setPageSize } = useConfirmationListStore();

  // Fetch confirmations
  const {
    confirmations,
    total,
    totalPages,
    isLoading: confirmationsLoading,
  } = useConfirmations({
    userId: user?.id || '',
    orgId: organizationId || '',
    page,
    pageSize,
  });

  const handleConfirmationClick = (confirmationNumber: string) => {
    navigate(`/admin/confirmations/${confirmationNumber}`);
  };

  // Loading states
  if (authLoading || orgLoading) {
    return <PageLoader fullScreen={false} />;
  }

  if (!isAuthenticated || !organization || !organizationId) {
    return null;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('confirmations.title')}</h1>
          <p className="text-muted-foreground">{t('confirmations.subtitle')}</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('confirmations.create')}
        </Button>
      </div>

      {/* Confirmations grid */}
      {confirmationsLoading ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: pageSize }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-[180px] rounded-lg" />
            </div>
          ))}
        </div>
      ) : confirmations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CalendarCheck className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {t('confirmations.noConfirmations')}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            {t('confirmations.noConfirmationsDescription')}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
            {confirmations.map((confirmation) => (
              <ConfirmationCard
                key={confirmation.confirmation_id}
                confirmation={confirmation}
                onClick={() => handleConfirmationClick(confirmation.confirmation_number)}
              />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}

      {/* Create dialog */}
      <CreateConfirmationDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        organizationId={organizationId}
      />
    </div>
  );
}
