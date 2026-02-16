import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Trash2, Package, Search } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUpdateConfirmation } from '@/hooks/useConfirmations';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';

function getTodayApiDate(): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function buildDialogSearch(textSearch: string): string {
  const parts: string[] = [];
  parts.push(`deliveryDate>${getTodayApiDate()}`);
  if (textSearch) {
    parts.push(`(documentNumber:${textSearch},clientName:${textSearch},deliverToName:${textSearch},deliverToCode:${textSearch},confirmationNumber:${textSearch})`);
  }
  return parts.join(',');
}

interface AddOrdersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  confirmationNumber: string;
}

export function AddOrdersDialog({ open, onOpenChange, organizationId, confirmationNumber }: AddOrdersDialogProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedOrders, setSelectedOrders] = useState<string[]>(['']);
  const [orderSearch, setOrderSearch] = useState('');

  const updateMutation = useUpdateConfirmation(organizationId, confirmationNumber);

  const debouncedOrderSearch = useDebounce(orderSearch, 500);
  const searchString = useMemo(() => buildDialogSearch(debouncedOrderSearch), [debouncedOrderSearch]);

  const { orders, isLoading: ordersLoading } = useOrders({
    userId: user?.id || '',
    orgId: organizationId,
    search: searchString,
    pageSize: 100,
  });

  const addOrderSelect = () => {
    setSelectedOrders([...selectedOrders, '']);
  };

  const removeOrderSelect = (index: number) => {
    if (selectedOrders.length === 1) {
      setSelectedOrders(['']);
      return;
    }
    setSelectedOrders(selectedOrders.filter((_, i) => i !== index));
  };

  const updateOrderSelect = (index: number, value: string) => {
    const updated = [...selectedOrders];
    updated[index] = value;
    setSelectedOrders(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const docNums = selectedOrders.filter(Boolean);

    if (docNums.length === 0) return;

    try {
      await updateMutation.mutateAsync({ document_numbers: docNums });

      toast({ title: t('confirmations.addOrders.success') });
      setSelectedOrders(['']);
      setOrderSearch('');
      onOpenChange(false);
    } catch (error) {
      toast({
        title: t('confirmations.addOrders.error'),
        description: error instanceof Error ? error.message : undefined,
        variant: 'destructive',
      });
    }
  };

  const canAddMore = selectedOrders[selectedOrders.length - 1] !== '';

  const getAvailableOrders = (currentIndex: number) => {
    const selectedSet = new Set(
      selectedOrders.filter((_, i) => i !== currentIndex).filter(Boolean)
    );
    return orders.filter((o) => !selectedSet.has(o.document_number));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('confirmations.addOrders.title')}</DialogTitle>
          <DialogDescription>{t('confirmations.addOrders.description')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('confirmations.create.ordersLabel')}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t('confirmations.searchOrders')}
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="space-y-2">
                {selectedOrders.map((value, index) => {
                  const isOnly = selectedOrders.length === 1;
                  const isEmpty = value === '';
                  const disableDelete = isOnly && isEmpty;
                  const availableOrders = getAvailableOrders(index);

                  return (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <Select
                          value={value}
                          onValueChange={(v) => updateOrderSelect(index, v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('confirmations.create.orderPlaceholder')} />
                          </SelectTrigger>
                          <SelectContent>
                            {ordersLoading ? (
                              <SelectItem value="_loading" disabled>
                                <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                                {t('common.loading')}
                              </SelectItem>
                            ) : availableOrders.length === 0 ? (
                              <SelectItem value="_empty" disabled>
                                {t('confirmations.noOrdersAvailable')}
                              </SelectItem>
                            ) : (
                              availableOrders.map((order) => {
                                const [dd, mm, yyyy] = order.delivery_date.split('/');
                                const d = new Date(`${yyyy}-${mm}-${dd}`);
                                const dateStr = d.toLocaleDateString(language === 'es' ? 'es-CR' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' });
                                return (
                                  <SelectItem key={order.document_number} value={order.document_number}>
                                    {order.document_number} - {dateStr}
                                  </SelectItem>
                                );
                              })
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="flex-shrink-0 text-destructive hover:text-destructive"
                        onClick={() => removeOrderSelect(index)}
                        disabled={disableDelete}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOrderSelect}
                  disabled={!canAddMore}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('confirmations.create.addOrder')}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t('confirmations.addOrders.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
