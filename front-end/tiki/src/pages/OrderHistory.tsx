import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getOrders, updateOrderStatus } from '../services/api';
import type { Order } from '../interface/order.interface';
import Header from '../component/Header';
import Footer from '../component/Footer';
import OrderStatusBadge from '../component/OrderStatusBadge';
import { toast } from 'react-hot-toast';

const OrderHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getOrders({ userId: user?.id });
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Không thể tải lịch sử đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string | number) => {
    try {
      await updateOrderStatus(orderId, 'cancelled');
      toast.success('Đã hủy đơn hàng thành công');
      fetchOrders(); // Refresh danh sách
    } catch (error) {
      console.error('Failed to cancel order:', error);
      toast.error('Không thể hủy đơn hàng');
    }
  };



  const canCancelOrder = (status: string) => {
    return status === 'confirmed';
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="bg-gray-100 min-h-[calc(100vh-200px)] py-10">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="bg-gray-100 min-h-[calc(100vh-200px)] py-10">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-xl shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Lịch sử đơn hàng</h1>
            
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📦</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có đơn hàng nào</h3>
                <p className="text-gray-500">Bạn chưa có đơn hàng nào trong lịch sử.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Đơn hàng #{order.id}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                        </p>
                      </div>
                      <OrderStatusBadge 
                        status={order.status} 
                        showCancelButton={canCancelOrder(order.status)}
                        onCancel={() => handleCancelOrder(order.id)}
                      />
                    </div>

                    <div className="space-y-2 mb-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <img
                            src={item.book.book_cover || item.book.images?.[0]?.thumbnail_url || '/placeholder-book.png'}
                            alt={item.book.name}
                            className="w-12 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.book.name}</p>
                            <p className="text-sm text-gray-500">
                              Số lượng: {item.quantity} x {item.book.list_price?.toLocaleString('vi-VN')} đ
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          <p>Địa chỉ giao hàng: {order.shippingAddress}</p>
                          <p>Phương thức thanh toán: {order.paymentMethod}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Tổng cộng:</p>
                          <p className="text-xl font-bold text-gray-900">
                            {order.totalPrice.toLocaleString('vi-VN')} đ
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OrderHistory;
