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
      store_code: '',
      store_name: '',
      slot_id: '',
      chain: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        store_code: initialData.store_code || '',
        store_name: initialData.store_name || '',
        slot_id: initialData.slot_id || '',
        chain: initialData.chain || '',
      });
    }
  }, [initialData, reset]);

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="store_code">{t('stores.fields.storeCode')} *</Label>
        <Input
          id="store_code"
          {...register('store_code', { required: t('stores.validation.storeCodeRequired') })}
          placeholder={t('stores.fields.storeCodePlaceholder')}
        />
        {errors.store_code && (
          <p className="text-sm text-destructive">{errors.store_code.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="store_name">{t('stores.fields.storeName')}</Label>
        <Input
          id="store_name"
          {...register('store_name')}
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
        <Label htmlFor="slot_id">{t('stores.fields.slotId')}</Label>
        <Input
          id="slot_id"
          {...register('slot_id')}
          placeholder={t('stores.fields.slotIdPlaceholder')}
        />
      </div>
    </form>
  );
}
