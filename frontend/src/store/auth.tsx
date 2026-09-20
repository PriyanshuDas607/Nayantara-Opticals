import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";

export type UserRole = "SUPER_ADMIN" | "OWNER" | "CUSTOMER";

export interface UserProfile {
  id: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  avatarUrl?: string | null;
  customerProfile?: {
    fullName: string;
    whatsappOptIn?: boolean;
  };
  ownerProfile?: {
    fullName: string;
    storeId?: string;
    store?: {
      id: string;
      name: string;
    };
  };
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  isStrictOwner: boolean;
  isLoading: boolean;
  login: (token: string, user: UserProfile, refreshToken?: string) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = useCallback((newToken: string, newUser: UserProfile, refreshToken?: string) => {
    setToken(newToken);
    setUser(newUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("nayantara_access_token", newToken);
      if (refreshToken) {
        localStorage.setItem("nayantara_refresh_token", refreshToken);
      }
      localStorage.setItem("nayantara_user", JSON.stringify(newUser));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem("nayantara_refresh_token");
      if (refreshToken) {
        await apiRequest("/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch {
      // Ignore network errors on logout
    }

    setToken(null);
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("nayantara_access_token");
      localStorage.removeItem("nayantara_refresh_token");
      localStorage.removeItem("nayantara_user");
    }
    toast.success("Logged out successfully");
  }, []);

  const refreshProfile = useCallback(async () => {
    const storedToken = localStorage.getItem("nayantara_access_token");
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    const res = await apiRequest<{ data: UserProfile }>("/auth/me", { token: storedToken });
    if (res.success && res.data) {
      setUser(res.data as unknown as UserProfile);
      setToken(storedToken);
    } else {
      // Try refresh token if access expired
      const storedRefreshToken = localStorage.getItem("nayantara_refresh_token");
      if (storedRefreshToken) {
        const refreshRes = await apiRequest<{
          tokens: { accessToken: string; refreshToken: string };
          user: UserProfile;
        }>("/auth/refresh", {
          method: "POST",
          body: JSON.stringify({ refreshToken: storedRefreshToken }),
        });

        if (refreshRes.success && refreshRes.data) {
          login(
            refreshRes.data.tokens.accessToken,
            refreshRes.data.user,
            refreshRes.data.tokens.refreshToken
          );
        } else {
          setToken(null);
          setUser(null);
          localStorage.removeItem("nayantara_access_token");
          localStorage.removeItem("nayantara_refresh_token");
        }
      }
    }
    setIsLoading(false);
  }, [login]);

  useEffect(() => {
    // Rehydrate state on mount
    const savedUser = localStorage.getItem("nayantara_user");
    const savedToken = localStorage.getItem("nayantara_access_token");
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch {
        // bad json
      }
    }
    refreshProfile();
  }, [refreshProfile]);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === "SUPER_ADMIN",
    isOwner: user?.role === "OWNER" || user?.role === "SUPER_ADMIN",
    isStrictOwner: user?.role === "OWNER",
    isLoading,
    login,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
