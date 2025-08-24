import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTag, FiCreditCard, FiTrash2 } from 'react-icons/fi';
import Header from '../component/Header';
import Footer from '../component/Footer';
import { useCart } from '../contexts/CartContext';
import { createOrder } from '../services/api';
import * as Checkbox from '@radix-ui/react-checkbox';
import { CheckIcon } from '@radix-ui/react-icons';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Toggle select all items
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
    } else {
      const allItemIds = new Set(cartItems.map(item => item.cartItemId));
      setSelectedItems(allItemIds);
    }
    setSelectAll(!selectAll);
  };

  // Toggle single item selection
  const toggleItemSelection = (itemId: string) => {
    const newSelectedItems = new Set(selectedItems);
    if (newSelectedItems.has(itemId)) {
      newSelectedItems.delete(itemId);
    } else {
      newSelectedItems.add(itemId);
    }
    setSelectedItems(newSelectedItems);
    setSelectAll(newSelectedItems.size === cartItems.length && cartItems.length > 0);
  };

  // Update selectAll state when cart items change
  useEffect(() => {
    setSelectAll(selectedItems.size === cartItems.length && cartItems.length > 0);
  }, [cartItems.length, selectedItems.size]);
  const navigate = useNavigate();

  const subtotal = cartItems.reduce((sum, item) => sum + item.list_price * item.quantity, 0);
  const shippingFee = 25000;
  const discount = 59000; // Giảm giá trực tiếp
  const voucherDiscount = 25000;
  const total = subtotal + shippingFee - discount - voucherDiscount;

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    try {
      const items = cartItems.map((it) => ({ 
        book: { 
          id: it.id, 
          name: it.name, 
          images: it.images, 
          list_price: it.list_price 
        }, 
        quantity: it.quantity 
      }));
      
      const { data: order } = await createOrder({
        id: `order_${Date.now()}`,
        items,
        totalPrice: total,
        status: 'confirmed',
        shippingAddress: 'Văn phòng: số 17 Duy Tân, Phường Dịch Vọng, Quận Cầu Giấy, Hà Nội',
        paymentMethod: 'Thanh toán tiền mặt',
        createdAt: new Date().toISOString(),
      });
      
      clearCart();
      
      // Pass the cart items to the confirmation page
      navigate('/confirm', { 
        state: { 
          orderId: order.id, 
          total: order.totalPrice, 
          paymentMethod: order.paymentMethod,
          items: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.list_price,
            quantity: item.quantity,
            image: item.images?.[0]?.thumbnail_url || 'https://via.placeholder.com/200'
          }))
        } 
      });
    } catch (e) {
      console.error('Error creating order:', e);
      // Add error handling here (e.g., show error toast/message)
    }
  };

  return (
    <>
      <Header />
      <div className="bg-gray-100 min-h-[calc(100vh-200px)] py-6">
        <div className="container mx-auto px-4">
          <h1 className='text-xl font-bold mb-4'>GIỎ HÀNG</h1>
          {cartItems.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <img 
                src="/emptycart.png" 
                alt="Giỏ hàng trống" 
                className="w-40 h-40 mx-auto mb-6"
              />
              <h2 className="text-lg font-semibold mb-2">Giỏ hàng trống</h2>
              <p className="text-gray-500 mb-6">Bạn tham khảo thêm các sản phẩm được Tiki gợi ý bên dưới nhé!</p>
              <Link 
                to="/"
                className="bg-[#0d5cb6] text-white px-8 py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-6">
              {/* Left Column */}
              <div className="col-span-8">
                <div className="bg-white p-3 rounded-sm shadow-sm grid grid-cols-12 mb-4 items-center text-sm font-medium text-gray-600 border-b">
                  <div className='col-span-5 flex items-center space-x-3'>
                    <Checkbox.Root 
                      id="select-all"
                      checked={selectAll}
                      onCheckedChange={toggleSelectAll}
                      className="w-5 h-5 rounded border border-gray-300 flex items-center justify-center hover:border-blue-500 transition-colors"
                    >
                      <Checkbox.Indicator className="text-blue-600">
                        <CheckIcon className="w-3.5 h-3.5" />
                      </Checkbox.Indicator>
                    </Checkbox.Root>
                    <label htmlFor="select-all" className="select-none cursor-pointer font-medium">
                      Tất cả ({selectedItems.size} sản phẩm)
                    </label>
                  </div>
                  <div className='col-span-2 text-center'>Đơn giá</div>
                  <div className='col-span-2 text-center'>Số lượng</div>
                  <div className='col-span-2 text-right pr-4'>Thành tiền</div>
                  <div className='col-span-1 flex justify-end'>
                    <FiTrash2 className="text-gray-400 hover:text-red-500 cursor-pointer" size={18} />
                  </div>
                </div>

                {/* Cart Items */}
                <div className="bg-white rounded-lg shadow-sm">
                  {cartItems.map(item => (
                    <div key={item.id} className="grid grid-cols-12 items-center p-4 border-b hover:bg-gray-50 transition-colors">
                      <div className="col-span-5 flex items-center space-x-3">
                        <Checkbox.Root 
                          id={`item-${item.id}`}
                          checked={selectedItems.has(item.cartItemId)}
                          onCheckedChange={() => toggleItemSelection(item.cartItemId)}
                          className="w-5 h-5 rounded border border-gray-300 flex-shrink-0 flex items-center justify-center hover:border-blue-500 transition-colors"
                        >
                          <Checkbox.Indicator className="text-blue-600">
                            <CheckIcon className="w-3.5 h-3.5" />
                          </Checkbox.Indicator>
                        </Checkbox.Root>
                        <div className="w-16 h-16 flex-shrink-0 bg-white overflow-hidden flex items-center justify-center">
                          <img 
                            src={item.images?.[0]?.thumbnail_url || 'https://via.placeholder.com/60'} 
                            alt={item.name} 
                            className="w-full h-full object-contain p-1" 
                          />
                        </div>
                        <p className="text-sm text-gray-800 line-clamp-2 leading-tight">{item.name}</p>
                      </div>
                      <div className="col-span-2 text-center">
                        <div className="text-red-600 font-medium">{item.list_price.toLocaleString('vi-VN')}đ</div>
                        {item.original_price > item.list_price && (
                          <div className="text-gray-400 text-xs line-through mt-1">
                            {item.original_price.toLocaleString('vi-VN')}đ
                          </div>
                        )}
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center border border-gray-300 rounded overflow-hidden w-fit mx-auto">
                          <button 
                            className="px-2.5 py-1 text-sm hover:bg-gray-50 text-gray-600 transition-colors"
                            onClick={(e) => {
                              e.preventDefault();
                              updateQuantity(item.cartItemId, Math.max(1, item.quantity - 1));
                            }}
                          >
                            −
                          </button>
                          <span className="px-3 py-1 border-l border-r border-gray-300 text-sm w-10 text-center">
                            {item.quantity}
                          </span>
                          <button 
                            className="px-2.5 py-1 text-sm hover:bg-gray-50 text-gray-600 transition-colors"
                            onClick={(e) => {
                              e.preventDefault();
                              updateQuantity(item.cartItemId, item.quantity + 1);
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="col-span-2 text-right pr-4">
                        <div className="text-red-600 font-medium">
                          {(item.list_price * item.quantity).toLocaleString('vi-VN')}đ
                        </div>
                    
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) {
                              removeFromCart(item.cartItemId);
                            }
                          }} 
                          className="text-gray-400 hover:text-red-500 transition-colors p-1 -mr-2"
                          title="Xóa sản phẩm"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                
              </div>

              {/* Right Column */}
              <div className="col-span-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tổng tiền hàng</span>
                      <span className="font-medium">{subtotal.toLocaleString('vi-VN')}đ</span>
                    </div>
                    
                    <div className="flex justify-between ">
                      <span className='text-black'>Giảm giá trực tiếp</span>
                      <span className='text-green-600'>-{total.toLocaleString('vi-VN')}đ</span>
                    </div>
                    
                  </div>
                  <div className="border-t border-gray-200 my-4"></div>
                  <div className="flex justify-between mb-4">
                    <span className="font-medium">Tổng tiền thanh toán</span>
                    <div className="text-right">
                      <div className="text-red-600 text-xl font-bold">{discount.toLocaleString('vi-VN')}đ</div>
                      <div className='text-sm text-green-500 mt-1'>Tiết kiệm {total.toLocaleString('vi-VN')}đ</div>
                      <div className="text-sm text-gray-500 mt-1">(Đã bao gồm VAT nếu có)</div>
                    </div>
                  </div>
                  
                  
                  
                  <div className="relative">
                    <button 
                      onClick={handleCheckout} 
                      disabled={selectedItems.size === 0}
                      className={`w-full py-3 rounded-md font-medium text-white bg-red-500 hover:bg-red-600 cursor-pointer ${selectedItems.size === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span>Mua ngay</span>
                        <span className="text-sm text-white/90">
                          ({selectedItems.size})
                        </span>
                      </div>
                    </button>
                  </div>
                
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CartPage;