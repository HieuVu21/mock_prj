import { Link, useNavigate } from 'react-router-dom';
import { FiTag, FiCreditCard, FiTrash2 } from 'react-icons/fi';
import Header from '../component/Header';
import Footer from '../component/Footer';
import { useCart } from '../contexts/CartContext';
import { createOrder } from '../services/api';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const subtotal = cartItems.reduce((sum, item) => sum + item.list_price * item.quantity, 0);
  const shippingFee = 25000;
  const discount = 59000; // Giảm giá trực tiếp
  const voucherDiscount = 25000;
  const total = subtotal + shippingFee - discount - voucherDiscount;

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    try {
      const items = cartItems.map((it) => ({ book: { id: it.id, name: it.name, images: it.images, list_price: it.list_price }, quantity: it.quantity }));
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
      navigate('/confirm', { state: { orderId: order.id, total: order.totalPrice, paymentMethod: order.paymentMethod } });
    } catch (e) {
      // noop visual feedback could be added later
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
                {/* Shipping Options */}
                <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                  <h2 className="font-semibold mb-3">Chọn hình thức giao hàng</h2>
                  <div className="border border-blue-300 bg-blue-50 p-3 rounded-lg">
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" name="shipping" className="form-radio text-blue-600" defaultChecked />
                      <span className="ml-2 font-semibold text-blue-700">NOW Giao siêu tốc 2h <span className="text-green-600 font-normal">-25k</span></span>
                    </label>
                  </div>
                </div>

                {/* Cart Items */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex items-start gap-4 py-4 border-b last:border-b-0">
                      <img src={item.images?.[0]?.thumbnail_url || 'https://via.placeholder.com/150'} alt={item.name} className="w-20 h-20 object-contain rounded border" />
                      <div className="flex-grow">
                        <p className="font-medium mb-2">{item.name}</p>
                        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden w-fit">
                          <button 
                            className="px-3 py-1 text-lg font-medium hover:bg-gray-50 text-gray-600"
                            onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          >
                            -
                          </button>
                          <span className="px-4 py-1 border-l border-r border-gray-300 text-center w-12">
                            {item.quantity}
                          </span>
                          <button 
                            className="px-3 py-1 text-lg font-medium hover:bg-gray-50 text-gray-600"
                            onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-red-600 font-semibold">{(item.list_price * item.quantity).toLocaleString('vi-VN')}đ</p>
                        {item.original_price > item.list_price && (
                          <p className="text-gray-500 line-through text-sm">{item.original_price.toLocaleString('vi-VN')}đ</p>
                        )}
                        <button onClick={() => removeFromCart(item.cartItemId)} className="text-red-500 hover:text-red-700 mt-2">
                          <FiTrash2 className="inline-block"/> Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Payment Options */}
                <div className="bg-white p-4 rounded-lg shadow-sm mt-4">
                  <h2 className="font-semibold mb-3">Chọn hình thức thanh toán</h2>
                  <label className="flex items-center cursor-pointer p-3 border rounded-lg">
                    <input type="radio" name="payment" className="form-radio text-blue-600" defaultChecked />
                    <FiCreditCard className="mx-2" />
                    <span>Thanh toán tiền mặt</span>
                  </label>
                </div>
              </div>

              {/* Right Column */}
              <div className="col-span-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Giao tới</h3>
                    <Link to="/profile" className="text-blue-600 text-sm">Thay đổi</Link>
                  </div>
                  <div className="font-semibold text-sm">Vũ Anh Tú | 0942438693</div>
                  <p className="text-sm text-gray-600">Văn phòng: số 17 Duy Tân, Phường Dịch Vọng, Quận Cầu Giấy, Hà Nội</p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm mt-4">
                  <h3 className="font-semibold mb-2">Tiki Khuyến Mãi</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1 text-green-600 bg-green-100 border border-green-500 rounded-md px-2 py-1 text-sm">
                      <FiTag />
                      <span>Giảm 25K</span>
                    </div>
                    <button className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm">Bỏ Chọn</button>
                  </div>
                  <Link to="#" className="text-blue-600 text-sm">Chọn hoặc nhập mã khác</Link>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm mt-4">
                  <h3 className="font-semibold mb-3">Đơn hàng</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Tạm tính</span>
                      <span>{subtotal.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phí vận chuyển</span>
                      <span>{shippingFee.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá trực tiếp</span>
                      <span>-{discount.toLocaleString('vi-VN')}đ</span>
                    </div>
                     <div className="flex justify-between text-green-600">
                      <span>Giảm giá vận chuyển</span>
                      <span>-{voucherDiscount.toLocaleString('vi-VN')}đ</span>
                    </div>
                  </div>
                  <div className="border-t my-3"></div>
                  <div className="flex justify-between font-bold">
                    <span>Tổng tiền</span>
                    <span className="text-red-600 text-lg">{total.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">(Đã bao gồm VAT nếu có)</p>
                  <button onClick={handleCheckout} className="w-full bg-red-500 text-white py-3 rounded-lg mt-4 font-semibold hover:bg-red-600">
                    Đặt Hàng
                  </button>
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
