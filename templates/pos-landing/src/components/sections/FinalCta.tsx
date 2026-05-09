import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { useTranslation } from '@/hooks/useTranslation';
import { useConfig } from '@/hooks/useConfig';

export function FinalCta() {
  const { t }      = useTranslation();
  const { config } = useConfig();
  const appUrl     = config.meta.appUrl;

  return (
    <section id="login" className="py-20 lg:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 20%, rgba(255,255,255,.25), transparent 40%), radial-gradient(circle at 80% 80%, rgba(255,255,255,.15), transparent 40%)`,
        }}
      />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-10 items-center">
        {/* Left: main CTA */}
        <div className="lg:col-span-7 text-primary-foreground">
          <div className="t-label" style={{ color: 'rgba(255,255,255,.65)' }}>
            {t('finalCta.eyebrow')}
          </div>
          <h2
            className="font-display font-extrabold mt-2 leading-[0.95]"
            style={{ fontSize: 'clamp(2.25rem,4.6vw,4rem)' }}
          >
            {t('finalCta.headline')}
          </h2>
          <p className="mt-4 text-[17px] text-white/85 max-w-lg">
            {t('finalCta.subheadline')}
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <a
              href="#precios"
              className="inline-flex h-12 px-6 items-center justify-center gap-2 rounded-md bg-white text-primary font-semibold hover:bg-white/90 shadow-lg"
            >
              {t('finalCta.ctaPrimary')}
              <Icon name="ArrowRight" size={16} />
            </a>
            <Link
              to="/demo"
              className="inline-flex h-12 px-6 items-center justify-center gap-2 rounded-md border border-white/40 text-white font-semibold hover:bg-white/10"
            >
              {t('finalCta.ctaSecondary')}
            </Link>
          </div>
        </div>

        {/* Right: login button card */}
        <div className="lg:col-span-5">
          <div className="card p-6 lg:p-8 shadow-2xl shadow-foreground/30 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Icon name="Lock" size={26} />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl">{t('finalCta.loginTitle')}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t('finalCta.loginSub')}</p>
            </div>
            <a
              href={appUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-12 rounded-md bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 shadow-md shadow-primary/30"
            >
              {t('finalCta.loginCta')}
              <Icon name="ArrowUpRight" size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
