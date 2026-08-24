import { Icon, type IconName } from '@/components/ui/Icon';
import { useTranslation } from '@/hooks/useTranslation';
import { parseTitle } from '@/lib/parseTitle';

interface Step {
  icon:  string;
  title: string;
  desc:  string;
}

export function HowItWorks() {
  const { t, tRaw } = useTranslation();
  const steps = tRaw<Step[]>('howItWorks.steps') ?? [];

  return (
    <section id="como" className="py-20 lg:py-28 bg-muted/40 border-y border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="t-label">{t('howItWorks.eyebrow')}</div>
          <h2
            className="font-display font-extrabold mt-2"
            style={{ fontSize: 'clamp(2rem,3.6vw,3rem)' }}
          >
            {parseTitle(t('howItWorks.headline'))}
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, i) => (
            <div key={i} className="relative card p-6">
              <div className="absolute top-4 right-4 font-display font-extrabold text-5xl text-primary/15 leading-none t-num">
                0{i + 1}
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-md bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                  <Icon name={step.icon as IconName} size={20} />
                </div>
                <h4 className="font-display font-bold text-xl">{step.title}</h4>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
