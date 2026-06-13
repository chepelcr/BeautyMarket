import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Client } from '@/models';
import { Building2, Phone, MapPin, MoreVertical, Trash2, Ban, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/lib/orders-api';
import { useToast } from '@/hooks/use-toast';

interface ClientCardProps {
  client: Client;
}

export function ClientCard({ client }: ClientCardProps) {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateStatusMutation = useMutation({
    mutationFn: async (status: number) => {
      return ordersApi.updateClientStatus(client.client_id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({ title: t('customers.statusUpdated') });
    },
    onError: () => {
      toast({ title: t('customers.statusUpdateFailed'), variant: 'destructive' });
    },
  });

  const getStatusBadge = (status?: number) => {
    switch (status) {
      case 0:
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">{t('customers.status.pending')}</Badge>;
      case 1:
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">{t('customers.status.active')}</Badge>;
      case 2:
        return <Badge variant="outline" className="bg-muted text-muted-foreground border-border">{t('customers.status.inactive')}</Badge>;
      default:
        return null;
    }
  };

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <Card
      className="hover:shadow-md transition-all cursor-pointer hover:border-primary/50 flex flex-col"
      onClick={() => navigate(`/admin/customers/${client.client_id}`, {
        state: { customerName: client.client_name || client.business_name }
      })}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{client.client_name || client.business_name}</CardTitle>
            {client.business_name && client.client_name && (
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Building2 className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{client.business_name}</span>
              </div>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="flex-shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {client.status === 2 && (
                <DropdownMenuItem onClick={(e) => handleAction(e, () => updateStatusMutation.mutate(1))}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {t('customers.actions.activate')}
                </DropdownMenuItem>
              )}
              {client.status === 1 && (
                <DropdownMenuItem onClick={(e) => handleAction(e, () => updateStatusMutation.mutate(2))}>
                  <Ban className="h-4 w-4 mr-2" />
                  {t('customers.actions.deactivate')}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={(e) => handleAction(e, () => updateStatusMutation.mutate(3))}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('customers.actions.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 flex flex-col flex-1">
        <div className="space-y-3 flex-1">
          {getStatusBadge(client.status)}

          {client.identification && client.identification.number && (
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className="font-mono">
                {client.identification.number}
              </Badge>
            </div>
          )}

          {client.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>+{client.phone.country_code} {client.phone.number}</span>
            </div>
          )}

          {client.residence && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{client.residence.address}</span>
            </div>
          )}
        </div>

        <div className="pt-2 border-t min-h-[2.5rem] flex items-center">
          {client.nationality && (
            <Badge variant="secondary">
              {client.nationality}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
