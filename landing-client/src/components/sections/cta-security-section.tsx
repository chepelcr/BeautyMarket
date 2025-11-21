import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Lock, Shield, CreditCard, Building2 } from "lucide-react";

interface CTASecuritySectionProps {
  titleKey: string;
  subtitleKey: string;
  buttonTextKey: string;
  buttonLink?: string;
  buttonIcon?: React.ReactNode | null;
  onClick?: () => void;
  variant?: 'gradient' | 'light';
}

export function CTASecuritySection({
  titleKey,
  subtitleKey,
  buttonTextKey,
  buttonLink,
  buttonIcon,
  onClick,
  variant = 'gradient'
}: CTASecuritySectionProps) {
  const { t } = useLanguage();

  const defaultIcon = buttonIcon === undefined ? <Building2 className="mr-2 h-5 w-5" /> : buttonIcon;

  const isGradient = variant === 'gradient';
  const isLight = variant === 'light';

  const buttonElement = isLight ? (
    <Button
      size="lg"
      className="border border-primary text-primary hover:bg-primary/10 bg-primary/5"
      onClick={onClick}
    >
      {defaultIcon}
      {t(buttonTextKey)}
    </Button>
  ) : (
    <Button
      size="lg"
      className="px-8 py-6 text-lg text-white hover:opacity-90 border-0"
      style={{ backgroundColor: 'hsl(var(--secondary))' }}
      onClick={onClick}
    >
      {defaultIcon}
      {t(buttonTextKey)}
    </Button>
  );

  const sectionClasses = isGradient
    ? "bg-gradient-to-r from-primary to-secondary"
    : "bg-white dark:bg-slate-700 border-t";

  const titleClasses = "font-serif text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4";

  const subtitleClasses = isGradient
    ? "text-lg mb-8 text-gray-800 dark:text-white/90"
    : "text-lg mb-8 text-gray-600 dark:text-gray-300";

  return (
    <section className={sectionClasses}>
      {/* CTA Content */}
      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className={titleClasses}>
            {t(titleKey)}
          </h2>
          <p className={subtitleClasses}>
            {t(subtitleKey)}
          </p>
          {buttonLink ? (
            <Link href={buttonLink}>
              {buttonElement}
            </Link>
          ) : (
            buttonElement
          )}
        </div>
      </div>

      {/* Security Footer */}
      <div className={isGradient ? "py-10 bg-black/10" : "py-10 bg-gray-200 dark:bg-slate-800"}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`grid md:grid-cols-3 gap-8 text-sm ${isGradient ? 'text-white/80' : 'text-muted-foreground'}`}>
            <div className={`flex flex-col items-center justify-center px-4 py-3 rounded-lg ${isGradient ? 'bg-white/15 dark:bg-black/30' : 'bg-white dark:bg-slate-700'}`}>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                SSL
              </div>
            </div>
            <div className={`flex flex-col items-center justify-center px-4 py-3 rounded-lg ${isGradient ? 'bg-white/15 dark:bg-black/30' : 'bg-white dark:bg-slate-700'}`}>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                {t('footer.links.privacy')}
              </div>
            </div>
            <div className={`flex flex-col items-center justify-center px-4 py-3 rounded-lg ${isGradient ? 'bg-white/15 dark:bg-black/30' : 'bg-white dark:bg-slate-700'}`}>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                {t('features.payments.title')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
