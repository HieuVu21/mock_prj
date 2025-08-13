export interface User {
  id: number;
  email: string;
  password?: string;
  role: 'user' | 'admin';
}

export interface Product {
  id: string;
  name: string;
  image?: string;
  originalPrice: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  products: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: Order[];
} 