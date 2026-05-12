import { useState } from 'react';
import { cn } from '@/lib/utils';
import { FadeIn } from '@/components/ui/FadeIn';
import { useCart } from '@/store/cart';
import { DOCUMENT_TYPES } from '@/types/invoice';
import type { SalePayment, CurrencyCode, DocTypeCode } from '@/types/invoice';
import type { SaleReceiver } from '@/types/receiver';
import type { SaleReference } from '@/types/reference';
import type { SaleResponse } from '@/types/invoice';
import type { ClientSearchResult } from '@/hooks/useClientSearch';
import { PaymentTab } from './tabs/PaymentTab';
import { DocumentTab } from './tabs/DocumentTab';
import { ReceiverTab } from './tabs/ReceiverTab';
import { ReferencesTab } from './tabs/ReferencesTab';
import { CopiesTab } from './tabs/CopiesTab';
import { Receipt } from './Receipt';

const fmt = (n: number) => '₡' + Math.round(n).toLocaleString('es-CR');

type Step = 'payment' | 'processing' | 'done';

const TABS = [
  { id: 'pago',       label: 'Pago'       },
  { id: 'documento',  label: 'Documento'  },
  { id: 'receptor',   label: 'Receptor'   },
  { id: 'referencias',label: 'Referencias'},
  { id: 'copias',     label: 'Copias'     },
] as const;
type TabId = typeof TABS[number]['id'];

interface CartItem { id: string; name: string; price: number; qty: number; }

interface CheckoutModalProps {
  cartItems: CartItem[];
  cartTotal: number;
  subtotal: number;
  taxAmount: number;
  selectedClient: ClientSearchResult | null;
  onClose: () => void;
  onConfirm: (invoiceData: any) => Promise<void>;
}

export function CheckoutModal({
  cartItems,
  cartTotal,
  subtotal,
  taxAmount,
  selectedClient,
  onClose,
  onConfirm,
}: CheckoutModalProps) {
  const { doc_type } = useCart();
  const [step, setStep] = useState<Step>('payment');
  const [activeTab, setActiveTab] = useState<TabId>('pago');
  const [sale, setSale] = useState<SaleResponse | undefined>();
  const [error, setError] = useState<string | null>(null);

  // Invoice form state
  const [payments, setPayments] = useState<SalePayment[]>([]);
  const [docData, setDocData] = useState({
    sale_condition_id: 1,
    activity_code: '722000',
    currency_code: { iso_code: 'CRC', exchange_rate: 1 } as CurrencyCode,
    notes: '',
  });
  const [receiver, setReceiver] = useState<SaleReceiver>({});
  const [references, setReferences] = useState<SaleReference[]>([]);
  const [copyEmails, setCopyEmails] = useState<string[]>([]);

  const docInfo = DOCUMENT_TYPES.find((d) => d.code === doc_type);
  const docLabel = docInfo?.label ?? 'Documento';
  const needsReceiver = doc_type !== 4; // All except Tiquete
  const needsReferences = doc_type === 3 || doc_type === 2; // NC / ND
  const isPaid = payments.reduce((s, p) => s + p.amount, 0) >= cartTotal;

  const validate = (): string | null => {
    if (!isPaid) return 'El pago no cubre el total.';
    if (needsReceiver && !receiver.business_name) return 'El receptor es requerido para este tipo de documento.';
    if (needsReferences && references.length === 0) return 'Se requiere al menos una referencia para este tipo de documento.';
    return null;
  };

  const handleConfirm = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError(null);
    setStep('processing');

    const invoiceData = {
      ...docData,
      document_type: doc_type,
      receiver: needsReceiver ? receiver : null,
      references: needsReferences ? references : [],
      copy_emails: copyEmails.filter(Boolean),
      payments,
      subtotal,
      tax_amount: taxAmount,
      discount_amount: 0,
      total_amount: cartTotal,
    };

    try {
      await onConfirm(invoiceData);
      setStep('done');
    } catch (e: any) {
      setError(e.message || 'Error al procesar la venta');
      setStep('payment');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-foreground/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="w-full sm:max-w-md sm:rounded-2xl bg-card border border-border shadow-2xl overflow-hidden rounded-t-2xl flex flex-col"
        style={{ maxHeight: '92vh' }}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between shrink-0">
          <span className="font-display font-bold text-[17px]">
            {step === 'payment' && 'Finalizar venta'}
            {step === 'processing' && 'Procesando…'}
            {step === 'done' && '¡Venta completada!'}
          </span>
          {step !== 'processing' && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground"
            >
              ✕
            </button>
          )}
        </div>

        {/* Payment step */}
        {step === 'payment' && (
          <>
            <div className="overflow-auto flex-1">
              {/* Total banner */}
              <div className="px-5 py-4 bg-muted/40 shrink-0">
                <div className="text-[10px] uppercase tracking-wider font-display font-bold text-muted-foreground">
                  Total
                </div>
                <div className="font-display font-extrabold text-[40px] leading-none mt-1 t-num text-primary">
                  {fmt(cartTotal)}
                </div>
                <div className="text-[12px] text-muted-foreground mt-1">
                  {cartItems.length} ítems · {docLabel}
                  {selectedClient && ` · ${selectedClient.client_name || selectedClient.business_name}`}
                </div>
              </div>

              {/* Tab strip — only show for invoice types */}
              <div className="flex border-b border-border bg-card overflow-x-auto shrink-0">
                {TABS.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={cn(
                      'flex-shrink-0 px-4 py-2.5 text-[12px] font-semibold border-b-2 transition-colors whitespace-nowrap',
                      activeTab === id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {label}
                    {id === 'receptor' && needsReceiver && !receiver.business_name && (
                      <span className="ml-1 text-[9px] text-destructive">*</span>
                    )}
                    {id === 'referencias' && needsReferences && references.length === 0 && (
                      <span className="ml-1 text-[9px] text-destructive">*</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="px-5 py-4">
                {activeTab === 'pago' && (
                  <FadeIn key="pago" duration={0.3}>
                    <PaymentTab cartTotal={cartTotal} payments={payments} onChange={setPayments} />
                  </FadeIn>
                )}
                {activeTab === 'documento' && (
                  <FadeIn key="documento" duration={0.3}>
                    <DocumentTab data={docData} onChange={(p) => setDocData((d) => ({ ...d, ...p }))} />
                  </FadeIn>
                )}
                {activeTab === 'receptor' && (
                  <FadeIn key="receptor" duration={0.3}>
                    <ReceiverTab
                      receiver={receiver}
                      selectedClient={selectedClient}
                      onChange={(p) => setReceiver((r) => ({ ...r, ...p }))}
                    />
                  </FadeIn>
                )}
                {activeTab === 'referencias' && (
                  <FadeIn key="referencias" duration={0.3}>
                    <ReferencesTab references={references} onChange={setReferences} />
                  </FadeIn>
                )}
                {activeTab === 'copias' && (
                  <FadeIn key="copias" duration={0.3}>
                    <CopiesTab emails={copyEmails} onChange={setCopyEmails} />
                  </FadeIn>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-card shrink-0 space-y-2">
              {error && (
                <div className="text-[12px] text-destructive text-center">{error}</div>
              )}
              <button
                onClick={handleConfirm}
                disabled={!isPaid}
                className="w-full h-12 rounded-md bg-primary text-primary-foreground font-semibold text-[14px] flex items-center justify-center gap-2 shadow-sm shadow-primary/30 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Confirmar · {fmt(cartTotal)}
                <span>›</span>
              </button>
            </div>
          </>
        )}

        {/* Processing step */}
        {step === 'processing' && (
          <div className="px-6 py-16 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <div className="font-display font-bold text-[18px]">Procesando venta</div>
            <div className="text-[12px] text-muted-foreground space-y-1">
              <div>✓ Validando datos</div>
              <div>✓ Guardando documento</div>
              <div className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Enviando a Hacienda
              </div>
            </div>
          </div>
        )}

        {/* Done step */}
        {step === 'done' && (
          <Receipt
            sale={sale}
            cartTotal={cartTotal}
            itemCount={cartItems.length}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}
