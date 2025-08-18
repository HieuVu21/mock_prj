import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import Header from '../component/Header';
import Footer from '../component/Footer';
import { getOrders } from '../services/api';
import type { Order } from '../interface/order.interface';

const formatCurrency = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + ' đ';

const statusLabel: Record<Order['status'], string> = {
  pending: 'Chờ thanh toán',
  confirmed: 'Đang xử lý',
  shipping: 'Đang vận chuyển',
  delivered: 'Giao hàng thành công',
  cancelled: 'Đã hủy',
};

const FAKE_ORDERS: Order[] = [
  {
    id: 'DH10001',
    userId: '1',
    customerName: 'TIẾP NGUYỄN',
    items: [
      { book: { name: 'Gel nghệ Nano siêu hấp thu Decumar New (20g) - Ngừa mụn, Giảm thâm sẹo, Kiểm soát nhờn', book_cover: '/anh/1.png', original_price: 75000, manufacturer: 'CVI Pharma' }, quantity: 1 },
    ],
    totalPrice: 93000,
    status: 'delivered',
    shippingAddress: 'Phố lỗ, Xã Nguyệt Đức, Huyện Yên Lạc, Vĩnh Phúc, Việt Nam',
    paymentMethod: 'cod',
    createdAt: '2019-12-28T13:30:00Z',
  },
  {
    id: 'DH10002',
    userId: '1',
    customerName: 'Nam doãn',
    items: [
      { book: { name: 'Sữa Rửa Mặt Tinh Chất Nghệ E100 (50g)', book_cover: '/anh/2.png', original_price: 27000, manufacturer: 'LOTTE MART' }, quantity: 1 },
    ],
    totalPrice: 27000,
    status: 'cancelled',
    shippingAddress: 'Hà Nội',
    paymentMethod: 'cod',
    createdAt: '2019-12-20T10:00:00Z',
  },
];

const OrderDetail: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState<Order | null>(() => (location.state as any)?.order || null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (order) return;
      setIsLoading(true);
      try {
        const { data } = await getOrders({ id });
        const found = Array.isArray(data) ? data.find((o) => String(o.id) === String(id)) : null;
        setOrder(found || FAKE_ORDERS.find((o) => String(o.id) === String(id)) || null);
      } catch {
        setOrder(FAKE_ORDERS.find((o) => String(o.id) === String(id)) || null);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  const placedAt = useMemo(() => (order?.createdAt ? new Date(order.createdAt) : null), [order?.createdAt]);

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-6 mb-6">
        <div className="flex items-center text-sm text-[#808089] mb-4">
          <Link to="/" className="hover:text-[#0d5cb6]">Trang chủ</Link>
          <span className="mx-2">&gt;</span>
          <Link to="/profile" className="hover:text-[#0d5cb6]">Đơn hàng của tôi</Link>
          <span className="mx-2">&gt;</span>
          <span>Chi tiết đơn hàng</span>
        </div>

        {isLoading || !order ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d5cb6] mx-auto mb-4"></div>
              <p>Đang tải chi tiết đơn hàng...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold">
                Chi tiết đơn hàng #{order.id} - <span className="text-[#0d5cb6]">{statusLabel[order.status]}</span>
              </h1>
              {placedAt && (
                <div className="text-sm text-gray-600">Ngày đặt hàng: {placedAt.toLocaleString('vi-VN')}</div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="border rounded p-4 border-gray-300">
                <div className="font-medium mb-2">Thông báo</div>
                <div className="text-sm text-gray-600">Chúng tôi vừa bàn giao đơn hàng của quý khách đến đối tác vận chuyển. Dự kiến giao hàng trong 1-3 ngày làm việc.</div>
              </div>
              <div className="border rounded p-4 border-gray-300">
                <div className="font-medium mb-2">Địa chỉ người nhận</div>
                <div className="text-sm">
                  <div className="font-semibold">{order.customerName || 'Khách hàng'}</div>
                  <div className="text-gray-600">{order.shippingAddress}</div>
                  <div className="text-gray-600">Điện thoại: 0988130768</div>
                </div>
              </div>
              <div className="border rounded p-4 border-gray-300">
                <div className="font-medium mb-2">Hình thức thanh toán</div>
                <div className="text-sm text-gray-600">{order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Thanh toán điện tử'}</div>
              </div>
            </div>

            <div className="border rounded overflow-hidden border-gray-300">
              <div className="grid grid-cols-12 bg-gray-50 text-gray-600 text-sm px-4 py-2">
                <div className="col-span-6">Sản phẩm</div>
                <div className="col-span-2 text-right">Giá</div>
                <div className="col-span-2 text-center">Số lượng</div>
                <div className="col-span-2 text-right">Tạm tính</div>
              </div>
              {order.items.map((it, idx) => (
                <div key={idx} className="grid grid-cols-12 items-center px-4 py-3 border-t border-gray-300">
                  <div className="col-span-6 flex items-start gap-3">
                    <img src={it.book?.book_cover || '/emptycart.png'} alt="img" className="w-12 h-12 object-contain rounded border border-gray-300" />
                    <div>
                      <div className="text-sm mb-1">{it.book?.name}</div>
                      <div className="text-xs text-gray-500">Cung cấp bởi {it.book?.manufacturer || 'Nhà bán'}</div>
                    </div>
                  </div>
                  <div className="col-span-2 text-right text-sm">{formatCurrency(it.book?.original_price || 0)}</div>
                  <div className="col-span-2 text-center text-sm">{it.quantity}</div>
                  <div className="col-span-2 text-right text-sm">{formatCurrency((it.book?.original_price || 0) * it.quantity)}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <div className="w-full md:w-1/2 lg:w-1/3">
                <div className="flex justify-between text-sm py-1"><span>Tạm tính</span><span>{formatCurrency(order.items.reduce((s, it) => s + (it.book?.original_price || 0) * it.quantity, 0))}</span></div>
                <div className="flex justify-between text-sm py-1"><span>Phí vận chuyển</span><span>0 đ</span></div>
                <div className="border-t my-2 border-gray-300"></div>
                <div className="flex justify-between text-lg font-semibold text-[#d70018] "><span>Tổng cộng</span><span>{formatCurrency(order.totalPrice)}</span></div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <Link to="/profile/order" className="text-[#0d5cb6] text-sm hover:underline">&lt;&lt; Quay lại đơn hàng của tôi</Link>
              <button className="bg-[#ffd400] text-[#27272a] px-4 py-2 rounded text-sm font-medium">Theo dõi đơn hàng</button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default OrderDetail; 