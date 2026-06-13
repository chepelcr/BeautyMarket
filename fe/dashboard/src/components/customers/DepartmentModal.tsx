import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DepartmentForm } from './DepartmentForm';
import { useLanguage } from '@/contexts/LanguageContext';
import type { DepartmentResponse, CreateDepartmentDTO } from '@/models';

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDepartmentDTO) => void;
  editingDepartment?: DepartmentResponse | null;
  isLoading?: boolean;
}

const FORM_ID = 'department-modal-form';

export function DepartmentModal({ isOpen, onClose, onSubmit, editingDepartment, isLoading }: DepartmentModalProps) {
  const { t } = useLanguage();
  const isEditing = !!editingDepartment;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('departments.editDepartment') : t('departments.addDepartment')}
          </DialogTitle>
        </DialogHeader>

        <DepartmentForm
          formId={FORM_ID}
          onSubmit={onSubmit}
          initialData={editingDepartment ?? undefined}
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
