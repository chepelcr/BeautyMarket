import { useState, useCallback } from 'react';
import { Plus, Search, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useStores, useStoreMutations } from '@/hooks/useStores';
import { useStoreListStore } from '@/store/store-list-store';
import { buildStoreSearchString } from '@/lib/storeSearchBuilder';
import { StoreCard } from './StoreCard';
import { StoreModal } from './StoreModal';
import { StoreUploadModal } from './StoreUploadModal';
import type { StoreResponse, StoreRequestDTO } from '@/models';

interface StoresListProps {
  orgId: string;
  clientId: string;
}

export function StoresList({ orgId, clientId }: StoresListProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreResponse | null>(null);

  const { searchQuery, page, pageSize, sortBy, sortOrder, setSearchQuery, setPage } = useStoreListStore();

  const search = buildStoreSearchString({ textSearch: searchQuery, sortBy, sortOrder });

  const { stores, totalPages, isLoading } = useStores({ orgId, clientId, search, page, pageSize });
  const { createStore, updateStore, updateStoreStatus, uploadStores } = useStoreMutations(orgId, clientId);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, [setSearchQuery]);

  const handleOpenAdd = () => {
    setEditingStore(null);
    setShowModal(true);
  };

  const handleEdit = (store: StoreResponse) => {
    setEditingStore(store);
    setShowModal(true);
  };

  const handleSubmit = async (data: StoreRequestDTO) => {
    try {
      if (editingStore) {
        await updateStore.mutateAsync({ storeId: editingStore.storeId, data });
        toast({ title: t('common.saved') });
      } else {
        await createStore.mutateAsync(data);
        toast({ title: t('common.created') });
      }
      setShowModal(false);
      setEditingStore(null);
    } catch {
      toast({ title: t('common.error'), variant: 'destructive' });
    }
  };

  const handleStatusChange = async (storeId: string, status: number) => {
    try {
      await updateStoreStatus.mutateAsync({ storeId, status });
      toast({ title: t('stores.statusUpdated') });
    } catch {
      toast({ title: t('stores.statusUpdateFailed'), variant: 'destructive' });
    }
  };

  const handleUpload = async (file: string, filename: string) => {
    const res = await uploadStores.mutateAsync({ file, filename });
    toast({ title: `${res.count} ${t('stores.uploadSuccess')}` });
    return res;
  };

  const isMutating = createStore.isPending || updateStore.isPending;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder={t('stores.search')}
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowUpload(true)}>
          <Upload className="h-4 w-4 mr-2" />
          {t('stores.uploadExcel')}
        </Button>
        <Button size="sm" onClick={handleOpenAdd}>
          <Plus className="h-4 w-4 mr-2" />
          {t('stores.addStore')}
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : stores.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <p className="font-medium">{t('stores.noStores')}</p>
          <p className="text-sm mt-1">{t('stores.noStoresDescription')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {stores.map((store) => (
            <StoreCard
              key={store.storeId}
              store={store}
              onEdit={handleEdit}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span className="text-sm self-center text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      )}

      <StoreModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingStore(null); }}
        onSubmit={handleSubmit}
        editingStore={editingStore}
        isLoading={isMutating}
      />

      <StoreUploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onUpload={handleUpload}
      />
    </div>
  );
}
