import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StoreForm } from './StoreForm';
import { useLanguage } from '@/contexts/LanguageContext';
import type { StoreResponse, StoreRequestDTO } from '@/models';

interface StoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StoreRequestDTO) => void;
  editingStore?: StoreResponse | null;
  isLoading?: boolean;
}

const FORM_ID = 'store-modal-form';

export function StoreModal({ isOpen, onClose, onSubmit, editingStore, isLoading }: StoreModalProps) {
  const { t } = useLanguage();
  const isEditing = !!editingStore;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('stores.editStore') : t('stores.addStore')}
          </DialogTitle>
        </DialogHeader>

        <StoreForm
          formId={FORM_ID}
          onSubmit={onSubmit}
          initialData={editingStore ?? undefined}
        />

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form={FORM_ID} disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEditing ? t('common.save') : t('common.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
