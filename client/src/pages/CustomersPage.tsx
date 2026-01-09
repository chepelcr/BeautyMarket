import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomerCard } from "@/components/admin/customers/CustomerCard";
import { CustomerFilters } from "@/components/admin/customers/CustomerFilters";
import { CustomerForm } from "@/components/admin/customers/CustomerForm";
import { Customer, CreateCustomerData, CustomersResponse } from "@/models";
import { apiRequest } from "@/lib/queryClient";
import { buildOrgApiUrl } from "@/lib/apiUtils";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDynamicTitle } from "@/hooks/useDynamicTitle";
import { UserPlus, Download, ChevronLeft, ChevronRight } from "lucide-react";

export default function CustomersPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const { useDefaultOrganization } = useOrganization();
  const { data: defaultOrg } = useDefaultOrganization(user?.id);
  const organizationId = defaultOrg?.id;

  useDynamicTitle(t('customers.title'));

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [minSpent, setMinSpent] = useState("");
  const [maxSpent, setMaxSpent] = useState("");
  const [minOrders, setMinOrders] = useState("");
  const [maxOrders, setMaxOrders] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const loadCustomers = async () => {
    if (!user?.id || !organizationId) return;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (minSpent) params.append('minSpent', minSpent);
      if (maxSpent) params.append('maxSpent', maxSpent);
      if (minOrders) params.append('minOrders', minOrders);
      if (maxOrders) params.append('maxOrders', maxOrders);
      params.append('limit', pageSize.toString());
      params.append('offset', ((page - 1) * pageSize).toString());

      const response = await apiRequest(
        'GET',
        `${buildOrgApiUrl(user.id, organizationId, '/customers')}?${params.toString()}`
      );
      const data: CustomersResponse = await response.json();
      setCustomers(data.customers);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to load customers:', error);
      toast({
        title: t('customers.error'),
        description: t('customers.loadError'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [user?.id, organizationId, search, minSpent, maxSpent, minOrders, maxOrders, page]);

  const handleCreateCustomer = async (data: CreateCustomerData) => {
    if (!user?.id || !organizationId) return;

    try {
      setIsSubmitting(true);
      await apiRequest(
        'POST',
        buildOrgApiUrl(user.id, organizationId, '/customers'),
        data
      );

      toast({
        title: t('customers.success'),
        description: t('customers.createSuccess'),
      });

      setShowForm(false);
      setEditingCustomer(undefined);
      loadCustomers();
    } catch (error) {
      console.error('Failed to create customer:', error);
      toast({
        title: t('customers.error'),
        description: t('customers.createError'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCustomer = async (data: CreateCustomerData) => {
    if (!user?.id || !organizationId || !editingCustomer) return;

    try {
      setIsSubmitting(true);
      await apiRequest(
        'PUT',
        buildOrgApiUrl(user.id, organizationId, `/customers/${editingCustomer.id}`),
        data
      );

      toast({
        title: t('customers.success'),
        description: t('customers.updateSuccess'),
      });

      setShowForm(false);
      setEditingCustomer(undefined);
      loadCustomers();
    } catch (error) {
      console.error('Failed to update customer:', error);
      toast({
        title: t('customers.error'),
        description: t('customers.updateError'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!user?.id || !organizationId || !customerToDelete) return;

    try {
      await apiRequest(
        'DELETE',
        buildOrgApiUrl(user.id, organizationId, `/customers/${customerToDelete.id}`)
      );

      toast({
        title: t('customers.success'),
        description: t('customers.deleteSuccess'),
      });

      setShowDeleteDialog(false);
      setCustomerToDelete(null);
      loadCustomers();
    } catch (error) {
      console.error('Failed to delete customer:', error);
      toast({
        title: t('customers.error'),
        description: t('customers.deleteError'),
        variant: "destructive",
      });
    }
  };

  const handleExportCSV = async () => {
    if (!user?.id || !organizationId) return;

    try {
      const response = await apiRequest(
        'GET',
        buildOrgApiUrl(user.id, organizationId, '/customers/export')
      );
      const csv = await response.text();

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: t('customers.success'),
        description: t('customers.exportSuccess'),
      });
    } catch (error) {
      console.error('Failed to export customers:', error);
      toast({
        title: t('customers.error'),
        description: t('customers.exportError'),
        variant: "destructive",
      });
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setMinSpent("");
    setMaxSpent("");
    setMinOrders("");
    setMaxOrders("");
    setPage(1);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t('customers.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('customers.subtitle', { count: total })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            {t('customers.export')}
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            {t('customers.addCustomer')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1">
          <CustomerFilters
            search={search}
            minSpent={minSpent}
            maxSpent={maxSpent}
            minOrders={minOrders}
            maxOrders={maxOrders}
            onSearchChange={setSearch}
            onMinSpentChange={setMinSpent}
            onMaxSpentChange={setMaxSpent}
            onMinOrdersChange={setMinOrders}
            onMaxOrdersChange={setMaxOrders}
            onClearFilters={handleClearFilters}
          />
        </aside>

        <main className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : customers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">{t('customers.noCustomers')}</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customers.map((customer) => (
                  <CustomerCard
                    key={customer.id}
                    customer={customer}
                    onEdit={(c) => {
                      setEditingCustomer(c);
                      setShowForm(true);
                    }}
                    onDelete={(c) => {
                      setCustomerToDelete(c);
                      setShowDeleteDialog(true);
                    }}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {t('common.page')} {page} {t('common.of')} {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <CustomerForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingCustomer(undefined);
        }}
        onSubmit={editingCustomer ? handleUpdateCustomer : handleCreateCustomer}
        customer={editingCustomer}
        isSubmitting={isSubmitting}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('customers.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('customers.deleteConfirm', {
                name: customerToDelete?.email || ''
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCustomer}>
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
