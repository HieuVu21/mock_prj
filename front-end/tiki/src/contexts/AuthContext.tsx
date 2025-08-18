import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { registerAuthInterceptor } from "@/lib/auth-interceptor"; 
import toast from "react-hot-toast";

export type Role = "admin" | "user";
export interface AuthUser {
  id: number | string;
  email: string;
  role: Role;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const API_URL = "http://localhost:3000"; // Adjust if your API runs elsewhere

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem("auth");
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { token: string; user: AuthUser };
        setUser(parsed.user);
        setToken(parsed.token);
      } catch (e) {
        console.warn("Invalid auth cache", e);
        localStorage.removeItem("auth");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("Đăng nhập thất bại");
      const data = (await res.json()) as { accessToken: string; user: AuthUser };
      setToken(data.accessToken);
      setUser(data.user);
      localStorage.setItem("auth", JSON.stringify({ token: data.accessToken, user: data.user }));
      // Đồng bộ với phần còn lại của app (api.ts, Header, CartContext)
      localStorage.setItem("token", data.accessToken);
      window.dispatchEvent(new Event("auth-change"));

      // Điều hướng theo vai trò
      if ((data.user?.role ?? "user") === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
      toast.success("Đăng nhập thành công!");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Lưu path hiện tại trước khi clear state
    const currentPath = window.location.pathname;
    
    // Clear state và localStorage
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth");
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("auth-change"));
    
    // Nếu đang ở trang admin thì về trang chủ hiển thị sản phẩm
    if (currentPath.startsWith('/admin')) {
      navigate("/", { replace: true });
    }
  };

  // Nếu token hết hạn ở các trang public, chỉ clear state thay vì redirect
  const handleAuthError = () => {
    try {
      setUser(null);
      setToken(null);
      localStorage.removeItem("auth");
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("auth-change"));

      const path = window.location.pathname;
      // Chỉ chuyển hướng nếu đang ở khu vực yêu cầu quyền
      if (path.startsWith("/admin")) {
        navigate("/login", { replace: true });
      }
      // Ở trang public (/, /books, /cart, ...): không redirect, để người dùng tiếp tục xem
    } catch {
      // no-op
    }
  };

  useEffect(() => {
    registerAuthInterceptor(handleAuthError);
  }, [navigate]);
  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    loading,
    isAdmin: (user?.role ?? "user") === "admin",
    login,
    logout,
  }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
