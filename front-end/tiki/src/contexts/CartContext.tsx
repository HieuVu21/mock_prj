import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { toast } from 'react-toastify';
import { type Books, type CartItem } from '../interface/book.interface';
import { getCart, addToCart as addToCartApi, updateCartItem, deleteCartItem } from '../services/api';

// Định nghĩa kiểu cho Context
interface CartContextType {
  cartItems: CartItem[];
  loading: boolean;
  addToCart: (book: Books, quantity: number) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  toggleItemSelected: (cartItemId: string) => void;
  toggleSellerSelected: (sellerId: number, selected: boolean) => void;
  clearCart: () => void;
  totalItems: number;
}

// Tạo Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Tạo Provider Component
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      setCartItems([]);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching cart with token:', token.substring(0, 20) + '...');
      const { data } = await getCart();
      console.log('Cart data received:', data);
      
      // Map cart items and ensure we have the correct cartItemId
      const mappedItems = data.items.map(item => ({
        ...item,
        selected: true,
        // Ensure cartItemId is properly set - it should be the item ID from the cart
        cartItemId: item.cartItemId // Fallback to item.id if cartItemId is not present
      }));
      
      console.log('Mapped cart items:', mappedItems);
      setCartItems(mappedItems);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      // Only clear cart if it's not an auth error (token might be temporarily invalid)
      if (error instanceof Error && error.message?.includes('hết hạn')) {
        setCartItems([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced fetch cart to avoid multiple rapid calls
  const debouncedFetchCart = useCallback(() => {
    const timeoutId = setTimeout(fetchCart, 100);
    return () => clearTimeout(timeoutId);
  }, [fetchCart]);

  useEffect(() => {
    // Delay initial fetch to ensure token is saved
    const initialFetch = setTimeout(fetchCart, 200);
    
    const handleAuthChange = () => {
      console.log('Auth change detected');
      // Delay fetch to ensure token is properly saved
      setTimeout(fetchCart, 100);
    };

    window.addEventListener('auth-change', handleAuthChange);
    
    return () => {
      clearTimeout(initialFetch);
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, [fetchCart]);

  const addToCart = async (book: Books, quantity: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      return;
    }

    // Find item by book ID, not cart item ID
    const itemInCart = cartItems.find(item => item.id === book.id);

    try {
      console.log('Adding to cart:', { bookId: book.id, quantity });
      
      if (itemInCart && itemInCart.cartItemId) {
        console.log('Updating existing item with cartItemId:', itemInCart.cartItemId);
        await updateCartItem(itemInCart.cartItemId, itemInCart.quantity + quantity);
      } else {
        console.log('Adding new item to cart');
        await addToCartApi({ bookId: book.id, quantity });
      }
      
      toast.success('Đã thêm vào giỏ hàng');
      await fetchCart();
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Có lỗi xảy ra khi thêm vào giỏ hàng');
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    console.log('Updating cart item quantity:', { cartItemId, quantity });

    try {
      await updateCartItem(cartItemId, quantity);
      await fetchCart();
    } catch (error) {
      console.error('Failed to update cart item:', error);
      console.error('CartItemId used:', cartItemId);
      toast.error('Có lỗi xảy ra khi cập nhật giỏ hàng');
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    console.log('Removing cart item:', { cartItemId });

    try {
      await deleteCartItem(cartItemId);
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
      await fetchCart();
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      console.error('CartItemId used:', cartItemId);
      toast.error('Có lỗi xảy ra khi xóa sản phẩm');
    }
  };

  const toggleItemSelected = (cartItemId: string) => {
    setCartItems(prevItems =>
      prevItems.map(item => (item.cartItemId === cartItemId ? { ...item, selected: !item.selected } : item))
    );
  };

  const toggleSellerSelected = (sellerId: number, selected: boolean) => {
    setCartItems(prevItems =>
      prevItems.map(item => (item.current_seller?.id === sellerId ? { ...item, selected } : item))
    );
  };

  const clearCart = () => {
    // In a real app, you'd call an API to clear the cart on the server.
    setCartItems([]);
    toast.success('Giỏ hàng đã được xóa');
  };

  const value = {
    cartItems,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    toggleItemSelected,
    toggleSellerSelected,
    clearCart,
    totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Tạo custom hook để sử dụng context dễ dàng hơn
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};