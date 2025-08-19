// src/pages/auth/Login.tsx

import { useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import { Link, useLocation } from "react-router-dom";
import { KeyRound, Loader2 } from 'lucide-react';

// Import các component UI mới
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/admin";

  useEffect(() => {
    document.title = "Đăng nhập Admin | BookStore";
  }, []);

  const onSubmit: SubmitHandler<LoginForm> = async (values) => {
    try {
      await login(values.email, values.password);
      toast.success("Đăng nhập thành công!");
      // Sau khi login thành công, điều hướng đến trang admin hoặc trang người dùng định đến
      // useNavigate đã được xử lý bên trong hàm login của AuthContext
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