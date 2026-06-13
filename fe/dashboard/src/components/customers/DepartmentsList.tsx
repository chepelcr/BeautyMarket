import { useState, useCallback } from 'react';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useDepartments, useDepartmentMutations } from '@/hooks/useDepartments';
import { useDepartmentListStore } from '@/store/department-list-store';
import { buildDepartmentSearchString } from '@/lib/departmentSearchBuilder';
import { DepartmentCard } from './DepartmentCard';
import { DepartmentModal } from './DepartmentModal';
import type { DepartmentResponse, CreateDepartmentDTO } from '@/models';

interface DepartmentsListProps {
  orgId: string;
  clientId: string;
}

export function DepartmentsList({ orgId, clientId }: DepartmentsListProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentResponse | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { searchQuery, page, pageSize, sortBy, sortOrder, setSearchQuery, setPage } = useDepartmentListStore();

  const search = buildDepartmentSearchString({ textSearch: searchQuery, sortBy, sortOrder });

  const { departments, totalPages, isLoading } = useDepartments({ orgId, clientId, search, page, pageSize });
  const { createDepartment, updateDepartment, deleteDepartment } = useDepartmentMutations(orgId, clientId);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, [setSearchQuery]);

  const handleOpenAdd = () => {
    setEditingDept(null);
    setShowModal(true);
  };

  const handleEdit = (dept: DepartmentResponse) => {
    setEditingDept(dept);
    setShowModal(true);
  };

  const handleSubmit = async (data: CreateDepartmentDTO) => {
    try {
      if (editingDept) {
        await updateDepartment.mutateAsync({ departmentId: editingDept.department_id, data });
        toast({ title: t('common.saved') });
      } else {
        await createDepartment.mutateAsync(data);
        toast({ title: t('common.created') });
      }
      setShowModal(false);
      setEditingDept(null);
    } catch {
      toast({ title: t('common.error'), variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteDepartment.mutateAsync(deletingId);
      toast({ title: t('departments.deleted') });
    } catch {
      toast({ title: t('departments.deleteFailed'), variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  const isMutating = createDepartment.isPending || updateDepartment.isPending;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder={t('departments.search')}
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <Button size="sm" onClick={handleOpenAdd}>
          <Plus className="h-4 w-4 mr-2" />
          {t('departments.addDepartment')}
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : departments.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <p className="font-medium">{t('departments.noDepartments')}</p>
          <p className="text-sm mt-1">{t('departments.noDepartmentsDescription')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {departments.map((dept) => (
            <DepartmentCard
              key={dept.department_id}
              department={dept}
              onEdit={handleEdit}
              onDelete={setDeletingId}
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

      <DepartmentModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingDept(null); }}
        onSubmit={handleSubmit}
        editingDepartment={editingDept}
        isLoading={isMutating}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('departments.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('departments.confirmDelete')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
