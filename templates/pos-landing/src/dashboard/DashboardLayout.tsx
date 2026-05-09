import { lazy, Suspense, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { LogoIcon } from '@/components/ui/LogoIcon';
import { Icon } from '@/components/ui/Icon';
import { Spinner } from '@/components/ui/Spinner';
import { useSaveConfig } from '@/hooks/useSaveConfig';
import { cn } from '@/lib/cn';

const ThemeTab        = lazy(() => import('./ThemeTab').then(m => ({ default: m.ThemeTab })));
const TranslationsTab = lazy(() => import('./TranslationsTab').then(m => ({ default: m.TranslationsTab })));
const PricingTab      = lazy(() => import('./PricingTab').then(m => ({ default: m.PricingTab })));
const ProductsTab     = lazy(() => import('./ProductsTab').then(m => ({ default: m.ProductsTab })));
const SectionsTab     = lazy(() => import('./SectionsTab').then(m => ({ default: m.SectionsTab })));

type TabId = 'theme' | 'sections' | 'pricing' | 'products' | 'translations';

const TABS: Array<{ id: TabId; label: string; icon: 'Palette' | 'LayoutDashboard' | 'DollarSign' | 'Package' | 'Languages' }> = [
  { id: 'theme',        label: 'Theme',        icon: 'Palette'         },
  { id: 'sections',     label: 'Sections',     icon: 'LayoutDashboard' },
  { id: 'pricing',      label: 'Pricing',      icon: 'DollarSign'      },
  { id: 'products',     label: 'Products',     icon: 'Package'         },
  { id: 'translations', label: 'Translations', icon: 'Languages'       },
];

export function DashboardLayout() {
  const [activeTab, setActiveTab] = useState<TabId>('theme');
  const { save, saving, saved, error } = useSaveConfig();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleSave = async () => {
    await save();
    iframeRef.current?.contentWindow?.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {/* Dashboard top bar */}
      <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <LogoIcon size={28} />
          <span className="font-display font-bold">Local Dashboard</span>
          <span className="px-2 py-0.5 rounded bg-warning/20 text-warning text-[10px] font-display font-bold uppercase tracking-wider">localhost only</span>
        </div>
        <div className="flex items-center gap-3">
          {error && <span className="text-xs text-destructive">{error}</span>}
          {saved && <span className="text-xs text-success font-semibold">Saved ✓</span>}
          <Link to="/" target="_blank" className="h-9 px-3 rounded-md border border-border text-sm font-medium hover:bg-muted flex items-center gap-1.5">
            <Icon name="Eye" size={14} />Preview
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 disabled:opacity-60"
          >
            {saving ? <Spinner size={16} /> : <Icon name="Save" size={14} />}
            {saving ? 'Saving…' : 'Save to disk'}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-52 shrink-0 bg-card border-r border-border flex flex-col">
          <nav className="p-2 space-y-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full flex items-center gap-2.5 h-10 px-3 rounded-md text-sm font-medium transition',
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon name={tab.icon} size={16} />
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Tab content */}
        <main className="flex-1 overflow-auto p-6">
          <h2 className="font-display font-bold text-xl mb-4">
            {TABS.find(t => t.id === activeTab)?.label}
          </h2>
          <Suspense fallback={<Spinner size={32} className="mx-auto mt-8" />}>
            {activeTab === 'theme'        && <ThemeTab />}
            {activeTab === 'sections'     && <SectionsTab />}
            {activeTab === 'pricing'      && <PricingTab />}
            {activeTab === 'products'     && <ProductsTab />}
            {activeTab === 'translations' && <TranslationsTab />}
          </Suspense>
        </main>

        {/* Preview iframe */}
        <aside className="hidden xl:flex flex-col w-[480px] shrink-0 border-l border-border bg-background">
          <div className="h-10 border-b border-border flex items-center px-4 text-xs font-semibold text-muted-foreground">
            Live Preview
          </div>
          <iframe
            ref={iframeRef}
            src="/"
            className="flex-1 w-full"
            title="Landing preview"
          />
        </aside>
      </div>
    </div>
  );
}
