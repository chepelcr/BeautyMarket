import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { DepartmentResponse } from '@/models';

interface DepartmentCardProps {
  department: DepartmentResponse;
  onEdit: (dept: DepartmentResponse) => void;
  onDelete: (departmentId: string) => void;
}

export function DepartmentCard({ department, onEdit, onDelete }: DepartmentCardProps) {
  const { t } = useLanguage();

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="pt-4 pb-3 px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <span className="font-mono text-sm font-semibold">{department.department_code}</span>
            {department.name && (
              <p className="text-sm text-foreground mt-0.5 truncate">{department.name}</p>
            )}
            {department.supplier_code && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('departments.fields.supplierCode')}: {department.supplier_code}
              </p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(department)}>
                <Pencil className="h-4 w-4 mr-2" />
                {t('customers.edit')}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(department.department_id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('customers.actions.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
