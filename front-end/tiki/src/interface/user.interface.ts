export interface User {
  id: number | string;
  email: string;
  password?: string; // Mật khẩu là optional
  fullName?: string; // Đổi 'name' thành 'fullName' và cho phép optional
  role?: 'admin' | 'customer' | 'user'; // Thêm 'user' và cho phép optional
  status?: 'active' | 'inactive' | 'banned';
  createdAt?: string;
  address?: string;
  phone?: string;
}