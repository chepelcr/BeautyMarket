import { lazy, Suspense, useRef } from 'react';
import { Link, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { LogoIcon } from '@/components/ui/LogoIcon';
import { Icon } from '@/components/ui/Icon';
import { Spinner } from '@/components/ui/Spinner';
import { useSaveConfig } from '@/hooks/useSaveConfig';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/cn';

const MetaTab           = lazy(() => import('./MetaTab').then(m => ({ default: m.MetaTab })));
const ThemeTab          = lazy(() => import('./ThemeTab').then(m => ({ default: m.ThemeTab })));
const TranslationsTab   = lazy(() => import('./TranslationsTab').then(m => ({ default: m.TranslationsTab })));
const PricingTab        = lazy(() => import('./PricingTab').then(m => ({ default: m.PricingTab })));
const PricingAddonsTab  = lazy(() => import('./PricingAddonsTab').then(m => ({ default: m.PricingAddonsTab })));
const ProductsTab       = lazy(() => import('./ProductsTab').then(m => ({ default: m.ProductsTab })));
const SectionsTab       = lazy(() => import('./SectionsTab').then(m => ({ default: m.SectionsTab })));
const FeaturesTab       = lazy(() => import('./FeaturesTab').then(m => ({ default: m.FeaturesTab })));
const VSCompetitionTab  = lazy(() => import('./VSCompetitionTab').then(m => ({ default: m.VSCompetitionTab })));
const HowItWorksTab     = lazy(() => import('./HowItWorksTab').then(m => ({ default: m.HowItWorksTab })));
const HaciendaTab       = lazy(() => import('./HaciendaTab').then(m => ({ default: m.HaciendaTab })));
const TestimonialsTab   = lazy(() => import('./TestimonialsTab').then(m => ({ default: m.TestimonialsTab })));
const FAQTab            = lazy(() => import('./FAQTab').then(m => ({ default: m.FAQTab })));

type TabId = 'meta' | 'theme' | 'sections' | 'pricing' | 'pricing-addons' | 'products' | 'translations' | 'features' | 'vs' | 'how-it-works' | 'hacienda' | 'testimonials' | 'faq';

const TABS: Array<{ id: TabId; label: string; icon: 'Settings' | 'Palette' | 'LayoutDashboard' | 'DollarSign' | 'Package' | 'Languages' | 'Sparkles' | 'GitCompare' | 'ListOrdered' | 'ShieldCheck' | 'Quote' | 'HelpCircle' | 'Grid3x3' }> = [
  { id: 'meta',           label: 'Meta / URLs',      icon: 'Settings'        },
  { id: 'theme',          label: 'Tema',             icon: 'Palette'         },
  { id: 'sections',       label: 'Secciones',        icon: 'LayoutDashboard' },
  { id: 'pricing',        label: 'Precios',          icon: 'DollarSign'      },
  { id: 'pricing-addons', label: 'Addons Precios',   icon: 'Grid3x3'         },
  { id: 'products',       label: 'Productos',        icon: 'Package'         },
  { id: 'features',       label: 'Características',  icon: 'Sparkles'        },
  { id: 'vs',             label: 'VS Competencia',   icon: 'GitCompare'      },
  { id: 'how-it-works',   label: 'Cómo Funciona',    icon: 'ListOrdered'     },
  { id: 'hacienda',       label: 'Hacienda',         icon: 'ShieldCheck'     },
  { id: 'testimonials',   label: 'Testimonios',      icon: 'Quote'           },
  { id: 'faq',            label: 'Preguntas',        icon: 'HelpCircle'      },
  { id: 'translations',   label: 'Traducciones',     icon: 'Languages'       },
];

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { save, saving, saved, error } = useSaveConfig();
  const { dark, setDark } = useTheme();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Get active tab from URL
  const activeTab = location.pathname.split('/').pop() as TabId || 'meta';

  const handleSave = async () => {
    await save();
    iframeRef.current?.contentWindow?.location.reload();
  };

  const toggleDarkMode = () => {
    setDark(!dark);
  };

  return (
    <div className="h-screen flex flex-col bg-muted/30 overflow-hidden">
      {/* Top bar - Fixed */}
      <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <LogoIcon size={28} />
          <span className="font-display font-bold">Dashboard Local</span>
          <span className="px-2 py-0.5 rounded bg-warning/20 text-warning text-[10px] font-display font-bold uppercase tracking-wider">solo localhost</span>
        </div>
        <div className="flex items-center gap-3">
          {error && <span className="text-xs text-destructive">{error}</span>}
          {saved && <span className="text-xs text-success font-semibold">Guardado ✓</span>}
          <button
            onClick={toggleDarkMode}
            className="h-9 w-9 rounded-md border border-border text-sm font-medium hover:bg-muted flex items-center justify-center"
            title={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            <Icon name={dark ? 'Sun' : 'Moon'} size={16} />
          </button>
          <Link to="/" target="_blank" className="h-9 px-3 rounded-md border border-border text-sm font-medium hover:bg-muted flex items-center gap-1.5">
            <Icon name="Eye" size={14} />Vista previa
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 disabled:opacity-60"
          >
            {saving ? <Spinner size={16} /> : <Icon name="Save" size={14} />}
            {saving ? 'Guardando…' : 'Guardar en disco'}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Sidebar - Fixed */}
        <aside className="w-52 shrink-0 bg-card border-r border-border flex flex-col overflow-hidden">
          <nav className="p-2 space-y-1 overflow-y-auto">
            {TABS.map(tab => (
              <Link
                key={tab.id}
                to={`/dashboard/${tab.id}`}
                className={cn(
                  'w-full flex items-center gap-2.5 h-10 px-3 rounded-md text-sm font-medium transition',
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon name={tab.icon} size={16} />
                {tab.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Tab content - Scrollable */}
        <main className="flex-1 overflow-y-auto min-h-0">
          <div className="p-6">
            <h2 className="font-display font-bold text-xl mb-4">
              {TABS.find(t => t.id === activeTab)?.label}
            </h2>
            <Suspense fallback={<Spinner size={32} className="mx-auto mt-8" />}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard/meta" replace />} />
                <Route path="/meta" element={<MetaTab />} />
                <Route path="/theme" element={<ThemeTab />} />
                <Route path="/sections" element={<SectionsTab />} />
                <Route path="/pricing" element={<PricingTab />} />
                <Route path="/pricing-addons" element={<PricingAddonsTab />} />
                <Route path="/products" element={<ProductsTab />} />
                <Route path="/features" element={<FeaturesTab />} />
                <Route path="/vs" element={<VSCompetitionTab />} />
                <Route path="/how-it-works" element={<HowItWorksTab />} />
                <Route path="/hacienda" element={<HaciendaTab />} />
                <Route path="/testimonials" element={<TestimonialsTab />} />
                <Route path="/faq" element={<FAQTab />} />
                <Route path="/translations" element={<TranslationsTab />} />
              </Routes>
            </Suspense>
          </div>
        </main>

        {/* Live preview iframe - Fixed */}
        <aside className="hidden xl:flex flex-col w-[480px] shrink-0 border-l border-border bg-background overflow-hidden">
          <div className="h-10 border-b border-border flex items-center px-4 text-xs font-semibold text-muted-foreground shrink-0">
            Vista Previa en Vivo
          </div>
          <iframe
            ref={iframeRef}
            src="/"
            className="flex-1 w-full"
            title="Vista previa landing"
          />
        </aside>
      </div>
    </div>
  );
}
