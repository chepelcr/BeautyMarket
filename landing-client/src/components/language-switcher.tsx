import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    const newLang = language === 'es' ? 'en' : 'es';
    const currentScrollY = window.scrollY;

    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${currentScrollY}px`;
    document.body.style.width = '100%';

    document.body.classList.add("language-transitioning");

    setTimeout(() => {
      setLanguage(newLang);
      document.body.classList.remove("language-transitioning");
      document.body.classList.add("slide-in");

      setTimeout(() => {
        document.body.classList.remove("slide-in");
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo({ top: currentScrollY, behavior: 'instant' as ScrollBehavior });
      }, 300);
    }, 300);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="w-9 h-9 rounded-md relative"
    >
      <span className="absolute text-base rotate-0 scale-100 transition-all [.language-transitioning_&]:rotate-90 [.language-transitioning_&]:scale-0">
        {language === 'es' ? '🇪🇸' : '🇺🇸'}
      </span>
      <span className="sr-only">Toggle language</span>
    </Button>
  );
}
