import {
  FiChevronLeft,
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { updateOrderStatus } from '../services/api';
import { toast } from 'react-hot-toast';

interface CurrentSeller {
  id: number;
  sku: string;
  name: string;
  link: string;
  logo: string;
  price: number;
  product_id: string;
}

interface OrderDetailsProps {
  order: {
    id: string | number;
    userId: string;
    status: string;
    date: string;
    total: number;
    items: Array<{
      id?: string;
      name?: string;
      price?: number;
      quantity: number;
      image?: string;
      book?: {
        name?: string;
        list_price?: number;
        images?: Array<{ thumbnail_url?: string }>;
        current_seller?: {
          name?: string;
          price?: number;
          [key: string]: any;
        };
        [key: string]: any;
      };
      current_seller?: {
        name?: string;
        price?: number;
        [key: string]: any;
      };
      [key: string]: any;
    }>;
    shippingAddress?: string;
    paymentMethod?: string;
    customerName?: string;
    phone?: string;
    [key: string]: any;
  };
  onBack: () => void;
  onOrderUpdate?: (updatedOrder: any) => void;
}

const OrderDetails = ({ order, onBack, onOrderUpdate }: OrderDetailsProps & { onOrderUpdate?: (updatedOrder: any) => void }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <FiCheckCircle className="text-green-500 text-xl mr-2" />;
      case "cancelled":
      case "failed":
        return <FiXCircle className="text-red-500 text-xl mr-2" />;
      case "shipping":
      case "out_for_delivery":
        return <FiTruck className="text-blue-500 text-xl mr-2" />;
      default:
        return <FiPackage className="text-yellow-500 text-xl mr-2" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "confirmed":
        return "Đã xác nhận";
      case "shipping":
      case "out_for_delivery":
        return "Đang giao hàng";
      case "cancelled":
        return "Đã hủy";
      case "failed":
        return "Giao hàng thất bại";
      case "shipped":
        return "Đã giao";
      default:
        return status;
    }
  };

  return (
    <div className=" shadow-sm p-6">
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <h2 className="text-xl font-semibold">Chi tiết đơn hàng #</h2>
          <h2 className="text-xl font-semibold ml-1">{order.id} -</h2>
          <div className="flex items-center ml-1">
            <span className="text-xl font-semibold">
              {getStatusText(order.status)}
            </span>
          </div>
        </div>

        <div className="flex justify-end">
          <span className="text-gray-600">Ngày đặt hàng: </span>
          <span className="font-medium ml-1">
            {new Date(order.date).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            {new Date(order.date).toLocaleDateString("vi-VN")}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4 items-stretch">
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold mb-4 text-gray-600">
              ĐỊA CHỈ NGƯỜI NHẬN
            </h2>
            <div className="space-y-3 bg-white p-4 rounded-sm flex-1">
              {(() => {
                // Try to parse shippingAddress in format "address, phone, name"
                const parts = order.shippingAddress?.split(',').map(part => part.trim()) || [];
                const [name, phone, address] = parts;
                
                return (
                  <>
                    {name && (
                      <div className="flex flex-col">
                        <h4 className="text-sm font-medium text-gray-600">
                          Tên người nhận
                        </h4>
                        <p className="text-sm">{name}</p>
                      </div>
                    )}
                    <div className="flex flex-col">
                      <h4 className="text-sm font-medium text-gray-600">
                        Địa chỉ
                      </h4>
                      <p className="text-sm">
                        {address || "Chưa cập nhật"}
                      </p>
                    </div>
                    <div className="flex flex-col">
                      <h4 className="text-sm font-medium text-gray-600">
                        Điện thoại
                      </h4>
                      <p className="text-sm">{phone || order.phone || "Chưa cập nhật"}</p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold mb-4 ">HÌNH THỨC GIAO HÀNG</h2>
            <div className="space-y-3 bg-white p-4 rounded-sm flex-1">
              <div className="flex">
                <img src="/iconnow.png" />
                <p className="ml-2">Giao Siêu Tốc</p>
              </div>
              <div className="flex flex-col">Giao thứ 6, trước 13h, 28/03</div>
              <div className="flex flex-col">
                Được giao bởi TikiNOW Smart Logistics (giao từ Hà Nội)
              </div>
              <div className="flex flex-col">Miễn phí vận chuyển</div>
            </div>
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold mb-4 ">
              HÌNH THỨC THANH TOÁN
            </h2>
            <div className="space-y-3 bg-white p-4 rounded-sm flex-1">
              <p className="text-sm">
                {order.paymentMethod === 'cod' ? 'Thanh toán tiền mặt khi nhận hàng' : 'Thanh toán qua Viettel Money'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded mt-4">
        <div className="p-4 mt-4">
          <div className="grid grid-cols-12 gap-2 font-medium text-gray-600">
            <div className="col-span-5">Sản phẩm</div>
            <div className="col-span-2 text-center">Đơn giá</div>
            <div className="col-span-1 text-center">SL</div>
            <div className="col-span-2 text-right">Giảm giá</div>
            <div className="col-span-2 text-right">Tạm tính</div>
          </div>
        </div>
        <div className="border divide-y">
          {order.items.map((item, index) => (
            <div
              key={index}
              className="p-4 grid grid-cols-12 gap-2 items-center"
            >
              {/* Product Info - col-span-5 */}
              <div className="col-span-5 flex items-center">
                <div className="w-16 h-16 overflow-hidden mr-3 flex-shrink-0">
                  {item.book?.images?.[0]?.thumbnail_url || item.image ? (
                    <img
                      src={item.book?.images?.[0]?.thumbnail_url || item.image}
                      alt={item.book?.name || item.name || 'Sản phẩm không có tên'}
                      className="w-20 h-24 object-cover rounded"
                    />
                  ) : (
                    <div className="w-20 h-24 flex items-center justify-center bg-gray-200">
                      <FiPackage className="text-gray-400 text-xl" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.book?.name || item.name || 'Sản phẩm không có tên'}</h3>
                  <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                  <p className="text-sm text-gray-500">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(item.book?.list_price || item.price || 0)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Tổng:{" "}
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format((item.book?.list_price || item.price || 0) * item.quantity)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Người bán: {item.book?.current_seller?.name || item.current_seller?.name || 'Không rõ'}
                  </p>
                </div>
              </div>

              {/* Price - col-span-2 */}
              <div className="col-span-2 text-center">
                <p className="text-sm">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(item.book?.list_price || item.price || 0)}
                </p>
              </div>

              {/* Quantity - col-span-1 */}
              <div className="col-span-1 text-center">
                <p className="text-sm">{item.quantity}</p>
              </div>

              {/* Discount - col-span-2 */}
              <div className="col-span-2 text-right">
                <p className="text-sm text-black">
                  {(item.book?.current_seller?.price || item.current_seller?.price) ? (
                    <>
                      -
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(item.book?.current_seller?.price || item.current_seller?.price || 0)}
                    </>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </p>
              </div>

              {/* Subtotal - col-span-2 */}
              <div className="col-span-2 text-right">
                <p className="font-medium text-black">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(
                    ((item.book?.list_price || item.price || 0) * item.quantity) - 
                    (item.book?.current_seller?.price || item.current_seller?.price || 0)
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 ml-auto max-w-md w-full">
          <div className="p-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tạm tính:</span>
                <span>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(order.total)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Phí vận chuyển:</span>
                <span>25.000₫</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Giảm giá vận chuyển:</span>
                <span>
                  -
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(25000)}
                </span>
              </div>
              <div className="pt-3 mt-3 ">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Tổng cộng:</span>
                  <span className="text-xl font-semibold text-red-600">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(order.total)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2">
                <div className="col-span-1"></div>

                {order.status === 'cancelled' ? (
                  <div className="col-span-1 mt-4 py-2 px-4 border border-gray-300 bg-gray-100 text-gray-500 rounded-md flex items-center justify-center gap-2 text-sm font-medium">
                    Đã hủy
                  </div>
                ) : (order.status === 'pending' || order.status === 'confirmed') ? (
                  <button
                    className="col-span-1 mt-4 py-2 px-4 border bg-yellow-300 rounded-md hover:bg-yellow-400 transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-medium"
                    onClick={async () => {
                      if (window.confirm("Bạn có chắc chắn muốn huỷ đơn hàng này?")) {
                        try {
                          const updatedOrder = await updateOrderStatus(order.id, 'cancelled');
                          toast.success('Đã hủy đơn hàng thành công');
                          if (onOrderUpdate) {
                            onOrderUpdate({ ...order, status: 'cancelled' });
                          }
                        } catch (error) {
                          console.error('Lỗi khi hủy đơn hàng:', error);
                          toast.error('Không thể hủy đơn hàng. Vui lòng thử lại.');
                        }
                      }
                    }}
                  >
                    Huỷ đơn hàng
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
      <button
        onClick={onBack}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6 text-sm font-medium"
      >
        <FiChevronLeft className="mr-1" />
        Quay lại đơn hàng của tôi
      </button>
    </div>
  );
};

export default OrderDetails;
