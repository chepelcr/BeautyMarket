/* Pricing section: Free tier + One-Time Unlock */

const { useState: useStateP } = React;

function Pricing({ variant, currency, oneTimePrice, freeDocs }) {
  const compact = variant === 'compact';
  const fmtCRC = n => '₡' + n.toLocaleString('es-CR');
  const fmtUSD = n => '$' + Math.round(n/600).toLocaleString('en-US');
  const fmt = currency === 'USD' ? fmtUSD : fmtCRC;
  const monthlyComparable = Math.round(oneTimePrice / 36);

  const free = {
    name: 'Free',
    tagline: 'Para empezar tu negocio sin gastar.',
    price: '₡0',
    sub: 'Para siempre',
    cta: 'Crear cuenta gratis',
    bullets: [
      ['Hasta 50 productos', true],
      ['Hasta 30 clientes', true],
      [`${freeDocs} documentos electrónicos / mes`, true],
      ['1 sucursal · 1 terminal', true],
      ['Tiquete y factura electrónica', true],
      ['Reportes básicos de ventas', true],
      ['Soporte por correo', true],
      ['Multi-sucursal', false],
      ['Modo contingencia', false],
      ['Notas de crédito y débito', false],
    ],
  };
  const pro = {
    name: 'Pago Único Pro',
    tagline: 'Pagás una vez. Nunca más.',
    price: fmt(oneTimePrice),
    sub: 'Pago único · de por vida',
    cta: 'Desbloquear todo',
    bullets: [
      ['Productos ilimitados', true],
      ['Clientes ilimitados', true],
      ['Documentos electrónicos ilimitados', true],
      ['Multi-sucursal y multi-terminal', true],
      ['Todos los tipos de documento (FE, TE, NC, ND, FC, FEX)', true],
      ['Modo contingencia ATV', true],
      ['Reportes avanzados y exportación', true],
      ['Aceptación de documentos recibidos', true],
      ['Próximas funciones de cumplimiento incluidas', true],
      ['Soporte prioritario por WhatsApp', true],
    ],
  };

  return (
    <section id="precios" data-screen-label="06 Precios" className="py-20 lg:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-50 pointer-events-none"/>
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-[680px] h-[460px] rounded-full bg-primary/12 blur-3xl pointer-events-none"/>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <div className="t-label">Precios honestos</div>
          <h2 className="font-display font-extrabold mt-2" style={{fontSize:'clamp(2rem,3.6vw,3rem)'}}>Empezá gratis. <span className="text-primary">Crecé sin atarte.</span></h2>
          <p className="mt-3 text-muted-foreground">Dos opciones. Sin trucos. Sin "desde", sin asteriscos, sin upgrade obligatorio para descargar tus datos.</p>
        </div>

        <div className={`grid gap-5 ${compact?'lg:grid-cols-2 max-w-4xl mx-auto':'lg:grid-cols-2 max-w-5xl mx-auto'}`}>

          {/* FREE */}
          <div className="relative rounded-2xl border border-border bg-card p-7 lg:p-8 flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-display font-extrabold text-2xl">{free.name}</h3>
              <span className="badge bg-muted text-muted-foreground border border-border px-2.5 py-1 rounded-full text-[10px] font-display font-bold uppercase tracking-wider">Para siempre</span>
            </div>
            <p className="text-sm text-muted-foreground mb-5">{free.tagline}</p>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-display font-extrabold text-5xl t-num">{free.price}</span>
              <span className="text-muted-foreground">/ siempre</span>
            </div>
            <p className="text-xs text-muted-foreground mb-6">Sin tarjeta. Sin trial. Sin caducidad.</p>
            <a href="#" className="h-11 rounded-md border border-border bg-background hover:bg-muted font-semibold flex items-center justify-center gap-2 mb-6">{free.cta}<I.ArrowRight size={15}/></a>
            <ul className="space-y-2.5 text-sm">
              {free.bullets.map(([b,ok],i)=>(
                <li key={i} className={`flex items-start gap-2.5 ${ok?'':'text-muted-foreground/60 line-through'}`}>
                  {ok ? <I.Check size={16} className="text-success mt-0.5 shrink-0"/> : <I.X size={16} className="mt-0.5 shrink-0 text-muted-foreground/50"/>}
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* PRO — Pago Único */}
          <div className="relative rounded-2xl border-2 border-primary bg-card p-7 lg:p-8 flex flex-col shadow-2xl shadow-primary/15">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-display font-extrabold uppercase tracking-[0.16em]">Recomendado</div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-display font-extrabold text-2xl flex items-center gap-2">{pro.name}<I.Sparkles size={18} className="text-primary"/></h3>
              <span className="badge bg-primary/10 text-primary border border-primary/30 px-2.5 py-1 rounded-full text-[10px] font-display font-bold uppercase tracking-wider">Pago único</span>
            </div>
            <p className="text-sm text-muted-foreground mb-5">{pro.tagline}</p>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-display font-extrabold text-5xl t-num text-primary">{pro.price}</span>
              <span className="text-muted-foreground">una vez</span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">Equivalente a <strong className="text-foreground">{fmt(monthlyComparable)}/mes</strong> si lo amortizás a 3 años — y a partir del cuarto año seguís pagando ₡0.</p>
            <a href="#" className="mt-4 h-11 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-semibold flex items-center justify-center gap-2 mb-6 shadow-md shadow-primary/30">{pro.cta}<I.ArrowRight size={15}/></a>
            <ul className="space-y-2.5 text-sm">
              {pro.bullets.map(([b,ok],i)=>(
                <li key={i} className="flex items-start gap-2.5">
                  <I.Check size={16} className="text-primary mt-0.5 shrink-0"/>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-5 border-t border-border flex items-center gap-3">
              <I.ShieldCheck size={20} className="text-primary"/>
              <p className="text-xs text-muted-foreground">Garantía de devolución de 30 días si no es lo que esperabas.</p>
            </div>
          </div>
        </div>

        {/* Add-ons / extras */}
        <div className="mt-10 grid sm:grid-cols-3 gap-3 text-sm">
          {[
            [I.Building2,'Sucursal extra','Pagás una pequeña tarifa única por cada sucursal adicional.'],
            [I.Smartphone,'Terminal extra','Activá nuevas terminales sin cambiarte de plan.'],
            [I.Cloud,'Migración asistida','Te ayudamos a traer tus datos desde tu sistema actual o desde Excel.'],
          ].map(([Ic,t,d],i)=>(
            <div key={i} className="card p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-md bg-accent text-accent-foreground flex items-center justify-center shrink-0"><Ic size={18}/></div>
              <div><div className="font-display font-bold">{t}</div><p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{d}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

window.Pricing = Pricing;
