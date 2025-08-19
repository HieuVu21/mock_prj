// src/pages/auth/Login.tsx

import { useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import { KeyRound, Loader2 } from 'lucide-react';

// Import các component UI mới
import { Button } from "@/component/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/component/ui/card";
import { Input } from "@/component/ui/input";
import { Label } from "@/component/ui/label";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>();
  const location = useLocation() as any;
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Đăng nhập Admin | BookStore";
    
    // Kiểm tra nếu đã đăng nhập thì redirect
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token');
      const auth = localStorage.getItem('auth');
      
      if (token && auth) {
        try {
          const authData = JSON.parse(auth);
          if (authData.user && authData.user.role) {
            // Đã đăng nhập, redirect theo role
            if (authData.user.role === 'admin') {
              navigate('/admin', { replace: true });
            } else {
              navigate('/', { replace: true });
            }
            return;
          }
        } catch (error) {
          // Token không hợp lệ, xóa và hiển thị form
          localStorage.removeItem('token');
          localStorage.removeItem('auth');
        }
      }
    };
    
    checkAuthStatus();
  }, [navigate]);

  const onSubmit: SubmitHandler<LoginForm> = async (values) => {
    try {
      await login(values.email, values.password);
    } catch (e: any) {
      toast.error(e.message || "Email hoặc mật khẩu không chính xác.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm animate-fade-in">
        <CardHeader className="text-center">
          <div className="mx-auto p-3 rounded-lg bg-gradient-primary/10 w-fit mb-4">
            <KeyRound className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Đăng nhập Quản trị</CardTitle>
          <CardDescription>Sử dụng tài khoản admin để truy cập hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          {location?.state?.from && (
            <div className="mb-4 p-3 bg-secondary border border-border rounded-md text-center text-sm text-secondary-foreground">
              Bạn cần đăng nhập để truy cập trang này.
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  {...register("email", { required: "Vui lòng nhập email" })}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password", { required: "Vui lòng nhập mật khẩu" })}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>
              <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  'Đăng nhập'
                )}
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            <Link to="/" className="underline text-muted-foreground hover:text-primary">
              Quay về trang chủ
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}