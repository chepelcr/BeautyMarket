/* Mobile POS layout: products fill the screen, sticky bottom bar shows
   total + opens a bottom sheet for the full cart. Customer picker and
   checkout flow are also bottom sheets. */

function PosMobile({ cart, onCheckout }) {
  const [query, setQuery] = React.useState('');
  const [cat, setCat] = React.useState('Todo');
  const [sheet, setSheet] = React.useState(null); // null | 'cart' | 'customer' | 'docs'

  const filtered = CATALOG.filter(p =>
    (cat === 'Todo' || p.cat === cat) &&
    (!query || p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Compact header */}
      <div className="px-4 pt-3 pb-2 bg-card border-b border-border shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <a href="../index.html" className="w-8 h-8 -ml-1 rounded hover:bg-muted flex items-center justify-center text-muted-foreground"><I.ChevronLeft size={16}/></a>
            <I.Logo size={22}/>
            <div>
              <div className="font-display font-bold text-[15px] leading-none">Punto de venta</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Central · T-02 · {cart.docType}</div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-success/12 text-success border border-success/30 text-[9px] font-bold">
            <span className="status-dot-live" style={{width:6,height:6}}/>EN LÍNEA
          </span>
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <div className="flex-1 h-9 rounded-md border border-border bg-background flex items-center px-2.5 gap-1.5">
            <I.Search size={13} className="text-muted-foreground"/>
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar / escanear" className="flex-1 bg-transparent outline-none text-[13px]"/>
            {query && <button onClick={()=>setQuery('')} className="text-muted-foreground"><I.X size={13}/></button>}
          </div>
          <button className="h-9 w-9 rounded-md bg-primary text-primary-foreground flex items-center justify-center"><I.Scan size={14}/></button>
        </div>
        <div className="mt-2 flex gap-1.5 overflow-x-auto scroll-area pb-1 -mx-1 px-1">
          {CATEGORIES.map(c => (
            <button key={c} onClick={()=>setCat(c)}
              className={`shrink-0 h-7 px-3 rounded-full text-[10px] font-display font-bold uppercase tracking-wider border ${cat===c?'bg-primary border-primary text-primary-foreground':'bg-card border-border text-muted-foreground'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-4 py-2 bg-muted/30 border-b border-border flex items-center justify-between gap-2 shrink-0">
        <button onClick={()=>setSheet('customer')} className="flex-1 h-8 rounded-md bg-card border border-border text-[11px] font-semibold flex items-center justify-center gap-1.5 truncate px-2">
          <I.Users size={12} className="text-muted-foreground shrink-0"/><span className="truncate">{cart.customer.name}</span>
        </button>
        <button onClick={()=>setSheet('docs')} className="h-8 px-3 rounded-md bg-card border border-border text-[11px] font-display font-bold uppercase tracking-wider text-muted-foreground">
          {cart.docType}
        </button>
      </div>

      {/* Product grid — fills available height */}
      <div className="flex-1 overflow-auto scroll-area p-3 pb-20">
        {filtered.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-muted-foreground text-sm gap-2">
            <I.Search size={20}/> Sin resultados
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filtered.map(p => {
              const inCart = cart.items.find(i => i.id === p.id);
              return (
                <button key={p.id} onClick={()=>cart.add(p)} className="relative aspect-[5/4] rounded-md border border-border bg-card p-2 flex flex-col text-left active:scale-[0.98] transition">
                  <div className="flex-1 rounded bg-muted relative overflow-hidden">
                    <div className="absolute inset-0" style={{backgroundImage:`repeating-linear-gradient(45deg, hsl(var(--muted-foreground) / .15) 0 1px, transparent 1px 9px)`}}/>
                    <span className="absolute top-1 left-1 text-[8px] font-mono px-1 rounded bg-card/80 text-muted-foreground">{p.cat}</span>
                  </div>
                  <div className="text-[11px] font-semibold leading-tight line-clamp-2 mt-1.5">{p.name}</div>
                  <div className="flex justify-between items-center mt-0.5">
                    <span className="text-[9px] font-mono text-muted-foreground">{p.sku}</span>
                    <span className="text-[11px] font-mono font-bold text-primary t-num">{fmt(p.price)}</span>
                  </div>
                  {inCart && <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center shadow-md t-num">{inCart.q}</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Sticky bottom bar — cart preview */}
      <button onClick={()=>cart.count > 0 && setSheet('cart')} disabled={cart.count === 0}
        className="absolute bottom-0 left-0 right-0 p-3 bg-card border-t border-border flex items-center gap-3 disabled:opacity-50 z-20">
        <div className="relative w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
          <I.ShoppingCart size={18}/>
          {cart.count > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center t-num">{cart.count}</span>}
        </div>
        <div className="flex-1 text-left">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-display font-bold">{cart.count===0?'Carrito vacío':`${cart.count} ítems · ver carrito`}</div>
          <div className="font-display font-extrabold text-[18px] leading-none mt-0.5 t-num">{fmt(cart.total)}</div>
        </div>
        <span className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-[12px] font-semibold flex items-center gap-1.5">
          {cart.count===0?'Agregar':'Cobrar'} <I.ArrowRight size={13}/>
        </span>
      </button>

      {/* Bottom sheets */}
      {sheet && <Backdrop onClose={()=>setSheet(null)}/>}
      {sheet === 'cart' && <CartSheet cart={cart} onClose={()=>setSheet(null)} onCheckout={()=>{ setSheet(null); onCheckout(); }}/>}
      {sheet === 'customer' && <CustomerSheet cart={cart} onClose={()=>setSheet(null)}/>}
      {sheet === 'docs' && <DocSheet cart={cart} onClose={()=>setSheet(null)}/>}
    </div>
  );
}

function Backdrop({ onClose }) {
  return <div onClick={onClose} className="fixed inset-0 bg-foreground/40 z-30 fade-anim"/>;
}

function Sheet({ children, title, onClose }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-card rounded-t-2xl border-t border-border shadow-2xl shadow-foreground/30 sheet-anim flex flex-col" style={{ maxHeight: '85vh' }}>
      <div className="flex justify-center pt-2"><span className="w-10 h-1 rounded-full bg-border"/></div>
      <div className="px-5 py-3 flex items-center justify-between border-b border-border">
        <span className="font-display font-bold text-[17px]">{title}</span>
        <button onClick={onClose} className="w-8 h-8 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground"><I.X size={16}/></button>
      </div>
      {children}
    </div>
  );
}

function CartSheet({ cart, onClose, onCheckout }) {
  return (
    <Sheet title={`Carrito · ${cart.count} ítems`} onClose={onClose}>
      <div className="flex-1 overflow-auto scroll-area px-3 py-3 space-y-2">
        {cart.items.map(p => <CartLine key={p.id} p={p} cart={cart}/>)}
      </div>
      <div className="px-5 py-4 border-t border-border space-y-1 text-[13px]">
        <div className="flex justify-between"><span className="text-muted-foreground">Cliente</span><span className="font-semibold truncate ml-3">{cart.customer.name}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Documento</span><span className="font-display font-bold uppercase tracking-wider">{cart.docType}</span></div>
        <div className="flex justify-between mt-1 pt-1 border-t border-border"><span className="text-muted-foreground">Subtotal</span><span className="font-mono t-num">{fmt(cart.sub)}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">IVA 13%</span><span className="font-mono t-num">{fmt(cart.iva)}</span></div>
        <div className="flex justify-between text-[17px] font-display font-extrabold pt-1"><span>TOTAL</span><span className="font-mono t-num text-primary">{fmt(cart.total)}</span></div>
        <button onClick={onCheckout} className="mt-3 w-full h-12 rounded-md bg-primary text-primary-foreground text-[14px] font-semibold flex items-center justify-center gap-1.5 shadow-sm shadow-primary/30">
          Cobrar · {fmt(cart.total)}<I.ArrowRight size={15}/>
        </button>
        <button onClick={cart.clear} className="mt-1 w-full h-10 text-[12px] text-muted-foreground hover:text-destructive flex items-center justify-center gap-1.5">
          <I.Trash size={12}/>Vaciar carrito
        </button>
      </div>
    </Sheet>
  );
}

function CustomerSheet({ cart, onClose }) {
  return (
    <Sheet title="Seleccionar cliente" onClose={onClose}>
      <div className="flex-1 overflow-auto scroll-area p-3 space-y-2">
        {CUSTOMERS.map(c => (
          <button key={c.id} onClick={()=>{ cart.setCustomer(c); onClose(); }}
            className={`w-full text-left p-3 rounded-md border ${cart.customer.id===c.id?'border-primary bg-primary/5':'border-border bg-card'}`}>
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <div className="font-semibold text-[14px] truncate">{c.name}</div>
                <div className="text-[11px] font-mono text-muted-foreground mt-0.5">{c.id_doc}{c.email?' · '+c.email:''}</div>
              </div>
              {cart.customer.id===c.id && <I.Check size={16} className="text-primary shrink-0"/>}
            </div>
          </button>
        ))}
      </div>
    </Sheet>
  );
}

function DocSheet({ cart, onClose }) {
  const docs = [
    ['FE', 'Factura electrónica', 'Para clientes registrados'],
    ['TE', 'Tiquete electrónico', 'Venta al consumidor final'],
    ['NC', 'Nota de crédito', 'Devolución / corrección'],
  ];
  return (
    <Sheet title="Tipo de documento" onClose={onClose}>
      <div className="p-3 space-y-2">
        {docs.map(([k,n,d]) => (
          <button key={k} onClick={()=>{ cart.setDocType(k); onClose(); }}
            className={`w-full text-left p-3 rounded-md border flex items-start gap-3 ${cart.docType===k?'border-primary bg-primary/5':'border-border bg-card'}`}>
            <div className={`w-10 h-10 rounded-md flex items-center justify-center font-display font-extrabold text-[14px] ${cart.docType===k?'bg-primary text-primary-foreground':'bg-muted text-muted-foreground'}`}>{k}</div>
            <div className="flex-1">
              <div className="font-semibold text-[14px]">{n}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{d}</div>
            </div>
            {cart.docType===k && <I.Check size={16} className="text-primary mt-2"/>}
          </button>
        ))}
      </div>
    </Sheet>
  );
}

Object.assign(window, { PosMobile, Sheet, Backdrop, CartSheet, CustomerSheet, DocSheet });
