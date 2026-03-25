import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calendar, Clock, ExternalLink, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useDynamicTitle } from '@/hooks/useDynamicTitle';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { buildOrgApiUrl } from '@/lib/apiUtils';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

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

interface PreDeployment {
  id: string;
  status: 'ready';
  triggerType: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  changes: any;
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
  const { user } = useAuth();
  const { useDefaultOrganization } = useOrganization();
  const { data: organization } = useDefaultOrganization(user?.id);
  const [activeTab, setActiveTab] = useState('pending');
  const queryClient = useQueryClient();

  // Set dynamic page title
  useDynamicTitle(t('deployments.history.title'));

  const publishMutation = useMutation({
    mutationFn: async (preDeploymentId: string) => {
      if (!user?.id || !organization?.id) throw new Error('Missing user or organization');
      await apiRequest(
        'POST',
        buildOrgApiUrl(user.id, organization.id, `/pre-deployments/${preDeploymentId}/publish`)
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pre-deployments'] });
      queryClient.invalidateQueries({ queryKey: ['deployments'] });
      toast({
        title: t('deployments.toast.publishSuccess'),
        description: t('deployments.toast.publishSuccessDescription'),
      });
      setActiveTab('history');
    },
    onError: (error: any) => {
      toast({
        title: t('deployments.toast.error'),
        description: error.message || t('deployments.toast.publishError'),
        variant: 'destructive',
      });
    },
  });

  const { data: preDeployments, isLoading: isLoadingPre } = useQuery<PreDeployment[]>({
    queryKey: ['pre-deployments', user?.id, organization?.id],
    queryFn: async () => {
      if (!user?.id || !organization?.id) return [];
      const response = await apiRequest('GET', buildOrgApiUrl(user.id, organization.id, '/pre-deployments'));
      const data = await response.json();
      return data.filter((d: PreDeployment) => d.status === 'ready').slice(0, 1);
    },
    enabled: !!user?.id && !!organization?.id,
  });

  const { data: deployments, isLoading: isLoadingDep } = useQuery<DeploymentHistory[]>({
    queryKey: ['deployments', user?.id, organization?.id],
    queryFn: async () => {
      if (!user?.id || !organization?.id) return [];
      const response = await apiRequest('GET', buildOrgApiUrl(user.id, organization.id, '/deployments/history'));
      return response.json();
    },
    enabled: !!user?.id && !!organization?.id,
    refetchInterval: 5000,
  });

  const isLoading = isLoadingPre || isLoadingDep;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
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

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('deployments.history.title')}
        </h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">{t('deployments.tabs.pending')}</TabsTrigger>
          <TabsTrigger value="history">{t('deployments.tabs.history')}</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {!preDeployments || preDeployments.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-gray-500 dark:text-gray-400">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">{t('deployments.pending.noChanges')}</p>
                  <p className="text-sm">{t('deployments.pending.noChangesDescription')}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-3">
                    <Clock className="w-5 h-5" />
                    <span className="text-base font-medium">{t('deployments.pending.title')}</span>
                  </CardTitle>
                  <Badge variant="secondary" className="bg-yellow-500 text-white">
                    {t('deployments.pending.readyToPublish')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t(preDeployments[0].message)}
                </p>
                <div className="text-sm">
                  <div className="text-gray-500 dark:text-gray-400 mb-1">{t('deployments.pending.created')}</div>
                  <div className="font-medium">
                    {format(new Date(preDeployments[0].createdAt), 'dd/MM/yyyy HH:mm')}
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => publishMutation.mutate(preDeployments[0].id)}
                  disabled={publishMutation.isPending}
                >
                  {publishMutation.isPending && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                  {publishMutation.isPending ? t('deployments.pending.publishing') : t('deployments.pending.publishButton')}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}