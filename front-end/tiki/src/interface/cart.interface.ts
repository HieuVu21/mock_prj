export interface CartItem {
	id: string;
	bookId: string;
	name: string;
	price: number;
	originalPrice?: number;
	quantity: number;
	image: string;
	seller: {
		id: number;
		name: string;
		logo?: string;
	};
}

export interface Cart {
	id: string;
	userId: string;
	items: CartItem[];
	totalItems: number;
	subtotal: number;
	totalDiscount: number;
	total: number;
	createdAt: string;
	updatedAt: string;
}

export interface OrderItem {
	id: string;
	bookId: string;
	name: string;
	price: number;
	originalPrice?: number;
	quantity: number;
	image: string;
	seller: {
		id: number;
		name: string;
		logo?: string;
	};
}

export interface Order {
	id: string;
	userId: string;
	items: OrderItem[];
	totalItems: number;
	subtotal: number;
	totalDiscount: number;
	shippingFee: number;
	total: number;
	status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
	paymentMethod: 'cod' | 'bank_transfer' | 'credit_card' | 'momo' | 'vnpay' | 'zalopay';
	shippingMethod: 'standard' | 'express' | 'same_day';
	shippingAddress: {
		fullName: string;
		phone: string;
		address: string;
		city: string;
		district: string;
		ward: string;
	};
	createdAt: string;
	updatedAt: string;
	estimatedDelivery?: string;
}
