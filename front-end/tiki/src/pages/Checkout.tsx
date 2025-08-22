import { useState, useEffect, useMemo, FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Header from '../component/Header';
import Footer from '../component/Footer';
import { createOrder } from '../services/api';
import type { OrderItem, OrderStatus, Order } from '../interface/order.interface';
import { ArrowLeft, CheckCircle, ChevronDown } from 'lucide-react';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
  });
  const [formErrors, setFormErrors] = useState({
    fullName: '',
    phone: '',
    address: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Ensure items are passed and is an array
    if (location.state?.items && Array.isArray(location.state.items) && location.state.items.length > 0) {
      setOrderItems(location.state.items);
    } else {
      // Redirect to cart page if no items are found, which is a better UX
      // The cart page can then decide to redirect to home if it's also empty.
      navigate('/cart');
    }
  }, [location.state, navigate]);

  const orderSummary = useMemo(() => {
    const subtotal = orderItems.reduce((sum, item) => {
      const price = item.book.current_seller?.price ?? item.book.list_price ?? 0;
      return sum + (price * item.quantity);
    }, 0);

    const shipping = subtotal > 500000 ? 0 : 15000; // Free shipping over 500k

    return {
      subtotal,
      shipping,
      total: subtotal + shipping,
    };
  }, [orderItems]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (value.trim()) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = { fullName: '', phone: '', address: '' };
    let isValid = true;

    if (!formData.fullName.trim()) {
      errors.fullName = 'Họ và tên là bắt buộc.';
      isValid = false;
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Số điện thoại là bắt buộc.';
      isValid = false;
    } else if (!/^(0[3|5|7|8|9])+([0-9]{8})\b/.test(formData.phone)) {
      errors.phone = 'Số điện thoại không hợp lệ.';
      isValid = false;
    }
    if (!formData.address.trim()) {
      errors.address = 'Địa chỉ là bắt buộc.';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'user'> = {
        items: orderItems,
        shippingAddress: `${formData.fullName}, ${formData.phone}, ${formData.address}`,
        paymentMethod,
        status: 'pending' as OrderStatus,
        totalPrice: orderSummary.total,
      };

      const { data: order } = await createOrder(orderData);
      navigate('/order-confirmation', {
        state: {
          orderId: order.id,
          total: order.totalPrice,
          paymentMethod: order.paymentMethod,
        },
      });
    } catch (error) {
      console.error('Error creating order:', error);
      // Ideally, use a toast notification here
      alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + '₫';

  if (orderItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-grow flex items-center justify-center text-center">
          <div>
            <h2 className="text-xl font-semibold">Giỏ hàng của bạn đang trống</h2>
            <p className="text-gray-600 mt-2">Hãy quay lại và chọn cho mình những cuốn sách hay nhé.</p>
            <Link to="/" className="mt-4 inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow">
        <div className="bg-white py-3 border-b">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center">
              <Link to="/cart" className="text-blue-600 hover:text-blue-800 flex items-center">
                <ArrowLeft size={18} className="mr-1" />
                <span className="text-sm">Trở về giỏ hàng</span>
              </Link>
              <h1 className="text-lg font-medium text-gray-900 ml-6">Thanh toán</h1>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column - Delivery & Payment */}
            <div className="lg:w-2/3 space-y-4">
              {/* Delivery Address Form */}
              <div className="bg-white rounded shadow-sm p-4">
                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                      <CheckCircle className="w-3 h-3 text-blue-600" />
                    </div>
                    <h2 className="text-base font-medium">Địa chỉ nhận hàng</h2>
                  </div>
                </div>

                <div className="pl-7 space-y-3">
                  <div>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Họ và tên"
                      className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 ${
                        formErrors.fullName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                    {formErrors.fullName && <p className="text-red-500 text-xs mt-1">{formErrors.fullName}</p>}
                  </div>
                  <div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Số điện thoại"
                      className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 ${
                        formErrors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                    {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                  </div>
                  <div>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Địa chỉ (Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố)"
                      className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 ${
                        formErrors.address ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                    {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
                  </div>
                </div>
              </div>

              {/* Order Items - This section is now for review */}
              <div className="bg-white rounded shadow-sm p-4">
                <h2 className="text-base font-medium mb-3">Sản phẩm ({orderItems.reduce((acc, item) => acc + item.quantity, 0)})</h2>
                {orderItems.map((item) => (
                  <div key={item.book.id} className="flex items-start py-3 border-b last:border-b-0">
                    <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={item.book.images?.[0]?.small_url || '/placeholder-book.jpg'}
                        alt={item.book.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-sm text-gray-900 line-clamp-2">{item.book.name}</h3>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-500">Số lượng: {item.quantity}</span>
                        <span className="text-sm font-medium text-red-600">{formatPrice((item.book.current_seller?.price ?? item.book.list_price ?? 0) * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded shadow-sm p-4">
                <h2 className="text-base font-medium mb-3">Phương thức thanh toán</h2>

                <div className="space-y-2">
                  <div className="border rounded overflow-hidden">
                    <label className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 ${paymentMethod === 'cod' ? 'bg-blue-50 border-blue-200' : ''}`}>
                      <input
                        type="radio"
                        name="payment"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="block text-sm">Thanh toán khi nhận hàng (COD)</span>
                          <img src="https://salt.tikicdn.com/ts/upload/0c/21/af/2a8999a5a6f5bd535a833b58a5bddd7e.png" alt="COD" className="h-5" />
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="border rounded overflow-hidden">
                    <label className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 ${paymentMethod === 'banking' ? 'bg-blue-50 border-blue-200' : ''}`}>
                      <input
                        type="radio"
                        name="payment"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        checked={paymentMethod === 'banking'}
                        onChange={() => setPaymentMethod('banking')}
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="block text-sm">Chuyển khoản ngân hàng</span>
                          <div className="flex space-x-1">
                            <img src="https://salt.tikicdn.com/ts/tikimsp/5e0e7d06ffb0f025db41cacf93caef60.png" alt="Visa" className="h-5" />
                            <img src="https://salt.tikicdn.com/ts/tikimsp/6bcef0fe48bfb4a5bde7185d258e0a85.png" alt="Mastercard" className="h-5" />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Chức năng này đang được phát triển.</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded shadow-sm sticky top-4">
                {/* Voucher */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Mã giảm giá</span>
                    <button type="button" className="text-blue-600 text-xs font-medium flex items-center">
                      Chọn hoặc nhập mã <ChevronDown className="w-3 h-3 ml-1" />
                    </button>
                  </div>
                </div>

                {/* Price summary */}
                <div className="p-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tạm tính</span>
                    <span>{formatPrice(orderSummary.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí vận chuyển</span>
                    <span className="text-gray-900">{orderSummary.shipping > 0 ? formatPrice(orderSummary.shipping) : 'Miễn phí'}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">Tổng cộng</span>
                      <div className="text-right">
                        <div className="text-base font-medium text-red-600">{formatPrice(orderSummary.total)}</div>
                        <div className="text-xs text-gray-500">(Đã bao gồm VAT nếu có)</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order button */}
                <div className="p-4 border-t">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-red-600 text-white py-2.5 px-4 rounded text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Đang xử lý...' : `Đặt hàng (${orderItems.length} sản phẩm)`}
                  </button>

                  <div className="mt-3 text-center">
                    <p className="text-[11px] text-gray-500">Bằng cách đặt hàng, bạn đồng ý với Điều khoản dịch vụ & Chính sách bảo mật của Tiki</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
