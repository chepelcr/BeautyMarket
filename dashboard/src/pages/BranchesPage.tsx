import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Store, Plus, Monitor, MapPin, Phone, Wifi, WifiOff, ChevronDown, ChevronUp,
  MoreVertical, Pencil, Trash2, CheckCircle, XCircle, AlertCircle,
} from 'lucide-react';
import { PageLoader } from '@/components/ui/page-loader';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from '@/components/ui/sheet';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useEffect } from 'react';
import { buildOrdersApiUrl } from '@/lib/apiUtils';
import { apiRequest } from '@/lib/queryClient';
import { BranchLocationSection } from '@/components/branches/BranchLocationSection';
import type { LocationData } from '@/models';

/* ─────────────── Types ─────────────── */

interface Branch {
  branch_id: string;
  name: string;
  code: string;
  type: 'stand' | 'restaurant';
  status: number;
  location: LocationData | null;
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
  neighborhood_id: number | null; address: string; phone: string;
}

interface TerminalFormData {
  name: string; code: string; device_id: string;
}

const defaultBranch: BranchFormData = {
  name: '', code: '', type: 'stand',
  state_id: null, county_id: null, district_id: null, neighborhood_id: null,
  address: '', phone: '',
};
const defaultTerminal: TerminalFormData = { name: '', code: '', device_id: '' };

const TYPE_LABEL: Record<'stand' | 'restaurant', string> = { stand: 'Stand', restaurant: 'Restaurante' };
const STATUS_LABEL: Record<number, string> = { 1: 'Activo', 2: 'Inactivo', 3: 'Eliminado' };

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

/* ─────────────── BranchCard ─────────────── */

interface BranchCardProps {
  branch: Branch;
  terminalsUrl: string;
  onEdit: (b: Branch) => void;
  onActivate: (b: Branch) => void;
  onDeactivate: (b: Branch) => void;
  onDelete: (b: Branch) => void;
  onAddTerminal: (b: Branch) => void;
  onEditTerminal: (b: Branch, t: Terminal) => void;
  onDeleteTerminal: (b: Branch, t: Terminal) => void;
  onToggleTerminal: (b: Branch, t: Terminal) => void;
}

function BranchCard({
  branch, terminalsUrl,
  onEdit, onActivate, onDeactivate, onDelete,
  onAddTerminal, onEditTerminal, onDeleteTerminal, onToggleTerminal,
}: BranchCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isActive = branch.status === 1;
  const isStand = branch.type === 'stand';

  const { data: terminalsData, isLoading: termLoading } = useQuery<{ data: Terminal[] }>({
    queryKey: [terminalsUrl],
    enabled: expanded,
  });
  const terminals = terminalsData?.data ?? [];

  const typeColor = isStand ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400';
  const typeBg = isStand ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-blue-50 dark:bg-blue-900/20';
  const borderColor = isActive ? (isStand ? 'border-l-orange-500' : 'border-l-blue-500') : 'border-l-border';

  return (
    <div
      className={`rounded-xl border border-border bg-card shadow-sm border-l-4 ${borderColor} transition-opacity ${branch.status === 3 ? 'opacity-50' : ''}`}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${typeBg}`}>
              <Store className={`h-4 w-4 ${typeColor}`} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <code className="text-[11px] font-mono font-bold bg-muted px-1.5 py-0.5 rounded">
                  {branch.code}
                </code>
                <Badge variant={isActive ? 'default' : branch.status === 2 ? 'secondary' : 'destructive'} className="text-[10px] h-4">
                  {STATUS_LABEL[branch.status]}
                </Badge>
              </div>
              <p className="font-bold text-sm mt-1 truncate font-display">{branch.name}</p>
            </div>
          </div>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {branch.status !== 3 && (
                <DropdownMenuItem onClick={() => onEdit(branch)}>
                  <Pencil className="h-3.5 w-3.5 mr-2" />
                  Editar
                </DropdownMenuItem>
              )}
              {branch.status === 2 && (
                <DropdownMenuItem onClick={() => onActivate(branch)} className="text-green-600 focus:text-green-600">
                  <CheckCircle className="h-3.5 w-3.5 mr-2" />
                  Activar
                </DropdownMenuItem>
              )}
              {branch.status === 1 && (
                <DropdownMenuItem onClick={() => onDeactivate(branch)}>
                  <XCircle className="h-3.5 w-3.5 mr-2" />
                  Desactivar
                </DropdownMenuItem>
              )}
              {branch.status !== 3 && <DropdownMenuSeparator />}
              {branch.status !== 3 && (
                <DropdownMenuItem
                  onClick={() => onDelete(branch)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 mt-2.5 flex-wrap">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Store className="h-3 w-3" />
            {TYPE_LABEL[branch.type]}
          </span>
          {branch.phone && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {branch.phone}
            </span>
          )}
          {branch.location?.address && (
            <span className="text-xs text-muted-foreground flex items-center gap-1 truncate max-w-[180px]">
              <MapPin className="h-3 w-3 shrink-0" />
              {branch.location.address}
            </span>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Terminals accordion toggle */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold">Terminales</span>
          {branch.terminals?.length != null && (
            <span className="bg-muted rounded-full px-2 py-0.5 text-[11px] font-bold">
              {branch.terminals.length}
            </span>
          )}
        </div>
        {expanded
          ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
          : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        }
      </button>

      {/* Terminals list */}
      {expanded && (
        <div className="border-t border-border/50 bg-muted/20">
          {termLoading ? (
            <div className="p-3 space-y-2">
              {[1, 2].map((i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}
            </div>
          ) : terminals.length === 0 ? (
            <div className="px-4 py-3 text-xs text-muted-foreground">Sin terminales registradas.</div>
          ) : (
            <div>
              {terminals.map((t, i) => {
                const online = isOnline(t.last_seen_at);
                const last = timeSince(t.last_seen_at);
                return (
                  <div
                    key={t.terminal_id}
                    className={`flex items-center gap-3 px-4 py-2.5 group ${i < terminals.length - 1 ? 'border-b border-border/30' : ''}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${t.status === 1 ? 'bg-green-500' : 'bg-muted-foreground/40'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold">{t.name}</span>
                        <code className="text-[10px] font-mono bg-muted px-1 rounded">{t.code}</code>
                      </div>
                      {last && (
                        <span className={`flex items-center gap-1 text-[10px] mt-0.5 ${online ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                          {online ? <Wifi className="h-2.5 w-2.5" /> : <WifiOff className="h-2.5 w-2.5" />}
                          {last}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost" size="sm" className="h-6 w-6 p-0"
                        onClick={() => onToggleTerminal(branch, t)}
                      >
                        <CheckCircle className={`h-3 w-3 ${t.status === 1 ? 'text-green-500' : 'text-muted-foreground'}`} />
                      </Button>
                      <Button
                        variant="ghost" size="sm" className="h-6 w-6 p-0"
                        onClick={() => onEditTerminal(branch, t)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        onClick={() => onDeleteTerminal(branch, t)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {isActive && (
            <div className="p-3">
              <button
                type="button"
                onClick={() => onAddTerminal(branch)}
                className="w-full border border-dashed border-border rounded-lg text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 py-2 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="h-3 w-3" />
                Agregar terminal
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
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

  /* ── Filter state ── */
  const [filter, setFilter] = useState<'all' | 'stand' | 'restaurant'>('all');
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [search, setSearch] = useState('');

  /* ── Sheet state ── */
  const [branchSheet, setBranchSheet] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [branchForm, setBranchForm] = useState<BranchFormData>(defaultBranch);

  const [termSheet, setTermSheet] = useState(false);
  const [termBranch, setTermBranch] = useState<Branch | null>(null);
  const [editingTerminal, setEditingTerminal] = useState<Terminal | null>(null);
  const [terminalForm, setTerminalForm] = useState<TerminalFormData>(defaultTerminal);

  /* ── Delete confirms ── */
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);
  const [deletingTerminal, setDeletingTerminal] = useState<{ branch: Branch; terminal: Terminal } | null>(null);

  const branchesUrl = organizationId && user?.id
    ? buildOrdersApiUrl(organizationId, '/branches')
    : null;

  const termUrlFor = (branchId: string) =>
    branchesUrl ? buildOrdersApiUrl(organizationId!, `/branches/${branchId}/terminals`) : null;

  /* ── Branches query ── */
  const { data: branchesData, isLoading: branchesLoading, error: branchesError } = useQuery<{ data: Branch[] }>({
    queryKey: [branchesUrl],
    enabled: !!branchesUrl,
  });

  const allBranches = branchesData?.data ?? [];
  const branches = allBranches.filter((b) => {
    if (showOnlyActive && b.status !== 1) return false;
    if (filter !== 'all' && b.type !== filter) return false;
    if (search && !b.name.toLowerCase().includes(search.toLowerCase()) && !b.code.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalCount = allBranches.length;
  const activeCount = allBranches.filter((b) => b.status === 1).length;

  /* ── Branch mutations ── */
  const createBranch = useMutation({
    mutationFn: async (data: BranchFormData) => {
      const res = await apiRequest('POST', branchesUrl!, {
        name: data.name, code: data.code, type: data.type,
        phone: data.phone || undefined,
        location: (data.state_id || data.county_id || data.district_id || data.neighborhood_id || data.address)
          ? { state_id: data.state_id || undefined, county_id: data.county_id || undefined, district_id: data.district_id || undefined, neighborhood_id: data.neighborhood_id || undefined, address: data.address || undefined }
          : undefined,
      });
      return res.json() as Promise<Branch>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [branchesUrl] });
      setBranchSheet(false);
      setBranchForm(defaultBranch);
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
      if (data.state_id !== undefined || data.county_id !== undefined || data.district_id !== undefined || data.neighborhood_id !== undefined || data.address !== undefined) {
        payload.location = {
          state_id: data.state_id || undefined, county_id: data.county_id || undefined,
          district_id: data.district_id || undefined, neighborhood_id: data.neighborhood_id || undefined,
          address: data.address || undefined,
        };
      }
      const res = await apiRequest('PATCH', `${branchesUrl}/${id}`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [branchesUrl] });
      setEditingBranch(null);
      setBranchSheet(false);
      toast({ title: 'Cambios guardados' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deleteBranch = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `${branchesUrl}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [branchesUrl] });
      setDeletingBranch(null);
      toast({ title: 'Sucursal eliminada' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  /* ── Terminal mutations ── */
  const createTerminal = useMutation({
    mutationFn: async ({ branchId, data }: { branchId: string; data: TerminalFormData }) => {
      const url = termUrlFor(branchId);
      const res = await apiRequest('POST', url!, { name: data.name, code: data.code, device_id: data.device_id || undefined });
      return res.json();
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: [termUrlFor(vars.branchId)] });
      queryClient.invalidateQueries({ queryKey: [branchesUrl] });
      setTermSheet(false);
      setTerminalForm(defaultTerminal);
      toast({ title: 'Terminal registrada' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const updateTerminal = useMutation({
    mutationFn: async ({ branchId, terminalId, data }: { branchId: string; terminalId: string; data: Partial<TerminalFormData> & { status?: number } }) => {
      const url = termUrlFor(branchId);
      const res = await apiRequest('PATCH', `${url}/${terminalId}`, data);
      return res.json();
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: [termUrlFor(vars.branchId)] });
      setEditingTerminal(null);
      setTermSheet(false);
      toast({ title: 'Terminal actualizada' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deleteTerminal = useMutation({
    mutationFn: async ({ branchId, terminalId }: { branchId: string; terminalId: string }) => {
      const url = termUrlFor(branchId);
      return apiRequest('DELETE', `${url}/${terminalId}`);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: [termUrlFor(vars.branchId)] });
      setDeletingTerminal(null);
      toast({ title: 'Terminal eliminada' });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  /* ── Handlers ── */
  const openEditBranch = (b: Branch) => {
    setEditingBranch(b);
    setBranchForm({
      name: b.name, code: b.code, type: b.type,
      state_id: b.location?.state_id ?? null, county_id: b.location?.county_id ?? null,
      district_id: b.location?.district_id ?? null, neighborhood_id: b.location?.neighborhood_id ?? null,
      address: b.location?.address ?? '', phone: b.phone ?? '',
    });
    setBranchSheet(true);
  };

  const openAddTerminal = (b: Branch) => {
    setTermBranch(b);
    setEditingTerminal(null);
    setTerminalForm(defaultTerminal);
    setTermSheet(true);
  };

  const openEditTerminal = (b: Branch, t: Terminal) => {
    setTermBranch(b);
    setEditingTerminal(t);
    setTerminalForm({ name: t.name, code: t.code, device_id: t.device_id ?? '' });
    setTermSheet(true);
  };

  if (authLoading || orgLoading) return <PageLoader />;

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sucursales & Terminales</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {totalCount === 0 ? 'Sin sucursales registradas.' : `${activeCount} activa${activeCount !== 1 ? 's' : ''} · ${totalCount} en total`}
          </p>
        </div>
        <Button onClick={() => { setEditingBranch(null); setBranchForm(defaultBranch); setBranchSheet(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Sucursal
        </Button>
      </div>

      {branchesError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Error al cargar sucursales.</AlertDescription>
        </Alert>
      )}

      {/* Filter bar */}
      <div className="flex gap-2 mb-5 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px] max-w-[320px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </span>
          <Input
            className="pl-8 h-8 text-sm"
            placeholder="Buscar por nombre o código…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'stand', 'restaurant'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${filter === f ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent border-border hover:bg-muted/60'}`}
            >
              {f === 'all' ? 'Todos' : TYPE_LABEL[f]}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowOnlyActive((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${showOnlyActive ? 'bg-green-600 text-white border-green-600' : 'bg-transparent border-border hover:bg-muted/60'}`}
        >
          <CheckCircle className="h-3.5 w-3.5" />
          Solo activos
        </button>
      </div>

      {/* Card grid */}
      {branchesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-36 w-full rounded-xl" />)}
        </div>
      ) : branches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <Store className="h-8 w-8 opacity-30" />
          </div>
          <div className="text-center">
            <p className="font-medium text-sm">
              {search || filter !== 'all' || showOnlyActive ? 'Sin resultados' : 'Sin sucursales registradas'}
            </p>
            <p className="text-xs mt-1">
              {search || filter !== 'all' || showOnlyActive ? 'Probá con otros filtros.' : 'Creá tu primera sucursal para comenzar.'}
            </p>
          </div>
          {!search && filter === 'all' && !showOnlyActive && (
            <Button size="sm" onClick={() => { setEditingBranch(null); setBranchForm(defaultBranch); setBranchSheet(true); }}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Crear sucursal
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {branches.map((branch) => (
            <BranchCard
              key={branch.branch_id}
              branch={branch}
              terminalsUrl={termUrlFor(branch.branch_id)!}
              onEdit={openEditBranch}
              onActivate={(b) => updateBranch.mutate({ id: b.branch_id, data: { status: 1 } })}
              onDeactivate={(b) => updateBranch.mutate({ id: b.branch_id, data: { status: 2 } })}
              onDelete={setDeletingBranch}
              onAddTerminal={openAddTerminal}
              onEditTerminal={openEditTerminal}
              onDeleteTerminal={(b, t) => setDeletingTerminal({ branch: b, terminal: t })}
              onToggleTerminal={(b, t) => updateTerminal.mutate({
                branchId: b.branch_id,
                terminalId: t.terminal_id,
                data: { status: t.status === 1 ? 2 : 1 },
              })}
            />
          ))}
        </div>
      )}

      {/* ── Branch sheet ── */}
      <Sheet open={branchSheet} onOpenChange={(o) => { if (!o) { setBranchSheet(false); setEditingBranch(null); } }}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingBranch ? 'Editar sucursal' : 'Nueva sucursal'}</SheetTitle>
            <SheetDescription>
              {editingBranch ? `Código: ${editingBranch.code}` : 'Completá los datos del nuevo puesto de venta.'}
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <BranchForm formData={branchForm} onChange={setBranchForm} />
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setBranchSheet(false)}>Cancelar</Button>
            <Button
              onClick={() => editingBranch
                ? updateBranch.mutate({ id: editingBranch.branch_id, data: branchForm })
                : createBranch.mutate(branchForm)
              }
              disabled={(editingBranch ? updateBranch : createBranch).isPending || !branchForm.name || !branchForm.code}
            >
              {(editingBranch ? updateBranch : createBranch).isPending
                ? 'Guardando…'
                : editingBranch ? 'Guardar cambios' : 'Crear sucursal'
              }
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ── Terminal sheet ── */}
      <Sheet open={termSheet} onOpenChange={(o) => { if (!o) { setTermSheet(false); setEditingTerminal(null); setTermBranch(null); } }}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingTerminal ? 'Editar terminal' : 'Nueva terminal'}</SheetTitle>
            <SheetDescription>
              {termBranch?.name}
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <TerminalForm formData={terminalForm} onChange={setTerminalForm} />
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setTermSheet(false)}>Cancelar</Button>
            <Button
              onClick={() => {
                if (!termBranch) return;
                if (editingTerminal) {
                  updateTerminal.mutate({ branchId: termBranch.branch_id, terminalId: editingTerminal.terminal_id, data: terminalForm });
                } else {
                  createTerminal.mutate({ branchId: termBranch.branch_id, data: terminalForm });
                }
              }}
              disabled={(editingTerminal ? updateTerminal : createTerminal).isPending || !terminalForm.name || !terminalForm.code}
            >
              {(editingTerminal ? updateTerminal : createTerminal).isPending
                ? 'Guardando…'
                : editingTerminal ? 'Guardar' : 'Registrar terminal'
              }
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ── Delete branch confirm ── */}
      <AlertDialog open={!!deletingBranch} onOpenChange={(o) => !o && setDeletingBranch(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar sucursal?</AlertDialogTitle>
            <AlertDialogDescription>
              Esto eliminará permanentemente <strong>{deletingBranch?.name}</strong>. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deletingBranch && deleteBranch.mutate(deletingBranch.branch_id)}
              disabled={deleteBranch.isPending}
            >
              {deleteBranch.isPending ? 'Eliminando…' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Delete terminal confirm ── */}
      <AlertDialog open={!!deletingTerminal} onOpenChange={(o) => !o && setDeletingTerminal(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar terminal?</AlertDialogTitle>
            <AlertDialogDescription>
              Esto eliminará permanentemente la terminal <strong>{deletingTerminal?.terminal.name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deletingTerminal && deleteTerminal.mutate({
                branchId: deletingTerminal.branch.branch_id,
                terminalId: deletingTerminal.terminal.terminal_id,
              })}
              disabled={deleteTerminal.isPending}
            >
              {deleteTerminal.isPending ? 'Eliminando…' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ─────────────── Form sub-components ─────────────── */

function BranchForm({ formData, onChange }: { formData: BranchFormData; onChange: (d: BranchFormData) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="b-name">Nombre <span className="text-destructive">*</span></Label>
          <Input id="b-name" value={formData.name} onChange={(e) => onChange({ ...formData, name: e.target.value })} placeholder="Puesto Norte" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="b-code">Código <span className="text-destructive">*</span></Label>
          <Input id="b-code" value={formData.code} onChange={(e) => onChange({ ...formData, code: e.target.value.toUpperCase() })} placeholder="P-NORTE" className="font-mono" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Tipo <span className="text-destructive">*</span></Label>
        <Select value={formData.type} onValueChange={(v: 'stand' | 'restaurant') => onChange({ ...formData, type: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="stand">Stand de venta</SelectItem>
            <SelectItem value="restaurant">Restaurante</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="b-phone">Teléfono</Label>
        <Input id="b-phone" value={formData.phone} onChange={(e) => onChange({ ...formData, phone: e.target.value })} placeholder="8888-0000" />
      </div>
      <div className="h-px bg-border" />
      <BranchLocationSection formData={formData} onChange={onChange} />
    </div>
  );
}

function TerminalForm({ formData, onChange }: { formData: TerminalFormData; onChange: (d: TerminalFormData) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="t-name">Nombre <span className="text-destructive">*</span></Label>
          <Input id="t-name" value={formData.name} onChange={(e) => onChange({ ...formData, name: e.target.value })} placeholder="Caja 1" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="t-code">Código <span className="text-destructive">*</span></Label>
          <Input id="t-code" value={formData.code} onChange={(e) => onChange({ ...formData, code: e.target.value.toUpperCase() })} placeholder="CJ-001" className="font-mono" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="t-device">Device ID</Label>
        <Input
          id="t-device"
          value={formData.device_id}
          onChange={(e) => onChange({ ...formData, device_id: e.target.value })}
          placeholder="uuid o identificador del dispositivo"
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">Identificador único del dispositivo físico (opcional).</p>
      </div>
    </div>
  );
}
