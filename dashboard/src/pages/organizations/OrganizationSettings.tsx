import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { useDynamicTitle } from '@/hooks/useDynamicTitle';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Loader2,
  Settings,
  Users,
  Mail,
  Globe,
  Trash2,
  UserPlus,
  MoreVertical,
  RefreshCw,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function OrganizationSettings() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const {
    useOrganizationById,
    useOrganizationMembers,
    useOrganizationInvitations,
    useSystemRoles,
    useDomainStatus,
    updateOrganization,
    inviteMember,
    cancelInvitation,
    resendInvitation,
    updateMemberRole,
    removeMember,
    provisionInfrastructure,
  } = useOrganization();

  // Form state
  const [name, setName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRoleId, setInviteRoleId] = useState('');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{ userId: string; name: string } | null>(null);

  // Queries
  const { data: organization, isLoading: orgLoading } = useOrganizationById(id);
  const { data: members, isLoading: membersLoading } = useOrganizationMembers(id);
  const { data: invitations, isLoading: invitationsLoading } = useOrganizationInvitations(id);
  const { data: roles } = useSystemRoles();
  const { data: domainStatus } = useDomainStatus(id);

  useDynamicTitle(organization?.name ? `${organization.name} - ${t('organizations.settings.title')}` : t('organizations.settings.title'));

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Set form values when organization loads
  useEffect(() => {
    if (organization) {
      setName(organization.name);
    }
  }, [organization]);

  const handleUpdateOrganization = async () => {
    if (!id) return;

    try {
      await updateOrganization.mutateAsync({
        id,
        data: { name },
      });
      toast({
        title: t('organizations.settings.saved'),
        description: t('organizations.settings.savedDescription'),
      });
    } catch (error: any) {
      toast({
        title: t('organizations.settings.saveError'),
        description: error.message || t('organizations.settings.saveErrorDescription'),
        variant: 'destructive',
      });
    }
  };

  const handleInviteMember = async () => {
    if (!id || !user?.id || !inviteEmail || !inviteRoleId) return;

    try {
      await inviteMember.mutateAsync({
        organizationId: id,
        email: inviteEmail,
        roleId: inviteRoleId,
        invitedBy: user.id,
      });
      toast({
        title: t('organizations.settings.invitationSent'),
        description: t('organizations.settings.invitationSentDescription').replace('{email}', inviteEmail),
      });
      setShowInviteDialog(false);
      setInviteEmail('');
      setInviteRoleId('');
    } catch (error: any) {
      toast({
        title: t('organizations.settings.invitationError'),
        description: error.message || t('organizations.settings.invitationErrorDescription'),
        variant: 'destructive',
      });
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!id) return;

    try {
      await cancelInvitation.mutateAsync({ id: invitationId, organizationId: id });
      toast({
        title: t('organizations.settings.invitationCanceled'),
        description: t('organizations.settings.invitationCanceledDescription'),
      });
    } catch (error: any) {
      toast({
        title: t('organizations.settings.invitationError'),
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    if (!id) return;

    try {
      await resendInvitation.mutateAsync({ id: invitationId, organizationId: id });
      toast({
        title: t('organizations.settings.invitationResent'),
        description: t('organizations.settings.invitationResentDescription'),
      });
    } catch (error: any) {
      toast({
        title: t('organizations.settings.invitationError'),
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleUpdateRole = async (memberId: string, roleId: string) => {
    if (!id || !user?.id) return;

    try {
      await updateMemberRole.mutateAsync({
        memberId,
        roleId,
        updatedBy: user.id,
        organizationId: id,
      });
      toast({
        title: t('organizations.settings.roleUpdated'),
        description: t('organizations.settings.roleUpdatedDescription'),
      });
    } catch (error: any) {
      toast({
        title: t('organizations.settings.saveError'),
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleRemoveMember = async () => {
    if (!id || !user?.id || !memberToRemove) return;

    try {
      await removeMember.mutateAsync({
        userId: memberToRemove.userId,
        organizationId: id,
        removedBy: user.id,
      });
      toast({
        title: t('organizations.settings.memberRemoved'),
        description: t('organizations.settings.memberRemovedDescription').replace('{name}', memberToRemove.name),
      });
      setMemberToRemove(null);
    } catch (error: any) {
      toast({
        title: t('organizations.settings.saveError'),
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleProvisionInfrastructure = async () => {
    if (!id) return;

    try {
      await provisionInfrastructure.mutateAsync(id);
      toast({
        title: t('organizations.settings.infrastructureInProgress'),
        description: t('organizations.settings.infrastructureInProgressDescription'),
      });
    } catch (error: any) {
      toast({
        title: t('organizations.settings.saveError'),
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getRoleName = (roleName: string) => {
    switch (roleName) {
      case 'owner': return t('organizations.settings.roleOwner');
      case 'admin': return t('organizations.settings.roleAdmin');
      case 'manager': return t('organizations.settings.roleManager');
      case 'staff': return t('organizations.settings.roleStaff');
      default: return roleName;
    }
  };

  if (authLoading || orgLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="container max-w-4xl mx-auto py-10 px-4">
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">{t('organizations.settings.notFound')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const assignableRoles = roles?.filter(r => r.name !== 'platform_admin') || [];

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{organization.name}</h1>
        <p className="text-muted-foreground">{t('organizations.settings.title')}</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" />
            {t('organizations.settings.general')}
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="h-4 w-4 mr-2" />
            {t('organizations.settings.members')}
          </TabsTrigger>
          <TabsTrigger value="domain">
            <Globe className="h-4 w-4 mr-2" />
            {t('organizations.settings.domain')}
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>{t('organizations.settings.generalInfo')}</CardTitle>
              <CardDescription>{t('organizations.settings.generalInfoDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="org-name">{t('organizations.settings.name')}</Label>
                <Input
                  id="org-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('organizations.settings.slug')}</Label>
                <Input value={organization.slug} disabled />
                <p className="text-sm text-muted-foreground">{t('organizations.settings.slugNotEditable')}</p>
              </div>

              <Button
                onClick={handleUpdateOrganization}
                disabled={updateOrganization.isPending}
              >
                {updateOrganization.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('organizations.settings.saving')}
                  </>
                ) : (
                  t('organizations.settings.saveChanges')
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Members */}
        <TabsContent value="members">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t('organizations.settings.teamMembers')}</CardTitle>
                <CardDescription>{t('organizations.settings.teamMembersDescription')}</CardDescription>
              </div>
              <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    {t('organizations.settings.invite')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('organizations.settings.inviteMember')}</DialogTitle>
                    <DialogDescription>
                      {t('organizations.settings.inviteMemberDescription')}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="invite-email">{t('organizations.settings.email')}</Label>
                      <Input
                        id="invite-email"
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder={t('organizations.settings.emailPlaceholder')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invite-role">{t('organizations.settings.role')}</Label>
                      <Select value={inviteRoleId} onValueChange={setInviteRoleId}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('organizations.settings.selectRole')} />
                        </SelectTrigger>
                        <SelectContent>
                          {assignableRoles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {getRoleName(role.name)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                      {t('common.cancel')}
                    </Button>
                    <Button
                      onClick={handleInviteMember}
                      disabled={inviteMember.isPending || !inviteEmail || !inviteRoleId}
                    >
                      {inviteMember.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        t('organizations.settings.sendInvitation')
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {/* Current Members */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">{t('organizations.settings.currentMembers')}</h4>
                {membersLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {members?.map((member: any) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {member.user?.firstName?.[0] || member.user?.email?.[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {member.user?.firstName} {member.user?.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">{member.user?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select
                            value={member.roleId}
                            onValueChange={(value) => handleUpdateRole(member.id, value)}
                            disabled={member.userId === user?.id}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {assignableRoles.map((role) => (
                                <SelectItem key={role.id} value={role.id}>
                                  {getRoleName(role.name)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {member.userId !== user?.id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setMemberToRemove({
                                userId: member.userId,
                                name: `${member.user?.firstName || ''} ${member.user?.lastName || ''}`.trim() || member.user?.email
                              })}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pending Invitations */}
                {!invitationsLoading && invitations && invitations.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                      {t('organizations.settings.pendingInvitations')}
                    </h4>
                    <div className="space-y-3">
                      {invitations.map((invitation: any) => (
                        <div
                          key={invitation.id}
                          className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{invitation.email}</p>
                              <p className="text-sm text-muted-foreground">
                                {t('organizations.settings.invitedAs').replace('{role}', getRoleName(invitation.role?.name || 'miembro'))}
                              </p>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleResendInvitation(invitation.id)}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                {t('organizations.settings.resend')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-500"
                                onClick={() => handleCancelInvitation(invitation.id)}
                              >
                                <X className="h-4 w-4 mr-2" />
                                {t('common.cancel')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Domain Settings */}
        <TabsContent value="domain">
          <Card>
            <CardHeader>
              <CardTitle>{t('organizations.settings.domainSettings')}</CardTitle>
              <CardDescription>{t('organizations.settings.domainSettingsDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Subdomain */}
              <div className="space-y-2">
                <Label>{t('organizations.settings.subdomain')}</Label>
                <div className="flex items-center gap-2">
                  <Input value={organization.subdomain || ''} disabled />
                  <span className="text-muted-foreground">.jmarkets.jcampos.dev</span>
                </div>
                {organization.subdomain && (
                  <p className="text-sm text-muted-foreground">
                    {t('organizations.settings.subdomainUrl').replace('{subdomain}', organization.subdomain)}
                  </p>
                )}
              </div>

              {/* Infrastructure Status */}
              <div className="space-y-2">
                <Label>{t('organizations.settings.infrastructureStatus')}</Label>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    domainStatus?.infrastructureStatus === 'active' ? 'default' :
                    domainStatus?.infrastructureStatus === 'provisioning' ? 'secondary' :
                    domainStatus?.infrastructureStatus === 'failed' ? 'destructive' : 'outline'
                  }>
                    {domainStatus?.infrastructureStatus === 'active' ? t('organizations.settings.statusActive') :
                     domainStatus?.infrastructureStatus === 'provisioning' ? t('organizations.settings.statusProvisioning') :
                     domainStatus?.infrastructureStatus === 'failed' ? t('organizations.settings.statusFailed') :
                     t('organizations.settings.statusPending')}
                  </Badge>
                </div>
                {domainStatus?.infrastructureStatus === 'pending' && (
                  <Button
                    onClick={handleProvisionInfrastructure}
                    disabled={provisionInfrastructure.isPending}
                  >
                    {provisionInfrastructure.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('organizations.settings.configuring')}
                      </>
                    ) : (
                      t('organizations.settings.activateHosting')
                    )}
                  </Button>
                )}
              </div>

              {/* CloudFront Domain */}
              {domainStatus?.cloudfrontDomain && (
                <div className="space-y-2">
                  <Label>{t('organizations.settings.cloudfrontDomain')}</Label>
                  <Input value={domainStatus.cloudfrontDomain} disabled />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Remove Member Dialog */}
      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('organizations.settings.removeMember')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('organizations.settings.removeMemberDescription').replace('{name}', memberToRemove?.name || '')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveMember} className="bg-red-500 hover:bg-red-600">
              {t('organizations.settings.remove')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
