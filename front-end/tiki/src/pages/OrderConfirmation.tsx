import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../component/Header';
import Footer from '../component/Footer';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, total, paymentMethod } = location.state || {};

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  };

  if (!orderId) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-8 sm:p-10">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                  <svg
                    className="h-10 w-10 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h1 className="mt-4 text-2xl font-bold text-gray-900">Đặt hàng thành công!</h1>
                <p className="mt-2 text-gray-600">
                  Cảm ơn bạn đã đặt hàng. Mã đơn hàng của bạn là:
                </p>
                <p className="mt-1 text-lg font-medium text-blue-600">#{orderId}</p>
                
                <div className="mt-8 border-t border-gray-200 pt-8">
                  <h2 className="text-lg font-medium text-gray-900">Thông tin đơn hàng</h2>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tổng tiền:</span>
                      <span className="font-medium">{formatPrice(total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phương thức thanh toán:</span>
                      <span className="font-medium">
                        {paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản ngân hàng'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <p className="text-gray-600">
                    Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất để xác nhận đơn hàng.
                    Vui lòng kiểm tra email hoặc số điện thoại thường xuyên.
                  </p>
                </div>
                
                <div className="mt-10 flex justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Tiếp tục mua sắm
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/orders')}
                    className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Xem đơn hàng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default OrderConfirmation;
