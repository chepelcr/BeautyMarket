import { cn } from '@/lib/utils';
import { ProductsPanel } from './ProductsPanel';
import { CustomerPanel } from './CustomerPanel';
import type { Product } from '@/types';
import type { ClientSearchResult } from '@/hooks/useClientSearch';

type LeftTab = 'products' | 'clients';

interface CartItem { id: string; qty: number; }

interface PosLeftPaneProps {
  orgId: string;
  activeTab: LeftTab;
  onTabChange: (tab: LeftTab) => void;
  cartItems: CartItem[];
  onAddProduct: (product: Product) => void;
  clients: ClientSearchResult[];
  clientsLoading: boolean;
  clientQuery: string;
  selectedClient: ClientSearchResult | null;
  onClientQueryChange: (v: string) => void;
  onSelectClient: (c: ClientSearchResult) => void;
}

const TABS: { id: LeftTab; label: string }[] = [
  { id: 'products', label: 'Productos' },
  { id: 'clients', label: 'Clientes' },
];

export function PosLeftPane({
  orgId,
  activeTab,
  onTabChange,
  cartItems,
  onAddProduct,
  clients,
  clientsLoading,
  clientQuery,
  selectedClient,
  onClientQueryChange,
  onSelectClient,
}: PosLeftPaneProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-border bg-card shrink-0">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={cn(
              'flex-1 py-3 text-[13px] font-semibold transition-colors',
              activeTab === id
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground border-b-2 border-transparent hover:text-foreground'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'clients' ? (
          <CustomerPanel
            clients={clients}
            isLoading={clientsLoading}
            query={clientQuery}
            selected={selectedClient}
            onQueryChange={onClientQueryChange}
            onSelect={onSelectClient}
          />
        ) : (
          <ProductsPanel
            orgId={orgId}
            cartItems={cartItems}
            isDesktop={true}
            onAdd={onAddProduct}
          />
        )}
      </div>
    </div>
  );
}
