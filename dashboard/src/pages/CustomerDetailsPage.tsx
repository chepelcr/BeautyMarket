import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import { PageLoader } from '@/components/ui/page-loader';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { buildOrgApiUrl } from '@/lib/apiUtils';
import type { Customer, Order } from '@/models';
import { CustomerProfile } from '@/components/customers/CustomerProfile';
import { CustomerStats } from '@/components/customers/CustomerStats';
import { CustomerOrderHistory } from '@/components/customers/CustomerOrderHistory';
import { CustomerModal } from '@/components/customers/CustomerModal';
import { CustomerNotes } from '@/components/customers/CustomerNotes';

export default function CustomerDetailsPage() {
  const { t } = useLanguage();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { useDefaultOrganization } = useOrganization();
  const { data: organization, isLoading: orgLoading } = useDefaultOrganization(user?.id);
  const [, navigate] = useLocation();
  const [, params] = useRoute('/admin/customers/:customerId');
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);

  const organizationId = organization?.id || '';
  const customerId = params?.customerId;

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Fetch customer details
  const { data: customer, isLoading, error } = useQuery<Customer>({
    queryKey: ['customer', customerId],
    enabled: !!organizationId && !!customerId,
    staleTime: 0,
    gcTime: 0,
    queryFn: async () => {
      const url = `${import.meta.env.VITE_ORDERS_API_URL}/api/organizations/${organizationId}/clients/${customerId}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch customer');
      }
      return response.json();
    },
  });

  // Fetch customer's orders
  const { data: ordersResponse, isLoading: ordersLoading } = useQuery({
    queryKey: ['customer-orders', customerId, customer?.clientGln],
    enabled: !!organizationId && !!customerId && !!customer?.clientGln,
    queryFn: async () => {
      const searchParam = `clientGln:${customer?.clientGln}`;
      const url = `${import.meta.env.VITE_ORDERS_API_URL}/api/organizations/${organizationId}/orders?search=${encodeURIComponent(searchParam)}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      return response.json();
    },
  });

  const orders = Array.isArray(ordersResponse) ? ordersResponse : (ordersResponse?.data || []);

  // Update customer notes mutation
  const updateNotesMutation = useMutation({
    mutationFn: async (notes: string) => {
      const url = `${import.meta.env.VITE_ORDERS_API_URL}/api/organizations/${organizationId}/clients/${customerId}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      if (!response.ok) {
        throw new Error('Failed to update customer notes');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  // Delete customer mutation (soft delete with status=3)
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const url = `${import.meta.env.VITE_ORDERS_API_URL}/api/organizations/${organizationId}/clients/${customerId}`;
      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 3 }),
      });
      if (!response.ok) {
        throw new Error('Failed to delete customer');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      navigate('/admin/customers');
    },
  });

  const handleSaveNotes = async (notes: string) => {
    await updateNotesMutation.mutateAsync(notes);
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const handleEdit = () => {
    setEditingClient(customer);
    setShowEditForm(true);
  };

  const handleSubmit = async (data: any) => {
    const url = `${import.meta.env.VITE_ORDERS_API_URL}/api/organizations/${organizationId}/clients/${customerId}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update client');
    queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
    queryClient.invalidateQueries({ queryKey: ['clients'] });
    setShowEditForm(false);
    setEditingClient(null);
  };

  // Loading states
  if (authLoading || orgLoading) {
    return <PageLoader fullScreen={false} />;
  }

  if (!isAuthenticated || !organization || !organizationId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!customerId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{t('customers.details.notFound')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('customers.details.notFoundDescription')}
          </p>
          <Button onClick={() => navigate('/admin/customers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('customers.details.backToCustomers')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with back button and delete */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['customers'] });
                navigate('/admin/customers');
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('customers.details.backToCustomers')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t('common.delete')}
            </Button>
          </div>
        </div>
      </div>

      {/* Customer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Statistics */}
          <CustomerStats orders={orders} />

          {/* Profile and Notes Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CustomerProfile
              customer={customer}
              onEdit={handleEdit}
            />
            <CustomerNotes
              notes={customer.notes}
              onSave={handleSaveNotes}
              isSaving={updateNotesMutation.isPending}
            />
          </div>

          {/* Order History Row */}
          <CustomerOrderHistory
            orders={orders}
            isLoading={ordersLoading}
          />
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('customers.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('customers.confirmDelete')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('common.deleting')}
                </>
              ) : (
                t('common.delete')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit customer modal */}
      <CustomerModal
        isOpen={showEditForm}
        onClose={() => {
          setShowEditForm(false);
          setEditingClient(null);
        }}
        onSubmit={handleSubmit}
        editingCustomer={editingClient}
        isLoading={false}
      />
    </div>
  );
}
