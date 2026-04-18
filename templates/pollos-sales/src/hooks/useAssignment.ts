import { useQuery } from "@tanstack/react-query";
import { api, orgPath } from "../lib/api";
import { db } from "../lib/db";
import { useAuthContext } from "../contexts/AuthContext";

interface Assignment {
  id: string;
  standId: string;
  standName: string;
  context: "gradas" | "mesa" | "caja";
  sessionId: string;
  sessionName: string;
}

export function useAssignment() {
  const { user, org } = useAuthContext();

  return useQuery({
    queryKey: ["assignment", user?.userId, org?.id],
    enabled: !!user && !!org,
    queryFn: async () => {
      try {
        const data = await api.get<Assignment>(
          orgPath(user!.userId, org!.id, "/assignments/active")
        );
        // Cache in IndexedDB for offline access
        await db.assignments.where({ userId: user!.userId, orgId: org!.id }).delete();
        await db.assignments.add({
          assignmentId: data.id,
          orgId: org!.id,
          userId: user!.userId,
          standId: data.standId,
          standName: data.standName,
          context: data.context,
          sessionId: data.sessionId,
          sessionName: data.sessionName,
          fetchedAt: Date.now(),
        });
        return data;
      } catch {
        // Fallback to IndexedDB
        const cached = await db.assignments
          .where({ userId: user!.userId, orgId: org!.id })
          .first();
        if (cached) {
          return {
            id: cached.assignmentId,
            standId: cached.standId,
            standName: cached.standName,
            context: cached.context,
            sessionId: cached.sessionId,
            sessionName: cached.sessionName,
          } as Assignment;
        }
        throw new Error("No hay asignación activa");
      }
    },
  });
}
