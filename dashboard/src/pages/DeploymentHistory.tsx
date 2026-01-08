import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ArrowLeft, Calendar, Clock, ExternalLink, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useDynamicTitle } from '@/hooks/useDynamicTitle';
import { useLanguage } from '@/contexts/LanguageContext';

interface DeploymentHistory {
  id: string;
  buildId: string;
  status: 'building' | 'uploading' | 'success' | 'error';
  message: string;
  startedAt: string;
  completedAt?: string;
  deployUrl?: string;
  errorDetails?: string;
  filesUploaded?: number;
  buildSizeKb?: number;
}

const statusColors = {
  building: 'bg-blue-500',
  uploading: 'bg-yellow-500',
  success: 'bg-green-500',
  error: 'bg-red-500'
};

const statusIcons = {
  building: Loader,
  uploading: Clock,
  success: CheckCircle,
  error: AlertCircle
};

export default function DeploymentHistory() {
  const { t } = useLanguage();

  // Set dynamic page title
  useDynamicTitle(t('deployments.history.title'));

  const { data: deployments, isLoading, error } = useQuery<DeploymentHistory[]>({
    queryKey: ['/api/deployments'],
    refetchInterval: 5000, // Refresh every 5 seconds to get latest status
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('deployments.history.backToAdmin')}
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('deployments.history.title')}
          </h1>
        </div>
        <div className="flex justify-center items-center py-12">
          <Loader className="w-8 h-8 animate-spin text-gray-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('deployments.history.backToAdmin')}
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('deployments.history.title')}
          </h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span>{t('deployments.history.loadError')}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Admin
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Historial de Despliegues
        </h1>
      </div>

      {!deployments || deployments.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-gray-500 dark:text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">{t('deployments.history.noDeployments')}</p>
              <p className="text-sm">{t('deployments.history.noDeploymentsDescription')}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {deployments
            .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
            .map((deployment) => {
              const StatusIcon = statusIcons[deployment.status];
              const duration = deployment.completedAt 
                ? ((new Date(deployment.completedAt).getTime() - new Date(deployment.startedAt).getTime()) / 1000).toFixed(1)
                : null;

              return (
                <Card key={deployment.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-3">
                        <StatusIcon 
                          className={`w-5 h-5 ${
                            deployment.status === 'building' || deployment.status === 'uploading' 
                              ? 'animate-spin' 
                              : ''
                          }`}
                        />
                        <span className="text-base font-medium">
                          Build #{deployment.buildId.slice(-6)}
                        </span>
                      </CardTitle>
                      <Badge
                        variant="secondary"
                        className={`${statusColors[deployment.status]} text-white`}
                      >
                        {deployment.status === 'building' && t('deployments.status.building')}
                        {deployment.status === 'uploading' && t('deployments.status.uploading')}
                        {deployment.status === 'success' && t('deployments.status.success')}
                        {deployment.status === 'error' && t('deployments.status.error')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {deployment.message}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500 dark:text-gray-400 mb-1">{t('deployments.fields.started')}</div>
                        <div className="font-medium">
                          {format(new Date(deployment.startedAt), 'dd/MM/yyyy HH:mm')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(deployment.startedAt), { addSuffix: true })}
                        </div>
                      </div>

                      {deployment.completedAt && (
                        <div>
                          <div className="text-gray-500 dark:text-gray-400 mb-1">{t('deployments.fields.completed')}</div>
                          <div className="font-medium">
                            {format(new Date(deployment.completedAt), 'dd/MM/yyyy HH:mm')}
                          </div>
                          {duration && (
                            <div className="text-xs text-gray-500">
                              {t('deployments.fields.duration')}: {duration}s
                            </div>
                          )}
                        </div>
                      )}

                      {deployment.filesUploaded && (
                        <div>
                          <div className="text-gray-500 dark:text-gray-400 mb-1">{t('deployments.fields.files')}</div>
                          <div className="font-medium">{deployment.filesUploaded}</div>
                        </div>
                      )}

                      {deployment.buildSizeKb && (
                        <div>
                          <div className="text-gray-500 dark:text-gray-400 mb-1">{t('deployments.fields.size')}</div>
                          <div className="font-medium">
                            {(deployment.buildSizeKb / 1024).toFixed(1)} MB
                          </div>
                        </div>
                      )}
                    </div>

                    {deployment.status === 'error' && deployment.errorDetails && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                        <div className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                          {t('deployments.errorDetails')}:
                        </div>
                        <div className="text-sm text-red-700 dark:text-red-300 font-mono">
                          {deployment.errorDetails}
                        </div>
                      </div>
                    )}

                    {deployment.status === 'success' && deployment.deployUrl && (
                      <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3">
                        <div className="text-sm text-green-800 dark:text-green-200">
                          ✅ {t('deployments.successMessage')}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(deployment.deployUrl, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          {t('deployments.viewSite')}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
        </div>
      )}
    </div>
  );
}