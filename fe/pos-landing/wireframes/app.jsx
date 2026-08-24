/* App entry — composes sections and wires Tweaks panel.
   useTweaks defaults are inside an EDITMODE block so the host can persist edits. */

const { useEffect: useEffA, useState: useStateA } = React;

const TWEAK_DEFAULS = /*EDITMODE-BEGIN*/{
  "accent": "orange",
  "dark": false,
  "heroVariant": "centered",
  "haciendaVariant": "default",
  "pricingVariant": "default",
  "currency": "CRC",
  "oneTimePrice": 199000,
  "freeDocs": 30
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULS);

  // Apply accent + dark to <body>/<html>
  useEffA(() => { document.body.dataset.accent = t.accent; }, [t.accent]);
  useEffA(() => { document.documentElement.classList.toggle('dark', !!t.dark); }, [t.dark]);

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav dark={t.dark} setDark={(fn) => setTweak('dark', typeof fn === 'function' ? fn(t.dark) : fn)} />
      <main className="flex-1">
        <Hero variant={t.heroVariant}/>
        <VsCompetition/>
        <Features/>
        <HowItWorks/>
        <Hacienda variant={t.haciendaVariant}/>
        <Pricing variant={t.pricingVariant} currency={t.currency} oneTimePrice={t.oneTimePrice} freeDocs={t.freeDocs}/>
        <Testimonials/>
        <FAQ/>
        <FinalCta/>
      </main>
      <Footer/>

      <TweaksPanel title="Tweaks">
        <TweakSection title="Apariencia">
          <TweakColor label="Color de marca"
            value={t.accent}
            onChange={v => setTweak('accent', v)}
            options={['orange','indigo','teal','violet']}/>
          <TweakToggle label="Modo oscuro" value={t.dark} onChange={v=>setTweak('dark', v)}/>
        </TweakSection>

        <TweakSection title="Estructura">
          <TweakRadio label="Variante de hero"
            value={t.heroVariant}
            onChange={v=>setTweak('heroVariant', v)}
            options={[{value:'centered',label:'Centrado'},{value:'split',label:'Split'}]}/>
          <TweakRadio label="Sección Hacienda"
            value={t.haciendaVariant}
            onChange={v=>setTweak('haciendaVariant', v)}
            options={[{value:'default',label:'Detallada'},{value:'compact',label:'Compacta'}]}/>
        </TweakSection>

        <TweakSection title="Precios">
          <TweakRadio label="Moneda"
            value={t.currency}
            onChange={v=>setTweak('currency', v)}
            options={[{value:'CRC',label:'₡ CRC'},{value:'USD',label:'$ USD'}]}/>
          <TweakSlider label="Pago único (₡)"
            value={t.oneTimePrice} min={99000} max={399000} step={1000}
            onChange={v=>setTweak('oneTimePrice', v)}
            format={n => '₡' + n.toLocaleString('es-CR')}/>
          <TweakSlider label="Documentos / mes en Free"
            value={t.freeDocs} min={5} max={100} step={5}
            onChange={v=>setTweak('freeDocs', v)}
            format={n => `${n} docs`}/>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
