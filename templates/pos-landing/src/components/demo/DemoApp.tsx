import { useState, useEffect } from 'react';
import { PosDesktop } from './PosDesktop';
import { PosMobile }  from './PosMobile';
import { DeviceSwitch } from './DeviceSwitch';
import { CheckoutModal } from './CheckoutModal';
import { Toast } from '@/components/ui/Toast';
import { useCart } from '@/hooks/useCart';
import { useConfig } from '@/hooks/useConfig';

type Device = 'desktop' | 'mobile';

function useDevice(): [Device, (d: Device) => void] {
  const [device, setDeviceState] = useState<Device>(() => {
    const saved = localStorage.getItem('pos-demo-device');
    if (saved === 'mobile' || saved === 'desktop') return saved;
    return window.innerWidth < 768 ? 'mobile' : 'desktop';
  });

  const setDevice = (d: Device) => {
    setDeviceState(d);
    localStorage.setItem('pos-demo-device', d);
  };

  return [device, setDevice];
}

interface ToastState {
  msg:  string;
  kind: 'success' | 'info' | 'error';
}

export function DemoApp() {
  const { config }                = useConfig();
  const cart                      = useCart(config.demo.customers[0]);
  const [device, setDevice]       = useDevice();
  const [checkout, setCheckout]   = useState(false);
  const [toast, setToast]         = useState<ToastState | null>(null);

  // Seed the cart with first product on mount
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
      <DeviceSwitch device={device} setDevice={setDevice} />

      {device === 'mobile' ? (
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

      {toast && (
        <Toast {...toast} onDone={() => setToast(null)} />
      )}
    </div>
  );
}
