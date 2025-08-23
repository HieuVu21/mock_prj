import {
  FiChevronLeft,
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";

interface OrderItem {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  discount?: number;
}

interface OrderDetailsProps {
  order: {
    id: string;
    userId: string; // Added userId to track which user created the order
    status: string;
    date: string;
    total: number;
    items: OrderItem[];
    shippingAddress?: string;
    paymentMethod?: string;
    customerName?: string;
    phone?: string;
  };
  onBack: () => void;
}

const OrderDetails = ({ order, onBack }: OrderDetailsProps) => {
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
      case "delivered":
        return "Đã giao hàng";
      case "cancelled":
        return "Đã hủy";
      case "failed":
        return "Giao hàng thất bại";
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
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <FiPackage className="text-gray-400 text-xl" />
                    </div>
                  )}
                </div>
                <h3 className="font-medium text-sm line-clamp-2">
                  {item.name}
                </h3>
              </div>

              {/* Price - col-span-2 */}
              <div className="col-span-2 text-center">
                <p className="text-sm">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(item.price)}
                </p>
              </div>

              {/* Quantity - col-span-1 */}
              <div className="col-span-1 text-center">
                <p className="text-sm">{item.quantity}</p>
              </div>

              {/* Discount - col-span-2 */}
              <div className="col-span-2 text-right">
                <p className="text-sm text-black">
                  -
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(item.discount || 0)}
                </p>
              </div>

              {/* Subtotal - col-span-2 */}
              <div className="col-span-2 text-right">
                <p className="font-medium text-black">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(item.price * item.quantity - (item.discount || 0))}
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
                  }).format(order.total * 0.9)}
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
                  }).format(order.total * 0.1)}
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

                <button
                  className="col-span-1 mt-4 py-2 px-4 border bg-yellow-300 rounded-md hover:bg-yellow-400 transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-medium"
                  onClick={() => {
                    // Add your cancel order logic here
                    if (
                      window.confirm("Bạn có chắc chắn muốn huỷ đơn hàng này?")
                    ) {
                      // Handle order cancellation
                    }
                  }}
                >
                  Huỷ đơn hàng
                </button>
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
