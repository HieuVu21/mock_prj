import type { User } from './user.interface';
import type { Books } from './book.interface';

export interface OrderItem {
  book: Partial<Books>; // Chỉ cần một vài thông tin của sách
  quantity: number;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string | number;
  userId: string; // Added to track which user created the order
  user?: Partial<User>; // Thông tin người dùng có thể được đính kèm
  customerName?: string; // Hoặc chỉ có tên
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  shippingAddress: string;
  paymentMethod: string;
  createdAt?: string;
  updatedAt?: string;
}