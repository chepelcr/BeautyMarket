import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { buildOrgApiUrl } from '@/lib/apiUtils';
import type { Customer, CustomersResponse } from '@/models';
import { CustomerCard } from '@/components/customers/CustomerCard';

export default function CustomersPage() {
  const { t } = useLanguage();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();

  // Get organization from localStorage
  const [organization, setOrganization] = useState<any>(null);
  const [orgLoading, setOrgLoading] = useState(true);

  useEffect(() => {
    const storedOrg = localStorage.getItem('selectedOrganization');
    if (storedOrg) {
      try {
        setOrganization(JSON.parse(storedOrg));
      } catch (error) {
        console.error('Failed to parse organization:', error);
        navigate('/organizations/select');
      }
    } else if (!authLoading && isAuthenticated) {
      navigate('/organizations/select');
    }
    setOrgLoading(false);
  }, [authLoading, isAuthenticated, navigate]);

  const organizationId = organization?.id;

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Fetch customers
  const { data, isLoading } = useQuery<CustomersResponse>({
    queryKey: ['customers', organizationId],
    enabled: !!user?.id && !!organizationId,
    queryFn: async () => {
      const url = buildOrgApiUrl(user!.id, organizationId, '/customers');
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      return response.json();
    },
  });

  const customers = data?.customers || [];
  const total = data?.total || 0;

  // Loading states
  if (authLoading || orgLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !organization || !organizationId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{t('customers.title')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('customers.subtitle')} ({total})
          </p>
        </div>

        {/* Customers grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('customers.noCustomers')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customers.map((customer) => (
              <CustomerCard key={customer.id} customer={customer} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
