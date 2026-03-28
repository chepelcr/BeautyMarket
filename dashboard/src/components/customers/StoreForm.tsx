import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import type { StoreRequestDTO, StoreResponse } from '@/models';

interface StoreFormProps {
  onSubmit: (data: StoreRequestDTO) => void;
  initialData?: Partial<StoreResponse>;
  formId?: string;
}

export function StoreForm({ onSubmit, initialData, formId = 'store-form' }: StoreFormProps) {
  const { t } = useLanguage();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<StoreRequestDTO>({
    defaultValues: {
      storeCode: '',
      storeName: '',
      slotId: '',
      chain: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        storeCode: initialData.storeCode || '',
        storeName: initialData.storeName || '',
        slotId: initialData.slotId || '',
        chain: initialData.chain || '',
      });
    }
  }, [initialData, reset]);

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="storeCode">{t('stores.fields.storeCode')} *</Label>
        <Input
          id="storeCode"
          {...register('storeCode', { required: t('stores.validation.storeCodeRequired') })}
          placeholder={t('stores.fields.storeCodePlaceholder')}
        />
        {errors.storeCode && (
          <p className="text-sm text-destructive">{errors.storeCode.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="storeName">{t('stores.fields.storeName')}</Label>
        <Input
          id="storeName"
          {...register('storeName')}
          placeholder={t('stores.fields.storeNamePlaceholder')}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="chain">{t('stores.fields.chain')}</Label>
        <Input
          id="chain"
          {...register('chain')}
          placeholder={t('stores.fields.chainPlaceholder')}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="slotId">{t('stores.fields.slotId')}</Label>
        <Input
          id="slotId"
          {...register('slotId')}
          placeholder={t('stores.fields.slotIdPlaceholder')}
        />
      </div>
    </form>
  );
}
