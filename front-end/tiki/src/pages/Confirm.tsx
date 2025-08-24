import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "../component/Header";
import Footer from "../component/Footer";
import OrderStatusBadge from "../component/OrderStatusBadge";

interface BookImage {
  small_url: string;
}

interface Book {
  id: string | number;
  name: string;
  current_seller?: {
    price: number;
  };
  list_price?: number;
  images?: BookImage[];
}

type OrderItem = {
  id?: string | number;
  book: Book;
  quantity: number;
};

type LocationState = {
  orderId?: string | number;
  total?: number;
  paymentMethod?: string;
  status?: string;
  items?: OrderItem[];
};

const ConfirmPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state || {}) as LocationState;
  
  // Redirect to home if no order data is present
  useEffect(() => {
    if (!state.orderId) {
      navigate('/');
    }
  }, [state.orderId, navigate]);

  const orderItems = state.items || [];
  const total = state.total - 25000 || 0;
  const paymentMethod = state.paymentMethod || 'Thanh toán tiền mặt';

  return (
    <>
      <Header />
      <div className="bg-gray-100 min-h-[calc(100vh-200px)] py-10">
        <div className="container mx-auto grid grid-cols-12 gap-6">
          <div className="col-span-8 relative">
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="relative">
                <div className="h-32 bg-gradient-to-r from-[#0BBEE5] to-[#3856F3] text-white p-6">
                  <div className="pt-4 flex flex-col justify-center items-center">
                    <h2 className="text-3xl font-bold">
                      Yay, đặt hàng thành công!
                    </h2>
                    {state.total != null && (
                      <p className="mt-1 text-xl opacity-90">
                        Chuẩn bị tiền mặt{" "}
                        <span className="font-medium">
                          {total.toLocaleString("vi-VN")} đ
                        </span>
                      </p>
                    )}
                    {state.status && (
                      <div className="mt-3">
                        <OrderStatusBadge status={state.status} />
                      </div>
                    )}
                  </div>
                </div>
                <div className="absolute left-6 -bottom-32 w-44 h-44">
                  <img
                    src="ic_success.png"
                    alt="Success"
                    className="w-32 h-32 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://via.placeholder.com/96";
                    }}
                  />
                </div>
              </div>
              <div className="flex p-6 pt-12">
                <div className="w-1/4">
                  {/* Empty space to match the success icon width */}
                </div>
                <div className="w-3/4 pl-6">
                  <div className="divide-y border-b">
                    <div className="flex justify-between py-3 text-lg">
                      <span className="text-gray-500">
                        Phương thức thanh toán
                      </span>
                      <span className="font-medium">
                        {paymentMethod}
                      </span>
                    </div>
                    <div className="flex justify-between py-3 text-lg">
                      <span className="text-gray-500">Tổng cộng</span>
                      <span className="font-medium">
                        {total.toLocaleString("vi-VN")} đ
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <Link
                      to="/"
                      className="w-full inline-block text-center bg-white border border-[#0B74E5] text-[#0B74E5] hover:bg-blue-700 hover:text-white font-semibold rounded px-4 py-3"
                    >
                      Quay về trang chủ
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-4">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-black font-semibold">
                  <span>Mã đơn hàng: </span>
                  <span className="font-semibold">{state.orderId || "—"}</span>
                </div>
                <div
                  className="text-sm text-[#0B74E5] font-semibold cursor-pointer"
                  onClick={() => (window.location.href = "/orders")}
                >
                  Xem đơn hàng
                </div>
              </div>
              <div className="text-sm mt-1 pt-1 text-black divide-y border-t !w-full">
                Giao thứ 6, trước 13h, 28/03
              </div>
              <div className="space-y-4">
                {orderItems.map((item, index) => {
                  const defaultBook: Book = {
                    id: 'unknown',
                    name: 'Sản phẩm không có tên',
                    images: []
                  };
                  const book: Book = item?.book || defaultBook;
                  const imageUrl = book.images?.[0]?.small_url || "https://via.placeholder.com/80x96";
                  const bookName = book.name;
                  
                  return (
                    <div key={`${item?.id || 'item'}-${index}`} className="flex items-center gap-4 p-3">
                      <div className="w-20 h-24 flex-shrink-0 rounded overflow-hidden flex items-center justify-center bg-white">
                        <img
                          src={imageUrl}
                          alt={bookName}
                          className="w-full h-full object-contain p-1"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://via.placeholder.com/80x96";
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                          {bookName}
                        </h4>
                        {book.current_seller?.price && (
                          <div className="text-sm text-gray-600 mt-1">
                            {book.current_seller.price.toLocaleString('vi-VN')} đ
                          </div>
                        )}
                        <div className="text-sm text-gray-500 mt-1">
                          Số lượng: {item.quantity || 1}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ConfirmPage;
