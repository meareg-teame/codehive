import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  legacyAuth,
  setStoredAccessToken,
  isUnauthorizedError,
} from "@/api";
import type { AuthUser } from "@/types";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<string>;
  guestLogin: () => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  updateProfile: (name: string, photoUrl?: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const FALLBACK_USER: AuthUser = {
  name: "Guest User",
  email: "local@codecollab.dev",
  photoUrl: "",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await legacyAuth.getUserInfo();
      setUser(userData);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        await refreshUser();
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      await legacyAuth.login(email, password);
      await refreshUser();
    },
    [refreshUser]
  );

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      const result = await legacyAuth.signup(name, email, password);
      return result.msg;
    },
    []
  );

  const guestLogin = useCallback(async () => {
    await legacyAuth.guestLogin();
    setUser(FALLBACK_USER);
  }, []);

  const logout = useCallback(async () => {
    try {
      await legacyAuth.logout();
    } finally {
      setStoredAccessToken(null);
      setUser(null);
    }
  }, []);

  const changePassword = useCallback(
    async (oldPassword: string, newPassword: string) => {
      await legacyAuth.changePassword(oldPassword, newPassword);
    },
    []
  );

  const updateProfile = useCallback(
    async (name: string, photoUrl?: string) => {
      await legacyAuth.updateProfile({ name, photoUrl });
      await refreshUser();
    },
    [refreshUser]
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      refreshUser,
      login,
      signup,
      guestLogin,
      logout,
      changePassword,
      updateProfile,
    }),
    [user, loading, refreshUser, login, signup, guestLogin, logout, changePassword, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

export function useAuthOptional() {
  return useContext(AuthContext);
}

export { isUnauthorizedError };
