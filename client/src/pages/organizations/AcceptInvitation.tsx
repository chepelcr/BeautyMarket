import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useDynamicTitle } from '@/hooks/useDynamicTitle';
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { buildPublicApiUrl } from '@/lib/apiUtils';

export default function AcceptInvitation() {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();

  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useDynamicTitle('Aceptar Invitación');

  // Fetch invitation details
  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const response = await apiRequest('GET', buildPublicApiUrl(`/invitations/token/${token}`));
        const data = await response.json();
        setInvitation(data);

        // Check if expired
        if (new Date(data.expiresAt) < new Date()) {
          setError('Esta invitación ha expirado');
        } else if (data.status !== 'pending') {
          setError('Esta invitación ya no es válida');
        }
      } catch (err: any) {
        if (err.message?.includes('404')) {
          setError('Invitación no encontrada o ya no es válida');
        } else {
          setError('Error al cargar la invitación');
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchInvitation();
    }
  }, [token]);

  const handleAccept = async () => {
    if (!user?.id || !token) return;

    setAccepting(true);
    try {
      await apiRequest('POST', buildPublicApiUrl(`/invitations/accept/${token}`), { userId: user.id });

      setSuccess(true);
      toast({
        title: 'Invitación aceptada',
        description: 'Te has unido a la organización exitosamente',
      });

      // Redirect to organization after a moment
      setTimeout(() => {
        navigate('/admin');
      }, 2000);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'No se pudo aceptar la invitación',
        variant: 'destructive',
      });
    } finally {
      setAccepting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Not authenticated - prompt to login/register
  if (!isAuthenticated) {
    return (
      <div className="container max-w-md mx-auto py-20 px-4">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Invitación Recibida</CardTitle>
            <CardDescription>
              {invitation ? (
                <>Has sido invitado a unirte a una organización</>
              ) : (
                <>Inicia sesión para ver esta invitación</>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              Debes iniciar sesión o crear una cuenta para aceptar esta invitación.
            </p>
            <div className="flex flex-col gap-2">
              <Button onClick={() => navigate(`/login?redirect=/join/${token}`)}>
                Iniciar Sesión
              </Button>
              <Button variant="outline" onClick={() => navigate(`/register?redirect=/join/${token}`)}>
                Crear Cuenta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container max-w-md mx-auto py-20 px-4">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <CardTitle>Invitación No Válida</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate('/')}>
              Volver al Inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="container max-w-md mx-auto py-20 px-4">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <CardTitle>Bienvenido al Equipo</CardTitle>
            <CardDescription>
              Te has unido exitosamente a la organización
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">Redirigiendo...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show invitation details
  return (
    <div className="container max-w-md mx-auto py-20 px-4">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Invitación a Organización</CardTitle>
          <CardDescription>
            Has sido invitado a unirte a un equipo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <p className="text-sm">
              <span className="text-muted-foreground">Email: </span>
              {invitation.email}
            </p>
            {invitation.organization && (
              <p className="text-sm">
                <span className="text-muted-foreground">Organización: </span>
                {invitation.organization.name}
              </p>
            )}
            {invitation.role && (
              <p className="text-sm">
                <span className="text-muted-foreground">Rol: </span>
                {invitation.role.name === 'owner' ? 'Propietario' :
                 invitation.role.name === 'admin' ? 'Administrador' :
                 invitation.role.name === 'manager' ? 'Gerente' :
                 invitation.role.name === 'staff' ? 'Personal' : invitation.role.name}
              </p>
            )}
          </div>

          {user?.email?.toLowerCase() !== invitation.email?.toLowerCase() && (
            <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
              Esta invitación fue enviada a {invitation.email}. Asegúrate de estar usando la cuenta correcta.
            </p>
          )}

          <Button
            className="w-full"
            onClick={handleAccept}
            disabled={accepting || user?.email?.toLowerCase() !== invitation.email?.toLowerCase()}
          >
            {accepting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Aceptando...
              </>
            ) : (
              'Aceptar Invitación'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
