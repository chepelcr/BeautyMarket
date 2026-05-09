import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { useTranslation } from '@/hooks/useTranslation';

export function FinalCta() {
  const { t } = useTranslation();

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
        {/* Left text */}
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

        {/* Login card */}
        <div className="lg:col-span-5">
          <div className="card p-6 lg:p-7 shadow-2xl shadow-foreground/30">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="Lock" size={16} className="text-primary" />
              <h3 className="font-display font-bold text-lg">{t('finalCta.loginTitle')}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{t('finalCta.loginSub')}</p>
            <div className="space-y-3">
              <div>
                <label className="block text-[12px] font-semibold mb-1.5">{t('finalCta.loginEmailLabel')}</label>
                <input
                  type="email"
                  placeholder={t('finalCta.loginEmailPlaceholder')}
                  className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold mb-1.5">{t('finalCta.loginPasswordLabel')}</label>
                <input
                  type="password"
                  placeholder={t('finalCta.loginPasswordPlaceholder')}
                  className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <button className="w-full h-11 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 flex items-center justify-center gap-2">
                {t('finalCta.loginCta')}
                <Icon name="ArrowRight" size={15} />
              </button>
              <div className="flex justify-between text-[12px]">
                <a className="text-muted-foreground hover:text-foreground" href="#">
                  {t('finalCta.loginForgot')}
                </a>
                <a className="text-primary font-semibold" href="#precios">
                  {t('finalCta.loginCreate')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
