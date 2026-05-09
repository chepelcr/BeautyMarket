import { useState } from 'react';
import { useConfig } from '@/hooks/useConfig';
import { Icon } from '@/components/ui/Icon';
import type { DemoProduct } from '@/types';

function genId() {
  return 'prod-' + Math.random().toString(36).slice(2, 8);
}

const EMPTY_PRODUCT: DemoProduct = {
  id:    '',
  cat:   'Facial',
  name:  '',
  sku:   '',
  price: 0,
  stock: 0,
  cabys: '',
};

export function ProductsTab() {
  const { config, setConfig } = useConfig();
  const products = config.demo.products;
  const [confirm, setConfirm] = useState<string | null>(null);

  const update = (products: DemoProduct[]) =>
    setConfig({ ...config, demo: { ...config.demo, products } });

  const setField = (id: string, key: keyof DemoProduct, val: string | number) => {
    update(products.map(p => p.id === id ? { ...p, [key]: val } : p));
  };

  const addRow = () => {
    update([...products, { ...EMPTY_PRODUCT, id: genId() }]);
  };

  const removeRow = (id: string) => {
    update(products.filter(p => p.id !== id));
    setConfirm(null);
  };

  return (
    <div className="space-y-3">
      {/* Table header */}
      <div className="grid grid-cols-12 gap-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
        <div className="col-span-3">Name</div>
        <div className="col-span-2">SKU</div>
        <div className="col-span-1">Cat</div>
        <div className="col-span-2">Price ₡</div>
        <div className="col-span-1">Stock</div>
        <div className="col-span-2">CABYS</div>
        <div className="col-span-1"/>
      </div>

      {products.map(p => (
        <div key={p.id} className="grid grid-cols-12 gap-1 items-center">
          <input value={p.name}  onChange={e => setField(p.id, 'name',  e.target.value)}  className="col-span-3 h-8 rounded border border-border bg-background px-2 text-xs focus:outline-none focus:border-primary" placeholder="Name"/>
          <input value={p.sku}   onChange={e => setField(p.id, 'sku',   e.target.value)}  className="col-span-2 h-8 rounded border border-border bg-background px-2 text-xs font-mono focus:outline-none focus:border-primary" placeholder="SKU"/>
          <input value={p.cat}   onChange={e => setField(p.id, 'cat',   e.target.value)}  className="col-span-1 h-8 rounded border border-border bg-background px-2 text-xs focus:outline-none focus:border-primary" placeholder="Cat"/>
          <input value={p.price} onChange={e => setField(p.id, 'price', Number(e.target.value))} type="number" className="col-span-2 h-8 rounded border border-border bg-background px-2 text-xs font-mono focus:outline-none focus:border-primary" placeholder="0"/>
          <input value={p.stock} onChange={e => setField(p.id, 'stock', Number(e.target.value))} type="number" className="col-span-1 h-8 rounded border border-border bg-background px-2 text-xs font-mono focus:outline-none focus:border-primary" placeholder="0"/>
          <input value={p.cabys} onChange={e => setField(p.id, 'cabys', e.target.value)}  className="col-span-2 h-8 rounded border border-border bg-background px-2 text-xs font-mono focus:outline-none focus:border-primary" placeholder="CABYS"/>
          <div className="col-span-1 flex justify-end">
            {confirm === p.id ? (
              <button onClick={() => removeRow(p.id)} className="h-8 w-8 rounded bg-destructive/10 text-destructive flex items-center justify-center">
                <Icon name="Check" size={13}/>
              </button>
            ) : (
              <button onClick={() => setConfirm(p.id)} className="h-8 w-8 rounded hover:bg-muted text-muted-foreground flex items-center justify-center">
                <Icon name="Trash" size={13}/>
              </button>
            )}
          </div>
        </div>
      ))}

      <button
        onClick={addRow}
        className="w-full h-9 rounded-md border border-dashed border-border text-sm text-muted-foreground hover:bg-muted flex items-center justify-center gap-2"
      >
        <Icon name="Plus" size={14}/>Add product
      </button>
    </div>
  );
}
