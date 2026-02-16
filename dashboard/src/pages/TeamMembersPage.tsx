import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Users, AlertCircle, Trash2, Shield } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { buildUserApiUrl } from '@/lib/apiUtils';
import { apiRequest } from '@/lib/queryClient';
import { useLanguage } from '@/contexts/LanguageContext';
import type { OrganizationMemberWithUser } from '@/models/OrganizationMember';

interface MemberToRemove {
  memberId: string;
  memberName: string;
  userId: string;
}

export default function TeamMembersPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { useDefaultOrganization } = useOrganization();
  const { data: organization, isLoading: orgLoading } = useDefaultOrganization(user?.id);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const organizationId = organization?.id;

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // State for filters and dialogs
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [memberToRemove, setMemberToRemove] = useState<MemberToRemove | null>(null);

  // Fetch members
  const {
    data: members = [],
    isLoading: membersLoading,
    error,
  } = useQuery<OrganizationMemberWithUser[]>({
    queryKey: [
      buildUserApiUrl(
        user?.id || '',
        `/memberships/organization/${organizationId}/members`
      ),
    ],
    enabled: !!user?.id && !!organizationId,
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async ({ memberUserId, organizationId }: { memberUserId: string; organizationId: string }) => {
      if (!user?.id) throw new Error('User ID required');
      // Note: Backend expects the member's userId in the URL path (not the authenticated user's)
      // This works because the route is /api/users/:userId/memberships/organization/:organizationId
      // where :userId should be the member being removed
      const url = buildUserApiUrl(
        memberUserId,
        `/memberships/organization/${organizationId}`
      );
      return await apiRequest('DELETE', url, { removedBy: user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          buildUserApiUrl(
            user?.id || '',
            `/memberships/organization/${organizationId}/members`
          ),
        ],
      });
      toast({
        title: t('members.toast.removed.title'),
        description: t('members.toast.removed.description'),
      });
      setMemberToRemove(null);
    },
    onError: (error: Error) => {
      toast({
        title: t('members.toast.removeFailed.title'),
        description: error.message || t('members.toast.removeFailed.description'),
        variant: 'destructive',
      });
    },
  });

  // Filter members by role
  const filteredMembers = roleFilter === 'all'
    ? members
    : members.filter(m => m.role.name === roleFilter);

  // Get unique roles for filter
  const uniqueRoles = Array.from(new Set(members.map(m => m.role.name)));

  // Handlers
  const handleRemoveMember = (member: OrganizationMemberWithUser) => {
    setMemberToRemove({
      memberId: member.id,
      memberName: member.user.email,
      userId: member.userId,
    });
  };

  const confirmRemoveMember = () => {
    if (!memberToRemove || !organizationId) return;
    removeMemberMutation.mutate({
      memberUserId: memberToRemove.userId,
      organizationId,
    });
  };

  const handleInviteMember = () => {
    // Navigate to invitation flow
    toast({
      title: t('members.inviteComingSoon.title'),
      description: t('members.inviteComingSoon.description'),
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRoleBadgeVariant = (roleName: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (roleName) {
      case 'owner':
        return 'destructive';
      case 'admin':
        return 'default';
      default:
        return 'secondary';
    }
  };

  // Loading states
  if (authLoading || orgLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !organization || !organizationId) {
    return null;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8" />
            {t('members.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('members.subtitle')}
          </p>
        </div>
        <Button onClick={handleInviteMember} size="lg">
          <UserPlus className="h-5 w-5 mr-2" />
          {t('members.invite')}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t('members.filterByRole')}</span>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('members.allRoles')}</SelectItem>
              {uniqueRoles.map(role => (
                <SelectItem key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground">
          {t('members.totalMembers')}: {filteredMembers.length}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t('members.error')}: {(error as Error).message}
          </AlertDescription>
        </Alert>
      )}

      {/* Members table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('members.teamMembers')}</CardTitle>
          <CardDescription>
            {t('members.teamMembersDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {membersLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {roleFilter === 'all' ? t('members.noMembers') : t('members.noMembersWithRole')}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                {roleFilter === 'all'
                  ? t('members.noMembersDescription')
                  : t('members.noMembersWithRoleDescription')}
              </p>
              {roleFilter === 'all' && (
                <Button onClick={handleInviteMember}>
                  <UserPlus className="h-5 w-5 mr-2" />
                  {t('members.invite')}
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('members.name')}</TableHead>
                    <TableHead>{t('members.email')}</TableHead>
                    <TableHead>{t('members.role')}</TableHead>
                    <TableHead>{t('members.joinDate')}</TableHead>
                    <TableHead>{t('members.status')}</TableHead>
                    <TableHead className="text-right">{t('members.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => {
                    const fullName = [member.user.firstName, member.user.lastName]
                      .filter(Boolean)
                      .join(' ') || member.user.username;
                    const isOwner = member.role.name === 'owner';
                    const isCurrentUser = member.userId === user?.id;

                    return (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          {fullName}
                          {isCurrentUser && (
                            <Badge variant="outline" className="ml-2">
                              {t('members.you')}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{member.user.email}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(member.role.name)}>
                            <Shield className="h-3 w-3 mr-1" />
                            {member.role.displayName}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(member.joinedAt)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {t('members.active')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {!isCurrentUser && !isOwner && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMember(member)}
                              disabled={removeMemberMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              {t('members.remove')}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Remove Member Confirmation Dialog */}
      <AlertDialog
        open={!!memberToRemove}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('members.confirmRemove.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('members.confirmRemove.description').replace(
                '{email}',
                memberToRemove?.memberName || ''
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMemberToRemove(null)}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={removeMemberMutation.isPending}
            >
              {removeMemberMutation.isPending ? t('members.removing') : t('members.remove')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
