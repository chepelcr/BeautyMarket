import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Upload, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

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
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();

  // Query for active pre-deployment
  const { data: activePreDeployment, isLoading } = useQuery({
    queryKey: ['/api/pre-deployments/active'],
    refetchInterval: 5000, // Poll every 5 seconds
  });

  // Mutation for publishing pre-deployment (uses existing deploy endpoint)
  const publishMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/deploy", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pre-deployments/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/deploy/status'] });
      setIsPublishing(false);
    },
    onError: (error) => {
      console.error('Error publishing pre-deployment:', error);
      setIsPublishing(false);
    },
  });

  // Mutation for dismissing pre-deployment
  const dismissMutation = useMutation({
    mutationFn: async (preDeploymentId: string) => {
      return await apiRequest("DELETE", `/api/pre-deployments/${preDeploymentId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pre-deployments/active'] });
    },
  });

  const handlePublish = async () => {
    setIsPublishing(true);
    publishMutation.mutate();
  };

  const handleDismiss = async () => {
    if (preDeployment?.id) {
      dismissMutation.mutate(preDeployment.id);
    }
  };

  // Type guard and early return
  const preDeployment = activePreDeployment as PreDeployment;
  
  // Don't show banner if no active pre-deployment or if it's published
  if (isLoading || !preDeployment || preDeployment.status === 'published') {
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
    <Card className={`p-4 m-4 ${getStatusColor()}`}>
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
              disabled={isPublishing || publishMutation.isPending}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isPublishing || publishMutation.isPending ? (
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
              Inicia sesión como administrador para publicar cambios
            </p>
          )}
          
          {isAdmin && (
            <Button
              onClick={handleDismiss}
              disabled={dismissMutation.isPending}
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