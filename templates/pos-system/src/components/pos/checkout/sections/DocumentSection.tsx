import { FileText } from 'lucide-react';
import { useAllSaleConditions } from '@/hooks/useDataApi';
import type { GetAllSaleConditionsParams } from '@/services/data-api';
import { CountryISO } from '@/lib/enums';
import { useLanguage } from '@/contexts/LanguageContext';
import { SectionWrapper } from '@/components/common/SectionWrapper';
import type { CurrencyCode } from '@/types/invoice';

interface DocumentSectionData {
  /** Hacienda sale condition code. */
  sale_condition: string;
  activity_code: string;
  /** Document-level currency. */
  currency: CurrencyCode;
  notes: string;
}

interface DocumentSectionProps {
  isExpanded: boolean;
  onToggle: () => void;
  data: DocumentSectionData;
  onChange: (patch: Partial<DocumentSectionData>) => void;
}

export function DocumentSection({
  isExpanded,
  onToggle,
  data,
  onChange,
}: DocumentSectionProps) {
  const { t } = useLanguage();
  const { data: saleConditions } = useAllSaleConditions({
    iso_code: CountryISO.COSTA_RICA,
  } as GetAllSaleConditionsParams);

  return (
    <SectionWrapper
      title={t('checkout.tab.document')}
      icon={FileText}
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      {/* Sale condition (Hacienda code string) */}
      <div className="space-y-1">
        <label className="text-[11px] font-display font-bold uppercase tracking-wider text-muted-foreground">
          {t('checkout.document.saleCondition')}
        </label>
        <select
          value={data.sale_condition}
          onChange={(e) => onChange({ sale_condition: e.target.value })}
          className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:border-primary"
        >
          {(saleConditions ?? []).map((sc: any) => (
            <option key={sc.code ?? sc.id} value={sc.code ?? String(sc.id).padStart(2, '0')}>
              {sc.description}
            </option>
          ))}
        </select>
      </div>

      {/* Activity code */}
      <div className="space-y-1">
        <label className="text-[11px] font-display font-bold uppercase tracking-wider text-muted-foreground">
          {t('checkout.document.activityCode')}
        </label>
        <input
          value={data.activity_code}
          onChange={(e) => onChange({ activity_code: e.target.value })}
          className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:border-primary font-mono"
          placeholder="722000"
          maxLength={20}
        />
      </div>

      {/* Currency */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-display font-bold uppercase tracking-wider text-muted-foreground">
            {t('checkout.document.currency')}
          </label>
          <select
            value={data.currency.currency_code}
            onChange={(e) => onChange({ currency: { ...data.currency, currency_code: e.target.value } })}
            className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:border-primary"
          >
            <option value="CRC">{t('checkout.document.currency.crc')}</option>
            <option value="USD">{t('checkout.document.currency.usd')}</option>
            <option value="EUR">{t('checkout.document.currency.eur')}</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-display font-bold uppercase tracking-wider text-muted-foreground">
            {t('checkout.document.exchangeRate')}
          </label>
          <input
            type="number"
            value={data.currency.exchange_rate ?? 1}
            onChange={(e) =>
              onChange({ currency: { ...data.currency, exchange_rate: parseFloat(e.target.value) || 1 } })
            }
            className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:border-primary font-mono"
            min={0}
            step={0.01}
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1">
        <label className="text-[11px] font-display font-bold uppercase tracking-wider text-muted-foreground">
          {t('checkout.document.notes')}
        </label>
        <textarea
          value={data.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          rows={3}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
          placeholder={t('checkout.document.notesPlaceholder')}
        />
      </div>
    </SectionWrapper>
  );
}
