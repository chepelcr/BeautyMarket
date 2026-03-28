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
      departmentCode: '',
      name: '',
      supplierCode: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        departmentCode: initialData.departmentCode || '',
        name: initialData.name || '',
        supplierCode: initialData.supplierCode || '',
      });
    }
  }, [initialData, reset]);

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="departmentCode">{t('departments.fields.departmentCode')} *</Label>
        <Input
          id="departmentCode"
          {...register('departmentCode', { required: t('departments.validation.departmentCodeRequired') })}
          placeholder={t('departments.fields.departmentCodePlaceholder')}
        />
        {errors.departmentCode && (
          <p className="text-sm text-destructive">{errors.departmentCode.message}</p>
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
        <Label htmlFor="supplierCode">{t('departments.fields.supplierCode')}</Label>
        <Input
          id="supplierCode"
          {...register('supplierCode')}
          placeholder={t('departments.fields.supplierCodePlaceholder')}
        />
      </div>
    </form>
  );
}
