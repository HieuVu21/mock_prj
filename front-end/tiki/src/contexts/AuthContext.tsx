import { createContext, useContext, useEffect, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { registerAuthInterceptor } from '../lib/auth-interceptor';

// Tạo Context
const AuthContext = createContext<{} | undefined>(undefined);

// Tạo Provider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  
  useEffect(() => {
    // Đăng ký hàm xử lý khi token hết hạn
    const handleAuthError = () => {
      console.log('Auth error detected - logging out user');
      
      // Xóa token
      localStorage.removeItem('token');
      
      // Hiển thị thông báo
      toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      
      // Trigger auth change event để các component khác cập nhật
      window.dispatchEvent(new Event('auth-change'));
      
      // Chuyển hướng về trang chủ sau m��t chút delay
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    };

    registerAuthInterceptor(handleAuthError);
  }, []);

  return (
    <AuthContext.Provider value={{}}>
      {children}
    </AuthContext.Provider>
  );
};

// Tạo custom hook để sử dụng context dễ dàng hơn
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};