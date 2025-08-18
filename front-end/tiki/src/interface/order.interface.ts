import type { User } from './user.interface';
import type { Books } from './book.interface';

export interface OrderItem {
  book: Partial<Books>; // Chỉ cần một vài thông tin của sách
  quantity: number;
}

export interface Order {
  id: number | string;
  userId?: number | string;
  user?: Partial<User>; // Thông tin người dùng có thể được đính kèm
  customerName?: string; // Hoặc chỉ có tên
  items: OrderItem[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
  shippingAddress: string;
  paymentMethod: string;
  createdAt?: string;
  updatedAt?: string;
  // Additional fields for detailed order view
  notificationTime?: string;
  deliveryMethod?: string;
  estimatedDelivery?: string;
  carrier?: string;
  shippingFee?: number;
}