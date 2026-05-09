import { Icon, type IconName } from '@/components/ui/Icon';
import { useTranslation } from '@/hooks/useTranslation';

interface FeatureItem {
  icon:  string;
  title: string;
  desc:  string;
}

interface FeatureGroup {
  eyebrow: string;
  title:   string;
  items:   FeatureItem[];
}

export function Features() {
  const { t } = useTranslation();
  const groups = t('features.groups') as unknown as FeatureGroup[];
  const safeGroups = Array.isArray(groups) ? groups : [];

  return (
    <section id="caracteristicas" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <div className="t-label">{t('features.eyebrow')}</div>
          <h2
            className="font-display font-extrabold mt-2"
            style={{ fontSize: 'clamp(2rem,3.6vw,3rem)' }}
            dangerouslySetInnerHTML={{
              __html: t('features.headline')
                .replace('Nada que no usés.', '<span class="text-primary">Nada que no usés.</span>'),
            }}
          />
        </div>

        <div className="space-y-14">
          {safeGroups.map((g, gi) => (
            <div key={gi}>
              <div className="flex items-end justify-between mb-5 gap-4 flex-wrap">
                <div>
                  <div className="t-label">{g.eyebrow}</div>
                  <h3 className="font-display font-extrabold text-2xl sm:text-3xl mt-1">{g.title}</h3>
                </div>
                <div className="h-px flex-1 bg-border min-w-[60px] mb-2 hidden sm:block" />
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {g.items.map((item, i) => (
                  <div key={i} className="card card-hover p-5 flex flex-col gap-3">
                    <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                      <Icon name={item.icon as IconName} size={20} />
                    </div>
                    <h4 className="font-display font-bold text-[17px] leading-tight">{item.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
