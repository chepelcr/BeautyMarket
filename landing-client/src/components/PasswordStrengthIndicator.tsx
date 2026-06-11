import { CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface PasswordRule {
  test: (password: string) => boolean;
  messageKey: string;
}

const passwordRules: PasswordRule[] = [
  { test: (pwd) => pwd.length >= 8, messageKey: 'auth.register.passwordRequirements.minLength' },
  { test: (pwd) => /[a-z]/.test(pwd), messageKey: 'auth.register.passwordRequirements.lowercase' },
  { test: (pwd) => /[A-Z]/.test(pwd), messageKey: 'auth.register.passwordRequirements.uppercase' },
  { test: (pwd) => /[0-9]/.test(pwd), messageKey: 'auth.register.passwordRequirements.number' },
  { test: (pwd) => /[^a-zA-Z0-9]/.test(pwd), messageKey: 'auth.register.passwordRequirements.special' },
];

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export function PasswordStrengthIndicator({ password, className }: PasswordStrengthIndicatorProps) {
  const { t } = useLanguage();
  const passedRules = passwordRules.filter(rule => rule.test(password));
  const strength = passedRules.length;

  const getStrengthColor = () => {
    if (strength === 0) return 'bg-muted';
    if (strength <= 2) return 'bg-destructive';
    if (strength <= 4) return 'bg-warning';
    return 'bg-success';
  };

  const getStrengthText = () => {
    if (strength === 0) return t('auth.register.passwordStrength.veryWeak');
    if (strength <= 2) return t('auth.register.passwordStrength.weak');
    if (strength <= 4) return t('auth.register.passwordStrength.good');
    return t('auth.register.passwordStrength.strong');
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t('auth.register.passwordStrength.label')}</span>
          <span className={cn(
            "font-medium",
            strength === 0 && "text-muted-foreground",
            strength <= 2 && strength > 0 && "text-destructive",
            strength <= 4 && strength > 2 && "text-warning",
            strength === 5 && "text-success"
          )}>
            {getStrengthText()}
          </span>
        </div>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={cn(
                "h-2 flex-1 rounded-full transition-colors",
                level <= strength ? getStrengthColor() : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      {/* Rules Checklist */}
      <div className="space-y-2">
        {passwordRules.map((rule, index) => {
          const isValid = rule.test(password);
          return (
            <div key={index} className="flex items-center space-x-2 text-sm">
              {isValid ? (
                <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              )}
              <span className={cn(
                "transition-colors",
                isValid ? "text-success" : "text-muted-foreground"
              )}>
                {t(rule.messageKey)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
