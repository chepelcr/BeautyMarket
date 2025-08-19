import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

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

  // Query for active pre-deployment
  const { data: activePreDeployment, isLoading } = useQuery({
    queryKey: ['/api/pre-deployments/active'],
    refetchInterval: 5000, // Poll every 5 seconds
  });

  // Mutation for publishing pre-deployment
  const publishMutation = useMutation({
    mutationFn: async (preDeploymentId: string) => {
      return apiRequest(`/api/pre-deployments/${preDeploymentId}/publish`, {
        method: "POST",
      });
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
      return apiRequest(`/api/pre-deployments/${preDeploymentId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pre-deployments/active'] });
    },
  });

  const handlePublish = async () => {
    if (activePreDeployment && activePreDeployment.id) {
      setIsPublishing(true);
      publishMutation.mutate(activePreDeployment.id);
    }
  };

  const handleDismiss = async () => {
    if (activePreDeployment && activePreDeployment.id) {
      dismissMutation.mutate(activePreDeployment.id);
    }
  };

  // Don't show banner if no active pre-deployment or if it's published
  if (isLoading || !activePreDeployment || activePreDeployment.status === 'published') {
    return null;
  }

  const getStatusIcon = () => {
    switch (activePreDeployment.status) {
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
    switch (activePreDeployment.status) {
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
    <div className={`border rounded-lg p-4 m-4 ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Badge variant="outline" className="text-xs">
              {activePreDeployment.triggerType === 'product' && 'Producto'}
              {activePreDeployment.triggerType === 'category' && 'Categoría'}
              {activePreDeployment.triggerType === 'cms' && 'Contenido'}
            </Badge>
          </div>
          <div>
            <p className="font-medium text-sm">
              {activePreDeployment.message}
            </p>
            <p className="text-xs opacity-75">
              {activePreDeployment.status === 'ready' 
                ? 'Los cambios están listos para publicar en el sitio web'
                : activePreDeployment.status === 'pending'
                ? 'Preparando cambios para publicación...'
                : 'Error en la preparación de cambios'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activePreDeployment.status === 'ready' && (
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
          
          <Button
            onClick={handleDismiss}
            disabled={dismissMutation.isPending}
            variant="ghost"
            size="sm"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {activePreDeployment.errorDetails && (
        <div className="mt-3 p-3 bg-background/50 rounded border text-sm">
          <p className="font-medium text-destructive mb-1">Error:</p>
          <p className="text-muted-foreground">{activePreDeployment.errorDetails}</p>
        </div>
      )}
    </div>
  );
}