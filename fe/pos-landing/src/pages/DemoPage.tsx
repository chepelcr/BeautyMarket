import { DemoApp } from '@/components/demo/DemoApp';

// h-dvh = dynamic viewport height — excludes mobile browser chrome (address bar)
// This prevents top/bottom cutoff on iOS/Android when the browser UI is visible
export function DemoPage() {
  return (
    <div className="h-dvh overflow-hidden bg-background smooth-tokens relative">
      <DemoApp />
    </div>
  );
}
