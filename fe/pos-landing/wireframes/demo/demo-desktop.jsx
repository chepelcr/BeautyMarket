/* Desktop POS layout: 1fr products | 360px cart sidebar.
   Mirrors POSIntegratedPage at md+ breakpoints. */

function PosDesktop({ cart, onCheckout, onCustomers }) {
  const [query, setQuery] = React.useState('');
  const [cat, setCat] = React.useState('Todo');
  const [showCustomers, setShowCustomers] = React.useState(false);

  const filtered = CATALOG.filter(p =>
    (cat === 'Todo' || p.cat === cat) &&
    (!query || p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="h-[52px] flex items-center justify-between px-5 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <a href="../index.html" className="w-8 h-8 -ml-2 rounded hover:bg-muted flex items-center justify-center text-muted-foreground"><I.ChevronLeft size={16}/></a>
          <I.Logo size={26}/>
          <span className="font-display font-bold text-[18px] leading-none">Punto de venta</span>
          <span className="text-muted-foreground text-xs">·</span>
          <span className="text-[13px] text-muted-foreground">Sucursal Central · Terminal 02</span>
          <span className="ml-2 px-1.5 py-0.5 rounded bg-info/10 text-info text-[10px] font-display font-bold uppercase tracking-wider">Demo</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-muted-foreground hidden md:inline">JCampos</span>
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-success/12 text-success border border-success/30 text-[11px] font-semibold">
            <span className="status-dot-live"/>En línea
          </span>
        </div>
      </div>

      {/* Body grid */}
      <div className="flex-1 grid overflow-hidden" style={{ gridTemplateColumns: '1fr 360px' }}>
        {/* Left: catalog */}
        <div className="flex flex-col border-r border-border overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-border bg-card shrink-0">
            <button onClick={()=>setShowCustomers(false)} className={`flex-1 py-3 text-[13px] font-semibold ${!showCustomers?'text-primary border-b-2 border-primary':'text-muted-foreground border-b-2 border-transparent'}`}>Productos</button>
            <button onClick={()=>setShowCustomers(true)} className={`flex-1 py-3 text-[13px] font-semibold ${showCustomers?'text-primary border-b-2 border-primary':'text-muted-foreground border-b-2 border-transparent'}`}>Clientes</button>
          </div>

          {showCustomers ? (
            <CustomerList onPick={(c)=>{ cart.setCustomer(c); setShowCustomers(false); }} active={cart.customer.id}/>
          ) : (
            <>
              {/* Search + categories */}
              <div className="p-3 space-y-2 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-10 rounded-md border border-border bg-card flex items-center px-3 gap-2">
                    <I.Search size={15} className="text-muted-foreground"/>
                    <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar producto, SKU o escaneá código…" className="flex-1 bg-transparent outline-none text-sm"/>
                    {query && <button onClick={()=>setQuery('')} className="text-muted-foreground"><I.X size={14}/></button>}
                  </div>
                  <button className="h-10 w-10 rounded-md border border-border bg-card flex items-center justify-center text-muted-foreground hover:bg-muted"><I.Scan size={16}/></button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map(c => (
                    <button key={c} onClick={()=>setCat(c)}
                      className={`h-7 px-3 rounded-full text-[11px] font-display font-bold uppercase tracking-wider border ${cat===c?'bg-primary border-primary text-primary-foreground':'bg-card border-border text-muted-foreground hover:border-primary/40'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              {/* Product grid */}
              <div className="flex-1 overflow-auto scroll-area px-3 pb-3">
                {filtered.length === 0 ? (
                  <div className="h-40 flex flex-col items-center justify-center text-muted-foreground text-sm gap-2">
                    <I.Search size={20}/> Sin resultados para "{query}"
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                    {filtered.map(p => (
                      <button key={p.id} onClick={()=>cart.add(p)} className="group aspect-[5/4] rounded-md border border-border bg-card p-2 flex flex-col text-left hover:border-primary/60 hover:shadow-md hover:shadow-primary/5 transition">
                        <div className="flex-1 rounded bg-muted relative overflow-hidden">
                          <div className="absolute inset-0" style={{backgroundImage:`repeating-linear-gradient(45deg, hsl(var(--muted-foreground) / .15) 0 1px, transparent 1px 9px)`}}/>
                          <span className="absolute top-1 left-1 text-[8px] font-mono px-1 rounded bg-card/80 text-muted-foreground">{p.cat}</span>
                          {p.stock < 15 && <span className="absolute top-1 right-1 text-[8px] font-display font-bold uppercase px-1 rounded bg-warning/90 text-warning-foreground">{p.stock}</span>}
                        </div>
                        <div className="text-[11px] font-semibold leading-tight line-clamp-2 mt-1.5">{p.name}</div>
                        <div className="flex justify-between items-center mt-0.5">
                          <span className="text-[9px] font-mono text-muted-foreground">{p.sku}</span>
                          <span className="text-[11px] font-mono font-bold text-primary t-num">{fmt(p.price)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right: cart sidebar */}
        <CartSidebar cart={cart} onCheckout={onCheckout} onCustomers={()=>setShowCustomers(true)}/>
      </div>
    </div>
  );
}

function CartSidebar({ cart, onCheckout, onCustomers }) {
  const docs = [['FE','Factura'],['TE','Tiquete'],['NC','Nota crédito']];
  return (
    <aside className="flex flex-col bg-card overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <I.ShoppingCart size={16}/>
          <span className="font-display font-bold text-[15px]">Carrito</span>
          <span className="px-1.5 h-5 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold t-num">{cart.count}</span>
        </div>
        {cart.items.length > 0 && (
          <button onClick={cart.clear} className="text-[11px] text-muted-foreground hover:text-destructive flex items-center gap-1"><I.Trash size={11}/>Vaciar</button>
        )}
      </div>
      {/* Doc type */}
      <div className="px-3 py-2 border-b border-border shrink-0">
        <div className="grid grid-cols-3 gap-1 p-0.5 rounded-md bg-muted">
          {docs.map(([k,l]) => (
            <button key={k} onClick={()=>cart.setDocType(k)}
              className={`h-7 rounded text-[11px] font-display font-bold uppercase tracking-wider ${cart.docType===k?'bg-card text-foreground shadow-sm':'text-muted-foreground'}`}>{l}</button>
          ))}
        </div>
      </div>
      {/* Customer */}
      <div className="px-3 py-2 border-b border-border shrink-0">
        <button onClick={onCustomers} className="w-full h-9 rounded-md border border-dashed border-border text-[12px] hover:bg-muted flex items-center justify-between px-3">
          <span className="flex items-center gap-2 truncate"><I.Users size={13} className="text-muted-foreground shrink-0"/><span className="truncate">{cart.customer.name}</span></span>
          <I.ArrowRight size={12} className="text-muted-foreground shrink-0"/>
        </button>
      </div>
      {/* Items */}
      <div className="flex-1 overflow-auto scroll-area px-3 py-2 space-y-2">
        {cart.items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-8 gap-2">
            <I.ShoppingCart size={28} className="opacity-40"/>
            <div className="text-[12px]">Tocá un producto<br/>para agregarlo al carrito</div>
          </div>
        ) : cart.items.map(p => (
          <CartLine key={p.id} p={p} cart={cart}/>
        ))}
      </div>
      {/* Totals */}
      <div className="px-4 py-3 border-t border-border space-y-1 text-[12px] shrink-0">
        <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-mono t-num">{fmt(cart.sub)}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">IVA 13%</span><span className="font-mono t-num">{fmt(cart.iva)}</span></div>
        <div className="flex justify-between text-[15px] font-display font-extrabold pt-1"><span>TOTAL</span><span className="font-mono t-num text-primary">{fmt(cart.total)}</span></div>
        <button onClick={onCheckout} disabled={cart.count === 0} className="mt-2 w-full h-11 rounded-md bg-primary text-primary-foreground text-[13px] font-semibold flex items-center justify-center gap-1.5 shadow-sm shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed">
          Cobrar · {fmt(cart.total)}<I.ArrowRight size={14}/>
        </button>
      </div>
    </aside>
  );
}

function CartLine({ p, cart }) {
  return (
    <div className="rounded-md border border-border bg-background p-2.5 group">
      <div className="flex justify-between gap-2">
        <span className="text-[12px] font-semibold leading-tight line-clamp-1">{p.name}</span>
        <span className="text-[11px] font-mono t-num shrink-0">{fmt(p.price * p.q)}</span>
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-[10px] font-mono text-muted-foreground">{p.sku}</span>
        <div className="flex items-center gap-1">
          <button onClick={()=>cart.setQ(p.id, p.q-1)} className="w-6 h-6 rounded border border-border bg-card flex items-center justify-center text-muted-foreground hover:border-primary/40"><I.Minus size={11}/></button>
          <span className="w-7 text-center text-[12px] font-mono t-num">{p.q}</span>
          <button onClick={()=>cart.setQ(p.id, p.q+1)} className="w-6 h-6 rounded border border-border bg-card flex items-center justify-center text-muted-foreground hover:border-primary/40"><I.Plus size={11}/></button>
          <button onClick={()=>cart.remove(p.id)} className="w-6 h-6 rounded border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/40 ml-1"><I.Trash size={11}/></button>
        </div>
      </div>
    </div>
  );
}

function CustomerList({ onPick, active }) {
  return (
    <div className="flex-1 overflow-auto scroll-area p-3 space-y-2">
      {CUSTOMERS.map(c => (
        <button key={c.id} onClick={()=>onPick(c)}
          className={`w-full text-left p-3 rounded-md border ${active===c.id?'border-primary bg-primary/5':'border-border bg-card hover:border-primary/40'}`}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="font-semibold text-[14px] truncate">{c.name}</div>
              <div className="text-[11px] font-mono text-muted-foreground mt-0.5">{c.id_doc}{c.email?' · '+c.email:''}</div>
            </div>
            {active===c.id && <I.Check size={16} className="text-primary shrink-0"/>}
          </div>
        </button>
      ))}
    </div>
  );
}

Object.assign(window, { PosDesktop, CartSidebar, CartLine, CustomerList });
