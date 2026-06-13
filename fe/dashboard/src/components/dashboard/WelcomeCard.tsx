import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Building2, Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface WelcomeCardProps {
  userName?: string;
  organizationName?: string;
  lastLogin?: Date | string;
}

export function WelcomeCard({ userName, organizationName, lastLogin }: WelcomeCardProps) {
  const { t } = useLanguage();

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return t('common.na');
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.greeting.morning');
    if (hour < 18) return t('dashboard.greeting.afternoon');
    return t('dashboard.greeting.evening');
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="text-2xl">
          {getGreeting()}, {userName || t('dashboard.user')}!
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row md:items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{userName || t('dashboard.user')}</span>
          </div>
          <div className="hidden md:block h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span>{organizationName || t('dashboard.noOrganization')}</span>
          </div>
          {lastLogin && (
            <>
              <div className="hidden md:block h-4 w-px bg-border" />
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{t('dashboard.lastLogin')}: {formatDate(lastLogin)}</span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
