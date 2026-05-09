import { Icon } from '@/components/ui/Icon';
import { useTranslation } from '@/hooks/useTranslation';
import type { DemoCustomer } from '@/types';

interface CustomerListProps {
  customers: DemoCustomer[];
  activeId:  string;
  onPick:    (c: DemoCustomer) => void;
}

export function CustomerList({ customers, activeId, onPick }: CustomerListProps) {
  const { t } = useTranslation();
  return (
    <div className="flex-1 overflow-auto scroll-area p-3 space-y-2">
      {customers.map(c => (
        <button
          key={c.id}
          onClick={() => onPick(c)}
          className={`w-full text-left p-3 rounded-md border ${activeId === c.id ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/40'}`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="font-semibold text-[14px] truncate">{c.name}</div>
              <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                {c.id_doc}{c.email ? ' · ' + c.email : ''}
              </div>
            </div>
            {activeId === c.id && <Icon name="Check" size={16} className="text-primary shrink-0" />}
          </div>
        </button>
      ))}
    </div>
  );
}
