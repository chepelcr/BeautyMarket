import { useEffect, useState } from 'react';
import { Users, ArrowUpDown, Plus } from 'lucide-react';
import { useLocation } from 'wouter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { useClients } from '@/hooks/useClients';
import { useDebounce } from '@/hooks/useDebounce';
import { useClientListStore } from '@/store/client-list-store';
import { buildClientSearchString } from '@/lib/clientSearchBuilder';
import { ClientSearch } from '@/components/customers/ClientSearch';
import { ClientCard } from '@/components/customers/ClientCard';
import { ClientFilters, ClientFiltersType } from '@/components/customers/ClientFilters';
import { CustomerModal } from '@/components/customers/CustomerModal';
import { Pagination } from '@/components/products/Pagination';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/lib/orders-api';
import type { Client } from '@/models';

export default function CustomersPage() {
  const { t } = useLanguage();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { useDefaultOrganization } = useOrganization();
  const { data: organization, isLoading: orgLoading } = useDefaultOrganization(user?.id);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const organizationId = organization?.id || '';

  const [showClientForm, setShowClientForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [filters, setFilters] = useState<ClientFiltersType>({});

  useEffect(() => {
    if (organizationId) {
      ordersApi.setOrganization(organizationId);
    }
  }, [organizationId]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const {
    searchQuery,
    sortBy,
    sortOrder,
    page,
    pageSize,
    setSearchQuery,
    setPage,
    setPageSize,
    setSorting,
  } = useClientListStore();

  const debouncedSearch = useDebounce(searchQuery, 500);

  const searchString = buildClientSearchString({
    textSearch: debouncedSearch || undefined,
    status: filters.status,
    sortBy,
    sortOrder,
  });

  const {
    clients,
    total,
    totalPages,
    isLoading: clientsLoading,
  } = useClients({
    orgId: organizationId || '',
    search: searchString || undefined,
    page,
    pageSize,
  });

  const createClientMutation = useMutation({
    mutationFn: async (data: any) => {
      return await ordersApi.createClient(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setShowClientForm(false);
      toast({ title: 'Client created successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to create client', variant: 'destructive' });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: async (data: any) => {
      return await ordersApi.updateClient(editingClient?.clientId!, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setShowClientForm(false);
      setEditingClient(null);
      toast({ title: 'Client updated successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to update client', variant: 'destructive' });
    },
  });

  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split('-') as [
      'clientName' | 'clientGln' | 'createdAt' | 'updatedAt',
      'asc' | 'desc'
    ];
    setSorting(newSortBy, newSortOrder);
  };

  const handleAddClient = () => {
    setEditingClient(null);
    setShowClientForm(true);
  };

  const handleSubmit = async (data: any) => {
    if (editingClient) {
      await updateClientMutation.mutateAsync(data);
    } else {
      await createClientMutation.mutateAsync(data);
    }
  };

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

  const isLoading = clientsLoading;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('customers.title')}</h1>
          <p className="text-muted-foreground">{t('customers.subtitle')}</p>
        </div>
        <Button onClick={handleAddClient} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          {t('customers.addClient')}
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <ClientSearch value={searchQuery} onChange={setSearchQuery} />
        <div className="flex items-center gap-2 flex-wrap">
          <ClientFilters filters={filters} onFiltersChange={setFilters} />
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <ArrowUpDown className="h-4 w-4" />
            <span className="hidden sm:inline">{t('customers.sort')}</span>
          </div>
          <Select value={`${sortBy}-${sortOrder}`} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt-desc">{t('customers.sort.newestFirst')}</SelectItem>
              <SelectItem value="createdAt-asc">{t('customers.sort.oldestFirst')}</SelectItem>
              <SelectItem value="clientName-asc">{t('customers.sort.nameAsc')}</SelectItem>
              <SelectItem value="clientName-desc">{t('customers.sort.nameDesc')}</SelectItem>
              <SelectItem value="clientGln-asc">{t('customers.sort.glnAsc')}</SelectItem>
              <SelectItem value="clientGln-desc">{t('customers.sort.glnDesc')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: pageSize }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-[200px] rounded-lg" />
            </div>
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {searchQuery ? t('customers.noCustomersFound') : t('customers.noCustomers')}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            {searchQuery ? t('customers.noCustomersFoundDescription') : t('customers.noCustomersDescription')}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {clients.map((client) => (
              <ClientCard key={client.clientId} client={client} />
            ))}
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}

      <CustomerModal
        isOpen={showClientForm}
        onClose={() => setShowClientForm(false)}
        onSubmit={handleSubmit}
        editingCustomer={editingClient}
        isLoading={createClientMutation.isPending || updateClientMutation.isPending}
      />
    </div>
  );
}
