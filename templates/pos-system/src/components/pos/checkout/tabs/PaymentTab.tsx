import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { SalePayment } from '@/types/invoice';

const fmt = (n: number) => '₡' + Math.round(n).toLocaleString('es-CR');

const PAYMENT_METHODS = [
  { id: 1,  label: 'Efectivo',  icon: '💵' },
  { id: 3,  label: 'Tarjeta',   icon: '💳' },
  { id: 4,  label: 'SINPE',     icon: '📱' },
  { id: 99, label: 'Otro',      icon: '🔖' },
] as const;

const QUICK_AMOUNTS = [5_000, 10_000, 20_000, 50_000];

interface PaymentTabProps {
  cartTotal: number;
  payments: SalePayment[];
  onChange: (payments: SalePayment[]) => void;
}

export function PaymentTab({ cartTotal, payments, onChange }: PaymentTabProps) {
  const [cashInput, setCashInput] = useState<Record<number, string>>({});

  const paid = payments.reduce((s, p) => s + p.amount, 0);
  const remaining = Math.max(0, cartTotal - paid);
  const change = Math.max(0, paid - cartTotal);
  const isBalanced = paid >= cartTotal;

  const setAmount = (typeId: number, raw: string) => {
    setCashInput((prev) => ({ ...prev, [typeId]: raw }));
    const amount = parseFloat(raw) || 0;
    const next = payments.filter((p) => p.payment_type_id !== typeId);
    if (amount > 0) next.push({ payment_type_id: typeId, amount });
    onChange(next);
  };

  const exact = () => {
    const cashEntry = payments.find((p) => p.payment_type_id === 1);
    if (!cashEntry) {
      onChange([{ payment_type_id: 1, amount: cartTotal }]);
      setCashInput({ 1: String(cartTotal) });
    }
  };

  return (
    <div className="space-y-4">
      {/* Total display */}
      <div className="px-1 py-3 bg-muted/40 rounded-lg text-center">
        <div className="text-[10px] uppercase tracking-wider font-display font-bold text-muted-foreground">
          Total a cobrar
        </div>
        <div className="font-display font-extrabold text-[38px] leading-none mt-1 t-num text-primary">
          {fmt(cartTotal)}
        </div>
        {paid > 0 && (
          <div className="mt-1 text-[12px] text-muted-foreground">
            Pagado: {fmt(paid)}{remaining > 0 ? ` · Faltan: ${fmt(remaining)}` : ` · Vuelto: ${fmt(change)}`}
          </div>
        )}
      </div>

      {/* Payment methods */}
      <div className="space-y-2">
        <div className="text-[11px] font-display font-bold uppercase tracking-wider text-muted-foreground">
          Método de pago
        </div>
        <div className="grid grid-cols-4 gap-2">
          {PAYMENT_METHODS.map(({ id, label, icon }) => {
            const active = payments.some((p) => p.payment_type_id === id);
            return (
              <button
                key={id}
                onClick={() => {
                  if (active) {
                    onChange(payments.filter((p) => p.payment_type_id !== id));
                    setCashInput((prev) => { const n = { ...prev }; delete n[id]; return n; });
                  } else {
                    const leftover = Math.max(0, cartTotal - payments.reduce((s, p) => s + p.amount, 0));
                    onChange([...payments, { payment_type_id: id, amount: leftover }]);
                    setCashInput((prev) => ({ ...prev, [id]: String(leftover) }));
                  }
                }}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 h-16 rounded-md border text-[11px] font-semibold transition-colors',
                  active
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/40'
                )}
              >
                <span className="text-lg">{icon}</span>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Amount inputs per active method */}
      {PAYMENT_METHODS.filter(({ id }) => payments.some((p) => p.payment_type_id === id)).map(({ id, label }) => (
        <div key={id} className="space-y-1">
          <div className="text-[11px] font-display font-bold uppercase tracking-wider text-muted-foreground">
            Monto — {label}
          </div>
          {id === 1 && (
            <div className="grid grid-cols-4 gap-1.5 mb-1">
              <button
                onClick={exact}
                className="h-8 rounded-md border border-border bg-card text-[11px] font-mono t-num hover:border-primary/40"
              >
                Exacto
              </button>
              {QUICK_AMOUNTS.map((v) => (
                <button
                  key={v}
                  onClick={() => setAmount(1, String(Math.max(cartTotal, v < cartTotal ? cartTotal : v)))}
                  className="h-8 rounded-md border border-border bg-card text-[11px] font-mono t-num hover:border-primary/40"
                >
                  {fmt(v)}
                </button>
              ))}
            </div>
          )}
          <input
            type="number"
            value={cashInput[id] ?? payments.find((p) => p.payment_type_id === id)?.amount ?? ''}
            onChange={(e) => setAmount(id, e.target.value)}
            className="w-full h-11 rounded-md border border-border bg-background px-3 text-[15px] font-mono t-num focus:outline-none focus:border-primary"
            placeholder="0"
          />
        </div>
      ))}

      {isBalanced && (
        <div className="p-3 rounded-md bg-success/8 border border-success/20 text-[12px] text-success text-center font-semibold">
          ✓ Pago completo{change > 0 ? ` · Vuelto: ${fmt(change)}` : ''}
        </div>
      )}
    </div>
  );
}
