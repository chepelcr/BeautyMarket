import { DemoApp } from '@/components/demo/DemoApp';

export function DemoPage() {
  return (
    <div
      className="bg-background smooth-tokens"
      style={{ height: 'calc(100vh - 64px)' }}
    >
      <DemoApp />
    </div>
  );
}
