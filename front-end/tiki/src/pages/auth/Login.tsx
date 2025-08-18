import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface LoginForm {
  email: string;
  password: string;
}

export default function Login() {
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

  const onSubmit = async (values: LoginForm) => {
    try {
      await login(values.email, values.password);
    } catch (e: any) {
      toast.error(e.message || "Đăng nhập thất bại");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-2xl">Đăng nhập quản trị</h1>
          {location?.state?.from && (
            <div className="alert alert-info text-sm">
              Bạn cần đăng nhập bằng tài khoản admin để truy cập trang quản trị.
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Email</span></label>
              <input type="email" className="input input-bordered" placeholder="admin@example.com"
                {...register("email", { required: "Vui lòng nhập email" })} />
              {errors.email && <span className="text-error text-sm mt-1">{errors.email.message}</span>}
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Mật khẩu</span></label>
              <input type="password" className="input input-bordered" placeholder="••••••••"
                {...register("password", { required: "Vui lòng nhập mật khẩu" })} />
              {errors.password && <span className="text-error text-sm mt-1">{errors.password.message}</span>}
            </div>
            <button className="btn btn-primary w-full" disabled={isSubmitting}>
              {isSubmitting && <span className="loading loading-spinner" />} Đăng nhập
            </button>
          </form>
          <p className="text-xs opacity-70 mt-2">Hệ thống chỉ cho phép tài khoản có role "admin" truy cập trang quản trị.</p>
          <div className="mt-2 text-sm">
            <Link to="/" className="link">Quay về trang chủ</Link>
          </div>
        </div>
      </div>
    </div>
  );
}