import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { setUnauthorizedHandler } from "../services/api";
import { getCurrentAdmin, loginAdmin, logoutAdmin } from "../services/adminAuthService";
import {
  clearAdminAccessToken,
  getAdminAccessToken,
  setAdminAccessToken,
} from "../services/authStorage";
import type { AuthenticatedAdmin } from "../types/admin";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  admin: AuthenticatedAdmin | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AuthenticatedAdmin | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const navigate = useNavigate();
  const location = useLocation();

  const handleUnauthenticated = useCallback(() => {
    clearAdminAccessToken();
    setAdmin(null);
    setStatus("unauthenticated");

    if (window.location.pathname.startsWith("/admin") && window.location.pathname !== "/admin/login") {
      navigate("/admin/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    setUnauthorizedHandler(handleUnauthenticated);

    return () => setUnauthorizedHandler(null);
  }, [handleUnauthenticated]);

  useEffect(() => {
    let isMounted = true;

    async function loadCurrentAdmin() {
      const token = getAdminAccessToken();

      if (!token) {
        if (isMounted) {
          setStatus("unauthenticated");
        }
        return;
      }

      try {
        const currentAdmin = await getCurrentAdmin();

        if (isMounted) {
          setAdmin(currentAdmin);
          setStatus("authenticated");
        }
      } catch {
        if (isMounted) {
          clearAdminAccessToken();
          setAdmin(null);
          setStatus("unauthenticated");
        }
      }
    }

    void loadCurrentAdmin();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (credentials: { email: string; password: string }) => {
    const loginResponse = await loginAdmin(credentials);
    setAdminAccessToken(loginResponse.accessToken);
    setAdmin(loginResponse.admin);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    try {
      if (getAdminAccessToken()) {
        await logoutAdmin();
      }
    } catch {
      // Stateless JWT logout still completes locally if the server rejects the token.
    } finally {
      clearAdminAccessToken();
      setAdmin(null);
      setStatus("unauthenticated");
      navigate("/admin/login", { replace: true });
    }
  }, [navigate]);

  const value = useMemo<AuthContextValue>(
    () => ({
      admin,
      status,
      isAuthenticated: status === "authenticated" && admin !== null,
      login,
      logout,
    }),
    [admin, login, logout, status],
  );

  useEffect(() => {
    if (status === "authenticated" && location.pathname === "/admin/login") {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [location.pathname, navigate, status]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
