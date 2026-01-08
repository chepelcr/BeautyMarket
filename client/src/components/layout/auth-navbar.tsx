import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Home, LogOut } from "lucide-react";

interface AuthNavbarProps {
  showLogout?: boolean;
}

export function AuthNavbar({ showLogout = false }: AuthNavbarProps) {
  const { t } = useLanguage();
  const { forceLogout } = useAuth();
  const [, navigate] = useLocation();

  const handleLogout = () => {
    forceLogout();
    navigate('/');
  };

  return (
    <>
      {/* Back/Logout Button */}
      {showLogout ? (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 left-4 z-50 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          {t('auth.logout')}
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 left-4 z-50 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
          onClick={() => navigate("/")}
        >
          <Home className="w-4 h-4 mr-2" />
          {t('auth.login.backToHome')}
        </Button>
      )}

      {/* Language and Theme Toggles */}
      <div className="absolute top-4 right-4 z-50 flex items-center space-x-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </>
  );
}
