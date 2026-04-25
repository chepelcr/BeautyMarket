import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import type { CreateDepartmentDTO, DepartmentResponse } from '@/models';

interface DepartmentFormProps {
  onSubmit: (data: CreateDepartmentDTO) => void;
  initialData?: Partial<DepartmentResponse>;
  formId?: string;
}

export function DepartmentForm({ onSubmit, initialData, formId = 'department-form' }: DepartmentFormProps) {
  const { t } = useLanguage();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateDepartmentDTO>({
    defaultValues: {
      department_code: '',
      name: '',
      supplier_code: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        department_code: initialData.department_code || '',
        name: initialData.name || '',
        supplier_code: initialData.supplier_code || '',
      });
    }
  }, [initialData, reset]);

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="department_code">{t('departments.fields.departmentCode')} *</Label>
        <Input
          id="department_code"
          {...register('department_code', { required: t('departments.validation.departmentCodeRequired') })}
          placeholder={t('departments.fields.departmentCodePlaceholder')}
        />
        {errors.department_code && (
          <p className="text-sm text-destructive">{errors.department_code.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="name">{t('departments.fields.name')}</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder={t('departments.fields.namePlaceholder')}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="supplier_code">{t('departments.fields.supplierCode')}</Label>
        <Input
          id="supplier_code"
          {...register('supplier_code')}
          placeholder={t('departments.fields.supplierCodePlaceholder')}
        />
      </div>
    </form>
  );
}
