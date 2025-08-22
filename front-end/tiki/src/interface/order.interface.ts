import type { User } from './user.interface';
import type { Books } from './book.interface';

export interface OrderItem {
  book: Partial<Books>; // Chỉ cần một vài thông tin của sách
  quantity: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled' | 'shipped' | 'out_for_delivery' | 'returned' | 'failed';

export interface Order {
  id: number | string;
  userId?: number | string;
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