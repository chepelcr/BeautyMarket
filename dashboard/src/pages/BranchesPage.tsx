import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Store, Plus, Pencil, Trash2, AlertCircle, Monitor,
  MapPin, Phone, Tag, ChevronRight, Circle, Wifi, WifiOff, Search
} from 'lucide-react';
import { PageLoader } from '@/components/ui/page-loader';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { buildOrdersApiUrl } from '@/lib/apiUtils';
import { apiRequest } from '@/lib/queryClient';
import { BranchLocationSection } from '@/components/branches/BranchLocationSection';

/* ─────────────── Types ─────────────── */

interface BranchLocation {
  state_id: number | null;
  county_id: number | null;
  district_id: number | null;
  neighborhood: string | null;
  address: string | null;
}

interface Branch {
  branch_id: string;
  name: string;
  code: string;
  type: 'stand' | 'restaurant';
  status: number;
  location: BranchLocation | null;
  phone: string | null;
  created_at: string;
  terminals?: Terminal[];
}

interface Terminal {
  terminal_id: string;
  branch_id: string;
  name: string;
  code: string;
  device_id: string | null;
  status: number;
  registered_at: string;
  last_seen_at: string | null;
}

interface BranchFormData {
  name: string; code: string; type: 'stand' | 'restaurant';
  state_id: number | null; county_id: number | null; district_id: number | null;
  neighborhood: string; address: string; phone: string;
}

interface TerminalFormData {
  name: string; code: string; device_id: string;
}

const defaultBranch: BranchFormData = { name: '', code: '', type: 'stand', state_id: null, county_id: null, district_id: null, neighborhood: '', address: '', phone: '' };
const defaultTerminal: TerminalFormData = { name: '', code: '', device_id: '' };

/* ─────────────── Helpers ─────────────── */

function timeSince(iso: string | null) {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function isOnline(last_seen_at: string | null) {
  if (!last_seen_at) return false;
  return Date.now() - new Date(last_seen_at).getTime() < 15 * 60 * 1000;
}

/* ─────────────── Main Page ─────────────── */

export default function BranchesPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { useDefaultOrganization } = useOrganization();
  const { data: organization, isLoading: orgLoading } = useDefaultOrganization(user?.id);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const organizationId = organization?.id;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate('/login');
  }, [isAuthenticated, authLoading, navigate]);

  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Branch dialogs
  const [showBranchCreate, setShowBranchCreate] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);
  const [branchForm, setBranchForm] = useState<BranchFormData>(defaultBranch);

  // Terminal dialogs
  const [showTerminalCreate, setShowTerminalCreate] = useState(false);
  const [editingTerminal, setEditingTerminal] = useState<Terminal | null>(null);
  const [deletingTerminal, setDeletingTerminal] = useState<Terminal | null>(null);
  const [terminalForm, setTerminalForm] = useState<TerminalFormData>(defaultTerminal);

  const branchesUrl = organizationId && user?.id
    ? buildOrdersApiUrl(organizationId, '/branches')
    : null;

  /* ── Branches queries ── */
  const { data: branchesData, isLoading: branchesLoading, error: branchesError } = useQuery<{ data: Branch[]; pagination: any }>({
    queryKey: [branchesUrl],
    enabled: !!branchesUrl,
  });

  const branches = branchesData?.data || [];
  const selectedBranch = branches.find(b => b.branch_id === selectedBranchId) ?? null;

  // Auto-select first branch
  useEffect(() => {
    if (!selectedBranchId && branches.length > 0) {
      setSelectedBranchId(branches[0].branch_id);
    }
  }, [branches, selectedBranchId]);

  /* ── Terminals query (for selected branch) ── */
  const terminalsUrl = branchesUrl && selectedBranchId
    ? buildOrdersApiUrl(organizationId!, `/branches/${selectedBranchId}/terminals`)
    : null;

  const { data: terminalsData, isLoading: terminalsLoading } = useQuery<{ data: Terminal[]; pagination: any }>({
    queryKey: [terminalsUrl],
    enabled: !!terminalsUrl,
  });

  const terminals = terminalsData?.data || [];

  /* ── Branch mutations ── */
  const createBranch = useMutation({
    mutationFn: async (data: BranchFormData) => {
      const res = await apiRequest('POST', branchesUrl!, {
        name: data.name,
        code: data.code,
        type: data.type,
        phone: data.phone || undefined,
        location: (data.state_id || data.county_id || data.district_id || data.neighborhood || data.address)
          ? {
              state_id: data.state_id || undefined,
              county_id: data.county_id || undefined,
              district_id: data.district_id || undefined,
              neighborhood: data.neighborhood || undefined,
              address: data.address || undefined,
            }
          : undefined,
      });
      return res.json() as Promise<Branch>;
    },
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: [branchesUrl] });
      setShowBranchCreate(false);
      setBranchForm(defaultBranch);
      setSelectedBranchId(created.branch_id);
      toast({ title: 'Sucursal creada' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const updateBranch = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BranchFormData> & { status?: number } }) => {
      const payload: Record<string, unknown> = {};
      if (data.name !== undefined) payload.name = data.name;
      if (data.code !== undefined) payload.code = data.code;
      if (data.type !== undefined) payload.type = data.type;
      if (data.phone !== undefined) payload.phone = data.phone || undefined;
      if (data.status !== undefined) payload.status = data.status;
      if (
        data.state_id !== undefined || data.county_id !== undefined ||
        data.district_id !== undefined || data.neighborhood !== undefined ||
        data.address !== undefined
      ) {
        payload.location = {
          state_id: data.state_id || undefined,
          county_id: data.county_id || undefined,
          district_id: data.district_id || undefined,
          neighborhood: data.neighborhood || undefined,
          address: data.address || undefined,
        };
      }
      const res = await apiRequest('PATCH', `${branchesUrl}/${id}`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [branchesUrl] });
      setEditingBranch(null);
      toast({ title: 'Cambios guardados' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deleteBranch = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `${branchesUrl}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [branchesUrl] });
      setDeletingBranch(null);
      setSelectedBranchId(null);
      toast({ title: 'Sucursal eliminada' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  /* ── Terminal mutations ── */
  const createTerminal = useMutation({
    mutationFn: async (data: TerminalFormData) => {
      const res = await apiRequest('POST', terminalsUrl!, {
        name: data.name, code: data.code,
        device_id: data.device_id || undefined,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [terminalsUrl] });
      setShowTerminalCreate(false);
      setTerminalForm(defaultTerminal);
      toast({ title: 'Terminal registrada' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const updateTerminal = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TerminalFormData> & { status?: number } }) => {
      const res = await apiRequest('PATCH', `${terminalsUrl}/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [terminalsUrl] });
      setEditingTerminal(null);
      toast({ title: 'Terminal actualizada' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deleteTerminal = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `${terminalsUrl}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [terminalsUrl] });
      setDeletingTerminal(null);
      toast({ title: 'Terminal eliminada' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  /* ── Handlers ── */
  const openEditBranch = (b: Branch) => {
    setEditingBranch(b);
    setBranchForm({
      name: b.name,
      code: b.code,
      type: b.type,
      state_id: b.location?.state_id ?? null,
      county_id: b.location?.county_id ?? null,
      district_id: b.location?.district_id ?? null,
      neighborhood: b.location?.neighborhood ?? '',
      address: b.location?.address ?? '',
      phone: b.phone ?? '',
    });
  };

  const openEditTerminal = (t: Terminal) => {
    setEditingTerminal(t);
    setTerminalForm({ name: t.name, code: t.code, device_id: t.device_id ?? '' });
  };

  const filteredBranches = branches.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.code.toLowerCase().includes(search.toLowerCase())
  );

  const activeTerminals = terminals.filter(t => t.status === 1).length;

  if (authLoading || orgLoading) return <PageLoader />;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Page header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sucursales & Terminales</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Gestioná puestos de venta y sus dispositivos registrados.
          </p>
        </div>
        <Button onClick={() => { setBranchForm(defaultBranch); setShowBranchCreate(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Sucursal
        </Button>
      </div>

      {branchesError && (
        <Alert variant="destructive" className="mb-4 shrink-0">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Error al cargar sucursales.</AlertDescription>
        </Alert>
      )}

      {/* Two-panel layout */}
      <div className="flex flex-1 overflow-hidden rounded-xl border border-border bg-card shadow-sm">

        {/* ── Left: Branch list ── */}
        <div className="w-72 shrink-0 border-r border-border flex flex-col overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar sucursal..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
          </div>

          {/* Branch list */}
          <div className="flex-1 overflow-y-auto">
            {branchesLoading ? (
              <div className="p-3 space-y-2">
                {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
              </div>
            ) : filteredBranches.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm gap-2">
                <Store className="h-8 w-8 opacity-30" />
                <span>Sin sucursales</span>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredBranches.map(branch => (
                  <BranchListItem
                    key={branch.branch_id}
                    branch={branch}
                    isSelected={selectedBranchId === branch.branch_id}
                    onClick={() => setSelectedBranchId(branch.branch_id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer count */}
          <div className="p-3 border-t border-border bg-muted/30">
            <p className="text-xs text-muted-foreground">
              {branches.length} sucursal{branches.length !== 1 ? 'es' : ''} · {branches.filter(b => b.status === 1).length} activa{branches.filter(b => b.status === 1).length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* ── Right: Detail panel ── */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {branches.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <Store className="h-12 w-12 opacity-20" />
              <p className="text-sm">Creá tu primera sucursal para comenzar</p>
            </div>
          ) : !selectedBranch ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <Store className="h-12 w-12 opacity-20" />
              <p className="text-sm">Seleccioná una sucursal para ver sus detalles</p>
            </div>
          ) : (
            <>
              {/* Branch header */}
              <div className="px-6 pt-5 pb-0 shrink-0 border-b border-border">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm ${
                      selectedBranch.type === 'stand'
                        ? 'bg-orange-500'
                        : 'bg-blue-500'
                    }`}>
                      {selectedBranch.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold tracking-tight">{selectedBranch.name}</h2>
                        <Badge variant={selectedBranch.status === 1 ? 'default' : 'secondary'} className="text-xs">
                          {selectedBranch.status === 1 ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                        <span className="font-mono bg-muted px-1.5 py-0.5 rounded">{selectedBranch.code}</span>
                        <span>{selectedBranch.type === 'stand' ? 'Puesto' : 'Restaurante'}</span>
                        <span>{activeTerminals} terminal{activeTerminals !== 1 ? 'es' : ''} activa{activeTerminals !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditBranch(selectedBranch)}>
                      <Pencil className="h-3.5 w-3.5 mr-1.5" />
                      Editar
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeletingBranch(selectedBranch)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <Tabs defaultValue="terminals">
                  <TabsList className="bg-transparent border-0 p-0 h-auto gap-1">
                    <TabsTrigger
                      value="info"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-3 text-sm"
                    >
                      Información
                    </TabsTrigger>
                    <TabsTrigger
                      value="terminals"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-3 text-sm"
                    >
                      Terminales
                      {terminals.length > 0 && (
                        <span className="ml-1.5 bg-primary/15 text-primary text-xs font-bold px-1.5 py-0.5 rounded-full">
                          {terminals.length}
                        </span>
                      )}
                    </TabsTrigger>
                  </TabsList>

                  {/* ── Info tab ── */}
                  <TabsContent value="info" className="flex-1 overflow-y-auto p-6 mt-0">
                    <div className="max-w-lg space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <InfoField icon={<Tag className="h-4 w-4" />} label="Nombre" value={selectedBranch.name} />
                        <InfoField icon={<Tag className="h-4 w-4" />} label="Código" value={selectedBranch.code} mono />
                        <InfoField
                          icon={<Store className="h-4 w-4" />}
                          label="Tipo"
                          value={selectedBranch.type === 'stand' ? 'Puesto de venta' : 'Restaurante'}
                        />
                        <InfoField
                          icon={<Circle className="h-4 w-4" />}
                          label="Estado"
                          value={selectedBranch.status === 1 ? 'Activa' : 'Inactiva'}
                        />
                        {selectedBranch.location?.neighborhood && (
                          <InfoField
                            icon={<MapPin className="h-4 w-4" />}
                            label="Barrio"
                            value={selectedBranch.location.neighborhood}
                            className="col-span-2"
                          />
                        )}
                        {selectedBranch.location?.address && (
                          <InfoField
                            icon={<MapPin className="h-4 w-4" />}
                            label="Otras señas"
                            value={selectedBranch.location.address}
                            className="col-span-2"
                          />
                        )}
                        {selectedBranch.phone && (
                          <InfoField icon={<Phone className="h-4 w-4" />} label="Teléfono" value={selectedBranch.phone} />
                        )}
                      </div>

                      <div className="pt-4 border-t border-border">
                        <p className="text-xs text-muted-foreground">
                          Creada el {new Date(selectedBranch.created_at).toLocaleDateString('es-CR', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  {/* ── Terminals tab ── */}
                  <TabsContent value="terminals" className="overflow-y-auto mt-0">
                    <div className="p-6 space-y-3">
                      {/* Add terminal button */}
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-muted-foreground">
                          {terminals.length === 0
                            ? 'No hay terminales registradas en esta sucursal.'
                            : `${terminals.length} terminal${terminals.length !== 1 ? 'es' : ''} registrada${terminals.length !== 1 ? 's' : ''}`}
                        </p>
                        <Button
                          size="sm"
                          onClick={() => { setTerminalForm(defaultTerminal); setShowTerminalCreate(true); }}
                        >
                          <Plus className="h-3.5 w-3.5 mr-1.5" />
                          Agregar Terminal
                        </Button>
                      </div>

                      {terminalsLoading ? (
                        <div className="space-y-2">
                          {[1,2].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
                        </div>
                      ) : terminals.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-3">
                          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                            <Monitor className="h-7 w-7 opacity-40" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Sin terminales</p>
                            <p className="text-xs mt-1 max-w-xs">
                              Registrá la primera terminal para esta sucursal.
                            </p>
                          </div>
                          <Button
                            variant="outline" size="sm"
                            onClick={() => { setTerminalForm(defaultTerminal); setShowTerminalCreate(true); }}
                          >
                            <Plus className="h-3.5 w-3.5 mr-1.5" />
                            Registrar terminal
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {terminals.map(terminal => (
                            <TerminalCard
                              key={terminal.terminal_id}
                              terminal={terminal}
                              onEdit={() => openEditTerminal(terminal)}
                              onDelete={() => setDeletingTerminal(terminal)}
                              onToggle={() => updateTerminal.mutate({
                                id: terminal.terminal_id,
                                data: { status: terminal.status === 1 ? 0 : 1 }
                              })}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Branch dialogs ── */}
      <Dialog open={showBranchCreate} onOpenChange={setShowBranchCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Sucursal</DialogTitle>
            <DialogDescription>Completá los datos del nuevo puesto de venta.</DialogDescription>
          </DialogHeader>
          <BranchForm formData={branchForm} onChange={setBranchForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBranchCreate(false)}>Cancelar</Button>
            <Button onClick={() => createBranch.mutate(branchForm)} disabled={createBranch.isPending || !branchForm.name || !branchForm.code}>
              {createBranch.isPending ? 'Creando...' : 'Crear Sucursal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingBranch} onOpenChange={open => !open && setEditingBranch(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Sucursal</DialogTitle>
            <DialogDescription>Modificá los datos de la sucursal.</DialogDescription>
          </DialogHeader>
          <BranchForm formData={branchForm} onChange={setBranchForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingBranch(null)}>Cancelar</Button>
            <Button
              onClick={() => editingBranch && updateBranch.mutate({ id: editingBranch.branch_id, data: branchForm })}
              disabled={updateBranch.isPending || !branchForm.name || !branchForm.code}
            >
              {updateBranch.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingBranch} onOpenChange={open => !open && setDeletingBranch(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar sucursal?</AlertDialogTitle>
            <AlertDialogDescription>
              Esto eliminará permanentemente <strong>{deletingBranch?.name}</strong> y no se puede deshacer.
              La sucursal no puede tener terminales activas ni sesiones activas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deletingBranch && deleteBranch.mutate(deletingBranch.branch_id)}
              disabled={deleteBranch.isPending}
            >
              {deleteBranch.isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Terminal dialogs ── */}
      <Dialog open={showTerminalCreate} onOpenChange={setShowTerminalCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Terminal</DialogTitle>
            <DialogDescription>
              Agregá una nueva terminal a <strong>{selectedBranch?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <TerminalForm formData={terminalForm} onChange={setTerminalForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTerminalCreate(false)}>Cancelar</Button>
            <Button
              onClick={() => createTerminal.mutate(terminalForm)}
              disabled={createTerminal.isPending || !terminalForm.name || !terminalForm.code}
            >
              {createTerminal.isPending ? 'Registrando...' : 'Registrar Terminal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingTerminal} onOpenChange={open => !open && setEditingTerminal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Terminal</DialogTitle>
            <DialogDescription>Modificá los datos de la terminal.</DialogDescription>
          </DialogHeader>
          <TerminalForm formData={terminalForm} onChange={setTerminalForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTerminal(null)}>Cancelar</Button>
            <Button
              onClick={() => editingTerminal && updateTerminal.mutate({ id: editingTerminal.terminal_id, data: terminalForm })}
              disabled={updateTerminal.isPending}
            >
              {updateTerminal.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingTerminal} onOpenChange={open => !open && setDeletingTerminal(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar terminal?</AlertDialogTitle>
            <AlertDialogDescription>
              Esto eliminará permanentemente la terminal <strong>{deletingTerminal?.name}</strong>.
              No puede tener asignaciones activas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deletingTerminal && deleteTerminal.mutate(deletingTerminal.terminal_id)}
              disabled={deleteTerminal.isPending}
            >
              {deleteTerminal.isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ─────────────── Sub-components ─────────────── */

function BranchListItem({
  branch, isSelected, onClick,
}: { branch: Branch; isSelected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left px-3 py-2.5 rounded-lg transition-all group
        ${isSelected
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'hover:bg-muted/60 text-foreground'
        }
      `}
    >
      <div className="flex items-center gap-2.5">
        <div className={`
          w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0
          ${isSelected
            ? 'bg-white/20 text-white'
            : branch.type === 'stand' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
            : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
          }
        `}>
          {branch.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-sm truncate">{branch.name}</span>
            {branch.status !== 1 && (
              <span className={`text-[10px] font-bold px-1 rounded ${isSelected ? 'bg-white/20' : 'bg-muted text-muted-foreground'}`}>
                OFF
              </span>
            )}
          </div>
          <p className={`text-[11px] font-mono truncate mt-0.5 ${isSelected ? 'text-white/70' : 'text-muted-foreground'}`}>
            {branch.code}
          </p>
        </div>
        <ChevronRight className={`h-3.5 w-3.5 shrink-0 transition-transform ${isSelected ? 'text-white/70' : 'text-muted-foreground group-hover:translate-x-0.5'}`} />
      </div>
    </button>
  );
}

function TerminalCard({
  terminal, onEdit, onDelete, onToggle,
}: { terminal: Terminal; onEdit: () => void; onDelete: () => void; onToggle: () => void }) {
  const online = isOnline(terminal.last_seen_at);
  const lastSeen = timeSince(terminal.last_seen_at);

  return (
    <div className="group flex items-center gap-4 px-4 py-3.5 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors">
      {/* Status indicator */}
      <div className={`
        w-9 h-9 rounded-xl flex items-center justify-center shrink-0
        ${terminal.status === 1 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-muted'}
      `}>
        <Monitor className={`h-4.5 w-4.5 ${terminal.status === 1 ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{terminal.name}</span>
          <code className="text-[11px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
            {terminal.code}
          </code>
          {terminal.status !== 1 && (
            <Badge variant="secondary" className="text-[10px] h-4">Inactiva</Badge>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          {terminal.device_id ? (
            <span className="text-xs font-mono text-muted-foreground truncate max-w-[200px]">
              {terminal.device_id}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground/50 italic">Sin device_id</span>
          )}
          {lastSeen && (
            <span className={`flex items-center gap-1 text-[11px] ${online ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
              {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {lastSeen}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onToggle}>
          <Circle className={`h-3.5 w-3.5 ${terminal.status === 1 ? 'text-green-500 fill-green-500' : 'text-muted-foreground'}`} />
        </Button>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={onDelete}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function InfoField({
  icon, label, value, mono, className,
}: { icon: React.ReactNode; label: string; value: string; mono?: boolean; className?: string }) {
  return (
    <div className={`space-y-1 ${className ?? ''}`}>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        <span className="uppercase tracking-wide font-medium text-[10px]">{label}</span>
      </div>
      <p className={`text-sm font-medium ${mono ? 'font-mono text-xs bg-muted px-2 py-1 rounded inline-block' : ''}`}>
        {value}
      </p>
    </div>
  );
}

function BranchForm({ formData, onChange }: { formData: BranchFormData; onChange: (d: BranchFormData) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="b-name">Nombre <span className="text-destructive">*</span></Label>
          <Input id="b-name" value={formData.name} onChange={e => onChange({ ...formData, name: e.target.value })} placeholder="Puesto Norte" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="b-code">Código <span className="text-destructive">*</span></Label>
          <Input id="b-code" value={formData.code} onChange={e => onChange({ ...formData, code: e.target.value.toUpperCase() })} placeholder="P-NORTE" className="font-mono" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Tipo <span className="text-destructive">*</span></Label>
        <Select value={formData.type} onValueChange={(v: 'stand' | 'restaurant') => onChange({ ...formData, type: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="stand">Puesto de venta</SelectItem>
            <SelectItem value="restaurant">Restaurante</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <BranchLocationSection formData={formData} onChange={onChange} />
      
      <div className="space-y-1.5">
        <Label htmlFor="b-phone">Teléfono</Label>
        <Input id="b-phone" value={formData.phone} onChange={e => onChange({ ...formData, phone: e.target.value })} placeholder="8888-0000" />
      </div>
    </div>
  );
}

function TerminalForm({ formData, onChange }: { formData: TerminalFormData; onChange: (d: TerminalFormData) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="t-name">Nombre <span className="text-destructive">*</span></Label>
          <Input id="t-name" value={formData.name} onChange={e => onChange({ ...formData, name: e.target.value })} placeholder="Caja 1" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="t-code">Código <span className="text-destructive">*</span></Label>
          <Input id="t-code" value={formData.code} onChange={e => onChange({ ...formData, code: e.target.value.toUpperCase() })} placeholder="CJ-001" className="font-mono" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="t-device">Device ID</Label>
        <Input
          id="t-device"
          value={formData.device_id}
          onChange={e => onChange({ ...formData, device_id: e.target.value })}
          placeholder="uuid o identificador del dispositivo"
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">Identificador único del dispositivo físico (opcional).</p>
      </div>
    </div>
  );
}
