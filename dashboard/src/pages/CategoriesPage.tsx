import { useLanguage } from '@/contexts/LanguageContext';
import CategoriesManager from '@/components/admin/categories-manager';

export default function CategoriesPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('categories.title')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('categories.subtitle')}
        </p>
      </div>

      {/* Categories Manager Component */}
      <CategoriesManager />
    </div>
  );
}
