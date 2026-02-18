import { useOrganization } from './useOrganization';
import { useAuth } from './useAuth';
import { ordersApi } from '@/lib/orders-api';
import { useEffect } from 'react';

export function useOrdersApi() {
  const { user } = useAuth();
  const { useDefaultOrganization } = useOrganization();
  const { data: organization } = useDefaultOrganization(user?.id);

  useEffect(() => {
    if (organization?.id) {
      ordersApi.setOrganization(organization.id);
    }
  }, [organization?.id]);

  return { api: ordersApi };
}
