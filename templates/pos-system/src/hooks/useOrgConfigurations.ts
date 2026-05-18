import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { crossAppApi, crossAppOrgPath } from "@/lib/api";
import type {
  OrgConfiguration,
  ValidateCredentialsResponse,
  NotificationsFormState,
} from "@/types/orgConfigurations";

export function useOrgConfigurations(orgId: string | undefined) {
  return useQuery({
    queryKey: ["org-configurations", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      try {
        return await crossAppApi.get<OrgConfiguration>(crossAppOrgPath(orgId!, "/configurations"));
      } catch {
        // 404 means no configuration saved yet — treat as empty, not error
        return null;
      }
    },
  });
}

export function useValidateCredentials(orgId: string) {
  return useMutation({
    mutationFn: (data: { username: string; password: string }) =>
      crossAppApi.post<ValidateCredentialsResponse>(crossAppOrgPath(orgId, "/credentials"), data),
  });
}

export function useSaveOrgConfigurations(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) =>
      crossAppApi.put<OrgConfiguration>(crossAppOrgPath(orgId, "/configurations"), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-configurations", orgId] });
    },
  });
}

export function useSaveNotifications(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: NotificationsFormState) =>
      crossAppApi.patch<OrgConfiguration>(crossAppOrgPath(orgId, "/configurations/notifications"), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-configurations", orgId] });
    },
  });
}
