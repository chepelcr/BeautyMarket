/* Shared demo data + cart hook for both desktop and mobile POS demos.
   Exported on window so other Babel scripts can pick it up. */

const CATALOG = [
  { id: 'sh-arg-250',  cat: 'Cabello',  name: 'Shampoo Argán 250ml',     sku: 'SH-ARG-250', price: 6500,  stock: 24, cabys: '3307100100200' },
  { id: 'cr-fac-50',   cat: 'Facial',   name: 'Crema Hidratante 50ml',   sku: 'CR-FAC-50',  price: 8400,  stock: 18, cabys: '3307900100100' },
  { id: 'mk-car-x1',   cat: 'Facial',   name: 'Mascarilla Carbón',       sku: 'MK-CAR-X1',  price: 3200,  stock: 42, cabys: '3307900100200' },
  { id: 'ac-coc-250',  cat: 'Cabello',  name: 'Acondicionador Coco',     sku: 'AC-COC-250', price: 5800,  stock: 31, cabys: '3307100100300' },
  { id: 'sr-vit-30',   cat: 'Facial',   name: 'Sérum Vitamina C 30ml',   sku: 'SR-VIT-30',  price: 12400, stock: 12, cabys: '3307900100300' },
  { id: 'tn-fac-200',  cat: 'Facial',   name: 'Tónico Facial 200ml',     sku: 'TN-FAC-200', price: 4900,  stock: 19, cabys: '3307900100400' },
  { id: 'bl-spf-50',   cat: 'Solar',    name: 'Bloqueador SPF 50',       sku: 'BL-SPF-50',  price: 9200,  stock: 27, cabys: '3304990000100' },
  { id: 'ex-cor-200',  cat: 'Cuerpo',   name: 'Exfoliante Corporal',     sku: 'EX-COR-200', price: 6700,  stock: 22, cabys: '3307900100500' },
  { id: 'ae-ess-30',   cat: 'Aroma',    name: 'Aceite Esencial 30ml',    sku: 'AE-ESS-30',  price: 8100,  stock: 16, cabys: '3303000000100' },
  { id: 'lb-hid-15',   cat: 'Facial',   name: 'Bálsamo Labial 15ml',     sku: 'LB-HID-15',  price: 2800,  stock: 88, cabys: '3304100000100' },
  { id: 'br-cab-x1',   cat: 'Cabello',  name: 'Brocha Tinte',            sku: 'BR-CAB-X1',  price: 3500,  stock: 14, cabys: '9603290000100' },
  { id: 'pf-flo-50',   cat: 'Aroma',    name: 'Perfume Floral 50ml',     sku: 'PF-FLO-50',  price: 18500, stock: 9,  cabys: '3303000000200' },
];

const CATEGORIES = ['Todo', 'Cabello', 'Facial', 'Solar', 'Cuerpo', 'Aroma'];

const CUSTOMERS = [
  { id: 'cf', name: 'Cliente de contado',           id_doc: '—',           email: '' },
  { id: 'c1', name: 'María Solís',                  id_doc: '1-1234-5678', email: 'maria@example.cr' },
  { id: 'c2', name: 'Salón Bella Vista S.A.',       id_doc: '3-101-987654', email: 'admin@bellavista.cr' },
  { id: 'c3', name: 'Andrés Quirós',                id_doc: '1-0987-6543', email: 'andres@example.cr' },
];

const fmt = (n) => '₡' + Math.round(n).toLocaleString('es-CR');

/* useCart — single source of truth for both layouts. */
function useCart() {
  const [items, setItems] = React.useState([]);
  const [customer, setCustomer] = React.useState(CUSTOMERS[0]);
  const [docType, setDocType] = React.useState('FE'); // FE | TE | NC

  const add = (p) => setItems((cur) => {
    const f = cur.find(i => i.id === p.id);
    if (f) return cur.map(i => i.id === p.id ? { ...i, q: i.q + 1 } : i);
    return [...cur, { ...p, q: 1 }];
  });
  const setQ = (id, q) => setItems(cur => cur.flatMap(i => i.id === id ? (q <= 0 ? [] : [{ ...i, q }]) : [i]));
  const remove = (id) => setItems(cur => cur.filter(i => i.id !== id));
  const clear = () => setItems([]);

  const sub = items.reduce((a, p) => a + p.price * p.q, 0);
  const iva = Math.round(sub * 0.13);
  const total = sub + iva;
  const count = items.reduce((a, p) => a + p.q, 0);

  return { items, customer, setCustomer, docType, setDocType, add, setQ, remove, clear, sub, iva, total, count };
}

Object.assign(window, { CATALOG, CATEGORIES, CUSTOMERS, fmt, useCart });
