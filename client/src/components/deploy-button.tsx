import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Globe, CheckCircle, XCircle, Clock } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface DeploymentStatus {
  status: 'idle' | 'building' | 'uploading' | 'success' | 'error';
  message: string;
  timestamp: string;
  buildId?: string;
}

interface DeployButtonProps {
  disabled?: boolean;
  onDeployStart?: () => void;
  onDeployComplete?: (success: boolean) => void;
  className?: string;
}

export function DeployButton({ disabled, onDeployStart, onDeployComplete, className }: DeployButtonProps) {
  const [showStatus, setShowStatus] = useState(false);
  const { toast } = useToast();

  // Query deployment status
  const { data: deploymentStatus, refetch: refetchStatus } = useQuery<DeploymentStatus>({
    queryKey: ["/api/deploy/status"],
    refetchInterval: (data) => {
      // Refetch more frequently during active deployment
      if (data?.status === 'building' || data?.status === 'uploading') {
        return 2000; // 2 seconds
      }
      return 30000; // 30 seconds
    },
  });

  const deployMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/deploy");
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Despliegue iniciado",
          description: "La página se está desplegando automáticamente a AWS S3",
        });
        onDeployStart?.();
        setShowStatus(true);
      } else {
        toast({
          title: "Error de despliegue",
          description: data.message || "No se pudo iniciar el despliegue",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error de despliegue",
        description: "No se pudo conectar con el servidor de despliegue",
        variant: "destructive",
      });
    },
  });

  // Monitor deployment completion
  useEffect(() => {
    if (deploymentStatus?.status === 'success') {
      toast({
        title: "✅ Despliegue exitoso",
        description: "La página está ahora disponible online",
      });
      onDeployComplete?.(true);
      queryClient.invalidateQueries({ queryKey: ["/api/deploy/status"] });
    } else if (deploymentStatus?.status === 'error') {
      toast({
        title: "❌ Error en el despliegue",
        description: deploymentStatus.message,
        variant: "destructive",
      });
      onDeployComplete?.(false);
    }
  }, [deploymentStatus?.status, onDeployComplete]);

  const handleDeploy = () => {
    if (disabled) {
      toast({
        title: "Guarda los cambios primero",
        description: "Debes guardar tus cambios antes de desplegar",
        variant: "destructive",
      });
      return;
    }
    deployMutation.mutate();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'building':
        return <Clock className="w-4 h-4 animate-pulse text-blue-500" />;
      case 'uploading':
        return <Upload className="w-4 h-4 animate-bounce text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'building':
        return 'blue';
      case 'uploading':
        return 'yellow';
      case 'success':
        return 'green';
      case 'error':
        return 'red';
      default:
        return 'gray';
    }
  };

  const isDeploying = deploymentStatus?.status === 'building' || deploymentStatus?.status === 'uploading';

  return (
    <>
      <Button
        onClick={handleDeploy}
        disabled={disabled || deployMutation.isPending || isDeploying}
        size="sm"
        className={className || "w-full sm:w-auto"}
        variant={deploymentStatus?.status === 'success' ? 'default' : 'outline'}
      >
        {deployMutation.isPending || isDeploying ? (
          <Loader2 className="w-4 h-4 mr-1 sm:mr-2 animate-spin" />
        ) : (
          <Globe className="w-4 h-4 mr-1 sm:mr-2" />
        )}
        <span className="hidden md:inline">
          {isDeploying ? 'Desplegando...' : 'Publicar Online'}
        </span>
        <span className="md:hidden">Publicar</span>
      </Button>

      {deploymentStatus && deploymentStatus.status !== 'idle' && (
        <Button
          onClick={() => setShowStatus(true)}
          variant="ghost"
          size="sm"
          className="p-2"
        >
          {getStatusIcon(deploymentStatus.status)}
        </Button>
      )}

      <Dialog open={showStatus} onOpenChange={setShowStatus}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Estado del Despliegue
            </DialogTitle>
            <DialogDescription>
              Proceso de publicación automática a AWS S3
            </DialogDescription>
          </DialogHeader>

          {deploymentStatus && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Estado:</span>
                <Badge variant="outline" className="flex items-center gap-1">
                  {getStatusIcon(deploymentStatus.status)}
                  <span className="capitalize">
                    {deploymentStatus.status === 'building' && 'Construyendo'}
                    {deploymentStatus.status === 'uploading' && 'Subiendo'}
                    {deploymentStatus.status === 'success' && 'Exitoso'}
                    {deploymentStatus.status === 'error' && 'Error'}
                    {deploymentStatus.status === 'idle' && 'Listo'}
                  </span>
                </Badge>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                {deploymentStatus.message}
              </div>

              {deploymentStatus.buildId && (
                <div className="text-xs text-gray-500">
                  Build ID: {deploymentStatus.buildId}
                </div>
              )}

              <div className="text-xs text-gray-500">
                Última actualización: {new Date(deploymentStatus.timestamp).toLocaleString()}
              </div>

              {deploymentStatus.status === 'success' && (
                <Button 
                  onClick={() => window.open(`https://${import.meta.env.VITE_AWS_S3_BUCKET_NAME || 'strawberryessentials'}.s3-website.${import.meta.env.VITE_AWS_REGION || 'us-east-1'}.amazonaws.com`, '_blank')}
                  className="w-full"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Ver Página Online
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}