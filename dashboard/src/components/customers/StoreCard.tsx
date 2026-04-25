import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Pencil, CheckCircle, Ban, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { StoreResponse } from '@/models';

interface StoreCardProps {
  store: StoreResponse;
  onEdit: (store: StoreResponse) => void;
  onStatusChange: (storeId: string, status: number) => void;
}

function getStatusBadge(status?: number) {
  switch (status) {
    case 1: return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Active</Badge>;
    case 2: return <Badge variant="outline" className="bg-muted text-muted-foreground border-border">Inactive</Badge>;
    case 3: return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Deleted</Badge>;
    default: return null;
  }
}

export function StoreCard({ store, onEdit, onStatusChange }: StoreCardProps) {
  const { t } = useLanguage();
  const isDeleted = store.status === 3;

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="pt-4 pb-3 px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm font-semibold">{store.store_code}</span>
              {getStatusBadge(store.status)}
            </div>
            {store.store_name && (
              <p className="text-sm text-foreground truncate">{store.store_name}</p>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5 text-xs text-muted-foreground">
              {store.chain && <span>Chain: {store.chain}</span>}
              {store.slot_id && <span>Slot: {store.slot_id}</span>}
              {store.gln && <span>GLN: {store.gln}</span>}
            </div>
          </div>

          {!isDeleted && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(store)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  {t('customers.edit')}
                </DropdownMenuItem>
                {store.status === 2 && (
                  <DropdownMenuItem onClick={() => onStatusChange(store.store_id, 1)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {t('customers.actions.activate')}
                  </DropdownMenuItem>
                )}
                {store.status === 1 && (
                  <DropdownMenuItem onClick={() => onStatusChange(store.store_id, 2)}>
                    <Ban className="h-4 w-4 mr-2" />
                    {t('customers.actions.deactivate')}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onStatusChange(store.store_id, 3)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('customers.actions.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
