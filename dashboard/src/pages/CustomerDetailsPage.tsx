import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react';
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
    enabled: !!user?.id && !!organizationId && !!customerId,
    queryFn: async () => {
      const url = buildOrgApiUrl(user!.id, organizationId, `/customers/${customerId}`);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch customer');
      }
      return response.json();
    },
  });

  // Fetch customer's orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ['customer-orders', customerId],
    enabled: !!user?.id && !!organizationId && !!customerId && !!customer,
    queryFn: async () => {
      // For MVP, we'll filter orders by customer email or phone
      const url = buildOrgApiUrl(user!.id, organizationId, '/orders');
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const allOrders = await response.json();

      // Filter orders by customer email
      return allOrders.filter((order: Order) =>
        order.client?.name?.toLowerCase().includes(customer?.email?.toLowerCase() || '')
      );
    },
  });

  // Update customer notes mutation
  const updateNotesMutation = useMutation({
    mutationFn: async (notes: string) => {
      const url = buildOrgApiUrl(user!.id, organizationId, `/customers/${customerId}`);
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

  // Delete customer mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const url = buildOrgApiUrl(user!.id, organizationId, `/customers/${customerId}`);
      const response = await fetch(url, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete customer');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
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
    // TODO: Open customer form modal for editing
    // This will be implemented when we create the CustomerForm component
    console.log('Edit customer:', customerId);
  };

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

  if (isLoading) {
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
              onClick={() => navigate('/admin/customers')}
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
          <CustomerStats customer={customer} />

          {/* Two column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content - left side */}
            <div className="lg:col-span-2 space-y-6">
              <CustomerOrderHistory
                orders={orders}
                isLoading={ordersLoading}
              />
            </div>

            {/* Sidebar - right side */}
            <div className="space-y-6">
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
          </div>
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
    </div>
  );
}
