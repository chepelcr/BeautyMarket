import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Upload, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { buildOrgApiUrl } from "@/lib/apiUtils";
import { useOrganization } from "@/hooks/useOrganization";

interface PreDeployment {
  id: string;
  status: 'pending' | 'ready' | 'published' | 'error';
  triggerType: string;
  triggerAction: string;
  entityId?: string;
  entityType?: string;
  changes?: any;
  buildId?: string;
  message: string;
  errorDetails?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export function PreDeploymentBanner() {
  const [isPublishing, setIsPublishing] = useState(false);
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { useDefaultOrganization } = useOrganization();
  const { data: defaultOrg } = useDefaultOrganization(user?.id);

  // State for active pre-deployment
  const [activePreDeployment, setActivePreDeployment] = useState<PreDeployment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load active pre-deployment with polling
  useEffect(() => {
    if (!user?.id || !defaultOrg?.id) return;

    const loadActivePreDeployment = async () => {
      try {
        const response = await apiRequest('GET', buildOrgApiUrl(user.id, defaultOrg.id, '/pre-deployments/active'));
        const data = await response.json();
        setActivePreDeployment(data);
      } catch (error) {
        console.error('Failed to load active pre-deployment:', error);
        setActivePreDeployment(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadActivePreDeployment();

    // Poll every 5 seconds
    const interval = setInterval(loadActivePreDeployment, 5000);
    return () => clearInterval(interval);
  }, [user?.id, defaultOrg?.id]);

  const handlePublish = async () => {
    if (!user?.id || !defaultOrg?.id) return;

    setIsPublishing(true);
    try {
      await apiRequest("POST", buildOrgApiUrl(user.id, defaultOrg.id, "/deployments"), {});
      setIsPublishing(false);
      toast({
        title: "¡Despliegue Exitoso!",
        description: "Los cambios han sido publicados correctamente en el sitio web.",
      });
      // Refresh the active pre-deployment status
      const response = await apiRequest('GET', buildOrgApiUrl(user.id, defaultOrg.id, '/pre-deployments/active'));
      const data = await response.json();
      setActivePreDeployment(data);
    } catch (error) {
      console.error('Error publishing pre-deployment:', error);
      setIsPublishing(false);
      toast({
        title: "Error en Despliegue",
        description: "Hubo un problema al publicar los cambios. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleDismiss = async (preDeploymentId: string) => {
    if (!user?.id || !defaultOrg?.id) return;

    try {
      await apiRequest("DELETE", buildOrgApiUrl(user.id, defaultOrg.id, `/pre-deployments/${preDeploymentId}`), {});
      // Refresh the active pre-deployment status
      const response = await apiRequest('GET', buildOrgApiUrl(user.id, defaultOrg.id, '/pre-deployments/active'));
      const data = await response.json();
      setActivePreDeployment(data);
    } catch (error) {
      console.error('Error dismissing pre-deployment:', error);
      toast({
        title: "Error",
        description: "No se pudo descartar la pre-implementación.",
        variant: "destructive",
      });
    }
  };

  // Type guard and early return
  const preDeployment = activePreDeployment as PreDeployment;
  
  // Don't show banner if no active pre-deployment, if it's published, or if not authenticated
  if (isLoading || !preDeployment || preDeployment.status === 'published' || authLoading) {
    return null;
  }

  // Show banner to all authenticated users, but only admins can publish
  if (!user) {
    return null;
  }

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  const getStatusIcon = () => {
    switch (preDeployment.status) {
      case 'ready':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    switch (preDeployment.status) {
      case 'ready':
        return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200';
    }
  };

  return (
    <Card className={`p-4 mx-4 mt-4 mb-4 ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-md font-medium">
              {preDeployment.triggerType === 'product' && 'Producto'}
              {preDeployment.triggerType === 'category' && 'Categoría'}
              {preDeployment.triggerType === 'cms' && 'Contenido'}
            </span>
          </div>
          <div>
            <p className="font-medium text-sm">
              {preDeployment.message}
            </p>
            <p className="text-xs opacity-75">
              {preDeployment.status === 'ready' 
                ? 'Los cambios están listos para publicar en el sitio web'
                : preDeployment.status === 'pending'
                ? 'Preparando cambios para publicación...'
                : 'Error en la preparación de cambios'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {preDeployment.status === 'ready' && isAdmin && (
            <Button
              onClick={handlePublish}
              disabled={isPublishing}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Publicando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Publicar Cambios
                </>
              )}
            </Button>
          )}
          
          {!isAdmin && preDeployment.status === 'ready' && (
            <p className="text-sm text-muted-foreground">
              Solo los administradores pueden publicar cambios
            </p>
          )}
          
          {isAdmin && (
            <Button
              onClick={() => handleDismiss(preDeployment.id)}
              disabled={isPublishing}
              variant="ghost"
              size="sm"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {preDeployment.errorDetails && (
        <div className="mt-3 p-3 bg-background/50 rounded border text-sm">
          <p className="font-medium text-destructive mb-1">Error:</p>
          <p className="text-muted-foreground">{preDeployment.errorDetails}</p>
        </div>
      )}
    </Card>
  );
}