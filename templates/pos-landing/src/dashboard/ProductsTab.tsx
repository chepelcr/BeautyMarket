import { useState } from 'react';
import { useConfig } from '@/hooks/useConfig';
import { TextField, NumberField, AddButton } from './components';
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
        <div className="col-span-3">Nombre</div>
        <div className="col-span-2">SKU</div>
        <div className="col-span-1">Cat</div>
        <div className="col-span-2">Precio ₡</div>
        <div className="col-span-1">Stock</div>
        <div className="col-span-2">CABYS</div>
        <div className="col-span-1"/>
      </div>

      {products.map(p => (
        <div key={p.id} className="grid grid-cols-12 gap-1 items-center">
          <TextField
            value={p.name}
            onChange={val => setField(p.id, 'name', val)}
            placeholder="Nombre"
            inputClassName="col-span-3 h-8 text-xs"
            className="col-span-3"
          />
          <TextField
            value={p.sku}
            onChange={val => setField(p.id, 'sku', val)}
            placeholder="SKU"
            inputClassName="col-span-2 h-8 text-xs font-mono"
            className="col-span-2"
          />
          <TextField
            value={p.cat}
            onChange={val => setField(p.id, 'cat', val)}
            placeholder="Cat"
            inputClassName="col-span-1 h-8 text-xs"
            className="col-span-1"
          />
          <NumberField
            value={p.price}
            onChange={val => setField(p.id, 'price', val)}
            placeholder="0"
            inputClassName="col-span-2 h-8 text-xs"
            className="col-span-2"
          />
          <NumberField
            value={p.stock}
            onChange={val => setField(p.id, 'stock', val)}
            placeholder="0"
            inputClassName="col-span-1 h-8 text-xs"
            className="col-span-1"
          />
          <TextField
            value={p.cabys}
            onChange={val => setField(p.id, 'cabys', val)}
            placeholder="CABYS"
            inputClassName="col-span-2 h-8 text-xs font-mono"
            className="col-span-2"
          />
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

      <AddButton
        onClick={addRow}
        label="Agregar producto"
        variant="outline"
        className="w-full"
      />
    </div>
  );
}
