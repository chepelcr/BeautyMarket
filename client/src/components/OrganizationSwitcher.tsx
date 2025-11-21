import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check, ChevronsUpDown, Plus, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { Skeleton } from '@/components/ui/skeleton';

export function OrganizationSwitcher() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const {
    useUserOrganizations,
    useDefaultOrganization,
    setDefaultOrganization
  } = useOrganization();

  const { data: organizations, isLoading: orgsLoading } = useUserOrganizations(user?.id);
  const { data: defaultOrg, isLoading: defaultLoading } = useDefaultOrganization(user?.id);

  const handleSelectOrganization = async (orgId: string) => {
    if (!user?.id) return;

    try {
      await setDefaultOrganization.mutateAsync({
        userId: user.id,
        organizationId: orgId
      });
      setOpen(false);
    } catch (error) {
      console.error('Failed to switch organization:', error);
    }
  };

  if (!user) return null;

  if (orgsLoading || defaultLoading) {
    return <Skeleton className="h-9 w-[180px]" />;
  }

  // No organizations yet
  if (!organizations || organizations.length === 0) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate('/organizations/new')}
        className="gap-2"
      >
        <Plus className="h-4 w-4" />
        Crear Organización
      </Button>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-[200px] justify-between"
        >
          <span className="truncate">
            {defaultOrg?.name || 'Seleccionar organización'}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]" align="start">
        <DropdownMenuLabel>Mis Organizaciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {organizations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => handleSelectOrganization(org.id)}
            className="flex items-center justify-between"
          >
            <span className="truncate">{org.name}</span>
            {defaultOrg?.id === org.id && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        {defaultOrg && (
          <DropdownMenuItem onClick={() => navigate(`/organizations/${defaultOrg.id}/settings`)}>
            <Settings className="mr-2 h-4 w-4" />
            Configuración
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => navigate('/organizations/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Organización
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
