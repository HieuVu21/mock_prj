export interface User {
  id: number;
  email: string;
  password: string;
  confirmPassword?: string;
  role: string;
  address?: string;
  birthDay?: string;
  fullName?: string;
  gender?: string;
  nickName?: string;
  phone?: string;
}
