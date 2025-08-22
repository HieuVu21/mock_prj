import { Link, useLocation } from 'react-router-dom';
import Header from '../component/Header';
import Footer from '../component/Footer';
import OrderStatusBadge from '../component/OrderStatusBadge';

type LocationState = {
  orderId?: string | number;
  total?: number;
  paymentMethod?: string;
  status?: string;
};

const ConfirmPage = () => {
  const location = useLocation();
  const state = (location.state || {}) as LocationState;

  return (
    <>
      <Header />
      <div className="bg-gray-100 min-h-[calc(100vh-200px)] py-10">
        <div className="container mx-auto px-4 grid grid-cols-12 gap-6">
          <div className="col-span-8">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-6 mb-4">
                <h2 className="text-xl font-bold">Yay, đặt hàng thành công!</h2>
                {state.total != null && (
                  <p className="mt-1">Chuẩn bị tiền mặt {state.total.toLocaleString('vi-VN')} đ</p>
                )}
                {state.status && (
                  <div className="mt-3">
                    <OrderStatusBadge status={state.status} />
                  </div>
                )}
              </div>
              <div className="divide-y">
                <div className="flex justify-between py-3 text-sm">
                  <span>Phương thức thanh toán</span>
                  <span className="font-medium">{state.paymentMethod || 'Thanh toán tiền mặt'}</span>
                </div>
                <div className="flex justify-between py-3 text-sm">
                  <span>Tổng cộng</span>
                  <span className="font-bold">{state.total?.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <Link to="/" className="w-full inline-block text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md px-4 py-3">Quay về trang chủ</Link>
                <Link to="/orders" className="w-full inline-block text-center bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-md px-4 py-3">Xem lịch sử đơn hàng</Link>
              </div>
            </div>
          </div>
          <div className="col-span-4">
            <div className="bg-white rounded-xl shadow p-6 text-sm">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Mã đơn hàng</span>
                <span className="font-semibold">{state.orderId || '—'}</span>
              </div>
              <p className="text-gray-500">Cảm ơn bạn đã mua hàng tại Tiki clone.</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ConfirmPage;


