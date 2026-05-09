import { Icon } from '@/components/ui/Icon';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/cn';

type Device = 'desktop' | 'mobile';

interface DeviceSwitchProps {
  device:    Device;
  setDevice: (d: Device) => void;
}

export function DeviceSwitch({ device, setDevice }: DeviceSwitchProps) {
  const { t } = useTranslation();
  return (
    <div className="fixed top-3 right-3 z-30 flex items-center gap-1 p-1 rounded-md bg-card border border-border shadow-md text-[11px]">
      <span className="px-1.5 text-muted-foreground hidden sm:inline">
        {t('demo.demoLabel')}
      </span>
      {(['desktop', 'mobile'] as const).map(d => (
        <button
          key={d}
          onClick={() => setDevice(d)}
          className={cn(
            'h-7 px-2 rounded inline-flex items-center gap-1',
            device === d ? 'bg-foreground text-background' : 'text-muted-foreground',
          )}
        >
          <Icon name={d === 'desktop' ? 'Monitor' : 'Smartphone'} size={11} />
          <span className="hidden sm:inline">
            {d === 'desktop' ? t('hero.deviceDesktop') : t('hero.deviceMobile')}
          </span>
        </button>
      ))}
    </div>
  );
}
