import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  signIn,
  signOut,
  getCurrentUser,
  fetchAuthSession,
} from "aws-amplify/auth";
import "../lib/amplify";
import { api, userPath } from "../lib/api";

export type UserRole = "cajero" | "gerente" | "supervisor";

interface OrgInfo {
  id: string;
  name: string;
  templateName: string;
}

interface AuthUser {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  org: OrgInfo | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  selectOrg: (org: OrgInfo) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [org, setOrg] = useState<OrgInfo | null>(() => {
    const stored = sessionStorage.getItem("selectedOrg");
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Restore session on mount
  useEffect(() => {
    (async () => {
      try {
        const cognitoUser = await getCurrentUser();
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken;
        if (!token) throw new Error("No token");

        const profile = await api.get<AuthUser>(
          userPath(cognitoUser.userId, "/profile")
        );
        setUser({ ...profile, userId: cognitoUser.userId });
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await signIn({ username: email, password });
      if (result.isSignedIn) {
        const cognitoUser = await getCurrentUser();
        const profile = await api.get<AuthUser>(
          userPath(cognitoUser.userId, "/profile")
        );
        setUser({ ...profile, userId: cognitoUser.userId });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al iniciar sesión";
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut();
    setUser(null);
    setOrg(null);
    sessionStorage.removeItem("selectedOrg");
  }, []);

  const selectOrg = useCallback((selectedOrg: OrgInfo) => {
    setOrg(selectedOrg);
    sessionStorage.setItem("selectedOrg", JSON.stringify(selectedOrg));
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, org, isLoading, error, login, logout, selectOrg }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
