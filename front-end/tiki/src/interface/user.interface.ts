export interface User {
  id: number | string;
  email: string;
  password?: string; // Mật khẩu là optional
  name?: string; // Tên gốc từ register
  fullName?: string; // Tên đầy đủ có thể cập nhật
  nickName?: string; // Nickname
  role?: 'admin' | 'customer' | 'user'; // Thêm 'user' và cho phép optional
  status?: 'active' | 'inactive' | 'banned';
  createdAt?: string;
  updatedAt?: string;
  address?: string;
  phone?: string;
  birthDay?: string; // Ngày sinh theo format YYYY-MM-DD
  gender?: string; // Giới tính
  nationality?: string; // Quốc tịch
}