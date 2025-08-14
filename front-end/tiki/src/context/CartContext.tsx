import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
// import { CartItem } from '../interface/cart.interface';
import type { CartItem } from "../interface/cart.interface";


interface CartState {
	items: CartItem[];
	totalItems: number;
	subtotal: number;
	totalDiscount: number;
	total: number;
	isLoading: boolean;
}

type CartAction =
	| { type: 'ADD_ITEM'; payload: CartItem }
	| { type: 'REMOVE_ITEM'; payload: string }
	| { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
	| { type: 'CLEAR_CART' }
	| { type: 'SET_LOADING'; payload: boolean }
	| { type: 'LOAD_CART'; payload: CartItem[] };

const initialState: CartState = {
	items: [],
	totalItems: 0,
	subtotal: 0,
	totalDiscount: 0,
	total: 0,
	isLoading: false,
};

const calculateTotals = (state: CartState): CartState => {
	const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
	const subtotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
	const totalDiscount = state.items.reduce((sum, item) => {
		if (item.originalPrice && item.originalPrice > item.price) {
			return sum + ((item.originalPrice - item.price) * item.quantity);
		}
		return sum;
	}, 0);
	const total = subtotal;

	return { ...state, totalItems, subtotal, totalDiscount, total };
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
	switch (action.type) {
		case 'ADD_ITEM': {
			const existingItem = state.items.find(item => item.bookId === action.payload.bookId);
			if (existingItem) {
				const updatedItems = state.items.map(item =>
					item.bookId === action.payload.bookId
						? { ...item, quantity: item.quantity + action.payload.quantity }
						: item
				);
				return calculateTotals({ ...state, items: updatedItems });
			}
			return calculateTotals({ ...state, items: [...state.items, action.payload] });
		}
		case 'REMOVE_ITEM': {
			const updatedItems = state.items.filter(item => item.id !== action.payload);
			return calculateTotals({ ...state, items: updatedItems });
		}
		case 'UPDATE_QUANTITY': {
			const updatedItems = state.items.map(item =>
				item.id === action.payload.id
					? { ...item, quantity: Math.max(1, action.payload.quantity) }
					: item
			);
			return calculateTotals({ ...state, items: updatedItems });
		}
		case 'CLEAR_CART':
			return { ...initialState };
		case 'SET_LOADING':
			return { ...state, isLoading: action.payload };
		case 'LOAD_CART':
			return calculateTotals({ ...state, items: action.payload });
		default:
			return state;
	}
};

interface CartContextType {
	state: CartState;
	addToCart: (item: Omit<CartItem, 'id'>) => void;
	removeFromCart: (id: string) => void;
	updateQuantity: (id: string, quantity: number) => void;
	clearCart: () => void;
	getCartItem: (bookId: string) => CartItem | undefined;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
	const context = useContext(CartContext);
	if (!context) {
		throw new Error('useCart must be used within a CartProvider');
	}
	return context;
};

interface CartProviderProps {
	children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
	const [state, dispatch] = useReducer(cartReducer, initialState);

	useEffect(() => {
		const saved = localStorage.getItem('tiki-cart');
		if (saved) {
			try {
				dispatch({ type: 'LOAD_CART', payload: JSON.parse(saved) });
			} catch (e) {
				console.error('Failed to parse saved cart', e);
			}
		}
	}, []);

	useEffect(() => {
		localStorage.setItem('tiki-cart', JSON.stringify(state.items));
	}, [state.items]);

	const addToCart = (itemData: Omit<CartItem, 'id'>) => {
		const newItem: CartItem = { ...itemData, id: `${itemData.bookId}-${Date.now()}` };
		dispatch({ type: 'ADD_ITEM', payload: newItem });
	};

	const removeFromCart = (id: string) => dispatch({ type: 'REMOVE_ITEM', payload: id });
	const updateQuantity = (id: string, quantity: number) => dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
	const clearCart = () => dispatch({ type: 'CLEAR_CART' });
	const getCartItem = (bookId: string) => state.items.find(i => i.bookId === bookId);

	return (
		<CartContext.Provider value={{ state, addToCart, removeFromCart, updateQuantity, clearCart, getCartItem }}>
			{children}
		</CartContext.Provider>
	);
};
