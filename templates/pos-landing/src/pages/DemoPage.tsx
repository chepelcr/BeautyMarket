import { DemoApp } from '@/components/demo/DemoApp';

// Full-screen demo — no TopNav or Footer (matches wireframe demo/index.html)
export function DemoPage() {
  return (
    <div className="h-screen overflow-hidden bg-background smooth-tokens relative">
      <DemoApp />
    </div>
  );
}
