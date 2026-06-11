import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Heart, Scale, Users, Building2 } from "lucide-react";
import ctaSecurity from "@/content/cta-security.json";

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
  const { t, language: lang } = useLanguage();
  const pick = (f: { es: string; en: string }) => f[lang] ?? f.es;

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
    : "bg-card border-t border-border";

  const titleClasses = "font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4";

  const subtitleClasses = isGradient
    ? "text-lg mb-8 text-foreground/80"
    : "text-lg mb-8 text-muted-foreground";

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
      <div className={isGradient ? "py-10 bg-black/10" : "py-10 bg-muted"}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`grid md:grid-cols-3 gap-8 text-sm ${isGradient ? 'text-white/80' : 'text-muted-foreground'}`}>
            <div className={`flex flex-col items-center justify-center px-4 py-3 rounded-lg ${isGradient ? 'bg-white/15 dark:bg-black/30' : 'bg-card'}`}>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                {pick(ctaSecurity.pills.transparency)}
              </div>
            </div>
            <div className={`flex flex-col items-center justify-center px-4 py-3 rounded-lg ${isGradient ? 'bg-white/15 dark:bg-black/30' : 'bg-card'}`}>
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4" />
                {pick(ctaSecurity.pills.fairTrade)}
              </div>
            </div>
            <div className={`flex flex-col items-center justify-center px-4 py-3 rounded-lg ${isGradient ? 'bg-white/15 dark:bg-black/30' : 'bg-card'}`}>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {pick(ctaSecurity.pills.local)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
