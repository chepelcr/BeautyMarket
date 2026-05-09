import { useState } from 'react';
import type { DemoProduct, DemoCustomer } from '@/types';

export interface CartItem extends DemoProduct {
  q: number;
}

export interface CartState {
  items:       CartItem[];
  customer:    DemoCustomer;
  docType:     'FE' | 'TE' | 'NC';
  setCustomer: (c: DemoCustomer) => void;
  setDocType:  (d: 'FE' | 'TE' | 'NC') => void;
  add:         (p: DemoProduct) => void;
  setQ:        (id: string, q: number) => void;
  remove:      (id: string) => void;
  clear:       () => void;
  sub:         number;
  iva:         number;
  total:       number;
  count:       number;
}

const DEFAULT_CUSTOMER: DemoCustomer = {
  id: 'cf', name: 'Cliente de contado', id_doc: '—', email: '',
};

export function useCart(initialCustomer?: DemoCustomer): CartState {
  const [items, setItems]       = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<DemoCustomer>(initialCustomer ?? DEFAULT_CUSTOMER);
  const [docType, setDocType]   = useState<'FE' | 'TE' | 'NC'>('FE');

  const add = (p: DemoProduct) =>
    setItems(cur => {
      const f = cur.find(i => i.id === p.id);
      if (f) return cur.map(i => i.id === p.id ? { ...i, q: i.q + 1 } : i);
      return [...cur, { ...p, q: 1 }];
    });

  const setQ = (id: string, q: number) =>
    setItems(cur => cur.flatMap(i => i.id === id ? (q <= 0 ? [] : [{ ...i, q }]) : [i]));

  const remove = (id: string) =>
    setItems(cur => cur.filter(i => i.id !== id));

  const clear = () => setItems([]);

  const sub   = items.reduce((a, p) => a + p.price * p.q, 0);
  const iva   = Math.round(sub * 0.13);
  const total = sub + iva;
  const count = items.reduce((a, p) => a + p.q, 0);

  return { items, customer, setCustomer, docType, setDocType, add, setQ, remove, clear, sub, iva, total, count };
}
