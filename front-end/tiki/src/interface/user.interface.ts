// src/interface/user.interface.ts
export interface User {
  id: number | string;
  email: string;
  password?: string;
  fullName?: string; // Sử dụng lại fullName
  role?: 'admin' | 'customer' | 'user'; // Cho phép cả 3 giá trị
  // Các trường khác có thể có
  phone?: string;
  address?: string;
  createdAt?: string; // Dữ liệu thật có thể không có, nên để optional
}