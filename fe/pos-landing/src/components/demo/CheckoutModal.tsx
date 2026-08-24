import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Spinner } from '@/components/ui/Spinner';
import { StatusDot } from '@/components/ui/StatusDot';
import { Receipt } from './Receipt';
import { useTranslation } from '@/hooks/useTranslation';
import { fmtCRC } from '@/lib/format';
import type { CartState } from '@/hooks/useCart';
import { cn } from '@/lib/cn';

type Step = 'payment' | 'processing' | 'done';
type Method = 'cash' | 'card' | 'sinpe';

interface CheckoutModalProps {
  cart:        CartState;
  onClose:     () => void;
  onConfirmed: () => void;
}

export function CheckoutModal({ cart, onClose, onConfirmed }: CheckoutModalProps) {
  const { t }        = useTranslation();
  const [step, setStep]       = useState<Step>('payment');
  const [method, setMethod]   = useState<Method>('cash');
  const [tendered, setTendered] = useState(cart.total);
  const change = Math.max(0, tendered - cart.total);

  const methods: Array<[Method, string, 'Banknote' | 'CreditCard' | 'Smartphone']> = [
    ['cash',  t('demo.checkout.paymentMethods.cash'),  'Banknote'],
    ['card',  t('demo.checkout.paymentMethods.card'),  'CreditCard'],
    ['sinpe', t('demo.checkout.paymentMethods.sinpe'), 'Smartphone'],
  ];

  const processingSteps = t('demo.checkout.processingSteps') as unknown as string[];
  const safeSteps = Array.isArray(processingSteps) ? processingSteps : [];

  const submit = () => {
    setStep('processing');
    setTimeout(() => setStep('done'), 1400);
  };

  const docLabel = cart.docType === 'FE' ? 'Factura electrónica' : cart.docType === 'TE' ? 'Tiquete electrónico' : 'Nota crédito';

  return (
    <div className="fixed inset-0 z-50 bg-foreground/50 fade-anim flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="w-full sm:max-w-md sm:rounded-2xl bg-card border border-border shadow-2xl shadow-foreground/30 overflow-hidden rounded-t-2xl sheet-anim sm:animate-none flex flex-col"
        style={{ maxHeight: '92vh' }}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between shrink-0">
          <span className="font-display font-bold text-[17px]">
            {step === 'payment'    && t('demo.checkout.title')}
            {step === 'processing' && t('demo.checkout.processingTitle')}
            {step === 'done'       && '¡Venta completada!'}
          </span>
          {step !== 'processing' && (
            <button onClick={onClose} className="w-8 h-8 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground">
              <Icon name="X" size={16} />
            </button>
          )}
        </div>

        {/* Payment step */}
        {step === 'payment' && (
          <>
            <div className="overflow-auto scroll-area">
              {/* Total banner */}
              <div className="px-5 py-4 bg-muted/40">
                <div className="text-[10px] uppercase tracking-wider font-display font-bold text-muted-foreground">
                  {t('demo.checkout.totalLabel')}
                </div>
                <div className="font-display font-extrabold text-[40px] leading-none mt-1 t-num text-primary">
                  {fmtCRC(cart.total)}
                </div>
                <div className="text-[12px] text-muted-foreground mt-1.5">
                  {cart.count} ítems · {docLabel} · {cart.customer.name}
                </div>
              </div>

              <div className="px-5 py-4 space-y-3">
                {/* Payment method */}
                <div>
                  <div className="text-[11px] font-display font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    {t('demo.checkout.paymentTitle')}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {methods.map(([k, l, Ic]) => (
                      <button
                        key={k}
                        onClick={() => setMethod(k)}
                        className={cn(
                          'flex flex-col items-center justify-center gap-1.5 h-20 rounded-md border',
                          method === k
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border bg-card text-muted-foreground',
                        )}
                      >
                        <Icon name={Ic} size={18} />
                        <span className="text-[11px] font-semibold">{l}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cash flow */}
                {method === 'cash' && (
                  <div>
                    <div className="text-[11px] font-display font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      {t('demo.checkout.tenderedLabel')}
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 mb-2">
                      {[cart.total, 5000, 10000, 20000].map((v, i) => (
                        <button
                          key={i}
                          onClick={() => setTendered(Math.max(cart.total, v < cart.total ? cart.total : v))}
                          className="h-8 rounded-md border border-border bg-card text-[11px] font-mono t-num hover:border-primary/40"
                        >
                          {i === 0 ? t('demo.checkout.exactLabel') : fmtCRC(v)}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      value={tendered}
                      onChange={e => setTendered(Number(e.target.value) || 0)}
                      className="w-full h-11 rounded-md border border-border bg-background px-3 text-[15px] font-mono t-num focus:outline-none focus:border-primary"
                    />
                    <div className="flex justify-between mt-2 text-[12px]">
                      <span className="text-muted-foreground">{t('demo.checkout.changeLabel')}</span>
                      <span className="font-mono t-num font-bold">{fmtCRC(change)}</span>
                    </div>
                  </div>
                )}

                {/* Card note */}
                {method === 'card' && (
                  <div className="rounded-md bg-muted/40 border border-border p-3 text-[12px] text-muted-foreground flex items-start gap-2">
                    <Icon name="CreditCard" size={14} className="mt-0.5 shrink-0" />
                    <span>{t('demo.checkout.cardNote')}</span>
                  </div>
                )}

                {/* SINPE note */}
                {method === 'sinpe' && (
                  <div className="rounded-md bg-muted/40 border border-border p-3 text-[12px] text-muted-foreground flex items-start gap-2">
                    <Icon name="Smartphone" size={14} className="mt-0.5 shrink-0" />
                    <span>{t('demo.checkout.sinpeNote')} <strong className="text-foreground">{fmtCRC(cart.total)}</strong></span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-border bg-card shrink-0">
              <button
                onClick={submit}
                className="w-full h-12 rounded-md bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 shadow-sm shadow-primary/30"
              >
                {t('demo.checkout.confirmLabel')} · {fmtCRC(cart.total)}
                <Icon name="ArrowRight" size={15} />
              </button>
            </div>
          </>
        )}

        {/* Processing step */}
        {step === 'processing' && (
          <div className="px-6 py-12 flex flex-col items-center text-center gap-4">
            <Spinner size={80} />
            <div className="font-display font-bold text-[18px]">{t('demo.checkout.processingTitle')}</div>
            <div className="text-[12px] text-muted-foreground space-y-1">
              {safeSteps.map((s, i) => (
                <div key={i} className="flex items-center justify-center gap-2">
                  {i < 2
                    ? <Icon name="Check" size={12} className="text-success" />
                    : <StatusDot size={7} />
                  }
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Done step */}
        {step === 'done' && (
          <Receipt
            cart={cart}
            method={method}
            change={change}
            tendered={tendered}
            onClose={onConfirmed}
          />
        )}
      </div>
    </div>
  );
}
