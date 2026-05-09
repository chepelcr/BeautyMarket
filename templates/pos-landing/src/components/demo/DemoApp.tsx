import { useState, useEffect } from 'react';
import { PosDesktop } from './PosDesktop';
import { PosMobile }  from './PosMobile';
import { CheckoutModal } from './CheckoutModal';
import { Toast } from '@/components/ui/Toast';
import { useCart } from '@/hooks/useCart';
import { useConfig } from '@/hooks/useConfig';

// Reactive auto-detect: switches on resize/orientation change, no localStorage
function useAutoDevice(): 'desktop' | 'mobile' {
  const [device, setDevice] = useState<'desktop' | 'mobile'>(() =>
    window.innerWidth < 768 ? 'mobile' : 'desktop'
  );

  useEffect(() => {
    const onResize = () => setDevice(window.innerWidth < 768 ? 'mobile' : 'desktop');
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return device;
}

interface ToastState {
  msg:  string;
  kind: 'success' | 'info' | 'error';
}

export function DemoApp() {
  const { config }              = useConfig();
  const cart                    = useCart(config.demo.customers[0]);
  const device                  = useAutoDevice();
  const [checkout, setCheckout] = useState(false);
  const [toast, setToast]       = useState<ToastState | null>(null);

  // Seed cart with first product so demo starts non-empty
  useEffect(() => {
    if (cart.items.length === 0 && config.demo.products.length > 0) {
      cart.add(config.demo.products[0]);
    }
  }, []);

  const onConfirmed = () => {
    setCheckout(false);
    cart.clear();
    setToast({ msg: 'Venta enviada a Hacienda · XML firmado', kind: 'success' });
  };

  return (
    <div className="h-full relative overflow-hidden">
      {device === 'mobile' ? (
        // On actual mobile: fill the viewport edge-to-edge
        // On desktop (when narrow): show phone frame centered on grey background
        <div className="h-full bg-foreground/5 flex items-center justify-center p-0 md:p-6">
          <div className="h-full w-full md:w-[390px] md:h-[844px] md:rounded-[44px] md:border-[10px] md:border-foreground/85 md:shadow-2xl md:shadow-foreground/40 overflow-hidden bg-background relative">
            <PosMobile cart={cart} onCheckout={() => setCheckout(true)} />
          </div>
        </div>
      ) : (
        <PosDesktop cart={cart} onCheckout={() => setCheckout(true)} />
      )}

      {checkout && (
        <CheckoutModal
          cart={cart}
          onClose={() => setCheckout(false)}
          onConfirmed={onConfirmed}
        />
      )}

      {toast && <Toast {...toast} onDone={() => setToast(null)} />}
    </div>
  );
}
