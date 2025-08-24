import { useState, useEffect, useMemo, FormEvent } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Header from "../component/Header";
import Footer from "../component/Footer";
import { createOrder, getCurrentUser, updateUser } from "../services/api";
import { toast } from "react-toastify";
import type {
  OrderItem,
  OrderStatus,
  Order,
} from "../interface/order.interface";
import { ArrowLeft, CheckCircle, ChevronDown } from "lucide-react";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    paymentMethod: "cod",
    note: "",
    deliveryMethod: "fast", // 'fast' or 'standard'
  });
  const [formErrors, setFormErrors] = useState({
    fullName: "",
    phone: "",
    address: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    console.log(
      "Auth token from localStorage:",
      token ? "Token exists" : "No token found"
    );

    if (!token) {
      console.log("User not authenticated, redirecting to login");
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }

    // Fetch user profile data
    const fetchUserProfile = async () => {
      try {
        console.log("Fetching user profile...");
        const response = await getCurrentUser();
        console.log("Full API response:", JSON.stringify(response, null, 2));
        const user = response?.data;
        console.log("User data structure:", {
          hasData: !!user,
          keys: user ? Object.keys(user) : "no user data",
          userData: user,
        });

        if (user) {
          // Use name if fullName is not available
          const displayName = user.fullName || user.name || "";

          console.log("Setting user data:", {
            fullName: displayName,
            phone: user.phone,
            address: user.address,
          });

          setFormData((prev) => ({
            ...prev,
            fullName: displayName,
            phone: user.phone || "",
            address: user.address || "",
          }));
        } else {
          console.log("No user data received");
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };

    // Log form data changes
    const logFormData = () => {
      console.log("Current form data:", formData);
    };

    // Initial log
    logFormData();

    // Set up interval for logging form data
    const intervalId = setInterval(logFormData, 3000);

    // Ensure items are passed and is an array
    if (
      location.state?.items &&
      Array.isArray(location.state.items) &&
      location.state.items.length > 0
    ) {
      setOrderItems(location.state.items);
      fetchUserProfile();
    } else {
      // Redirect to cart page if no items are found, which is a better UX
      // The cart page can then decide to redirect to home if it's also empty.
      navigate("/cart");
    }

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [location.state, navigate]);

  const orderSummary = useMemo(() => {
    const subtotal = orderItems.reduce((sum, item) => {
      const price =
        item.book.current_seller?.price ?? item.book.list_price ?? 0;
      return sum + price * item.quantity;
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
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, address: e.target.value });
  };

  const handleConfirmAddress = async () => {
    try {
      const response = await getCurrentUser();
      if (response && response.data && response.data.id) {
        // Create an update object with all current user data and only update the address
        const updatedUser = {
          ...response.data, // Keep all existing user data
          address: formData.address, // Update only the address
        };
        await updateUser(response.data.id, updatedUser);
        setIsEditingAddress(false);
        toast.success("Cập nhật địa chỉ thành công!");
      }
    } catch (error) {
      console.error("Error updating address:", error);
      toast.error("Có lỗi xảy ra khi cập nhật địa chỉ");
    }
  };

  const validateForm = () => {
    const errors = { fullName: "", phone: "", address: "" };
    let isValid = true;

    if (!formData.fullName.trim()) {
      errors.fullName = "Họ và tên là bắt buộc.";
      isValid = false;
    }
    if (!formData.phone.trim()) {
      errors.phone = "Số điện thoại là bắt buộc.";
      isValid = false;
    } else if (!/^(0[3|5|7|8|9])+([0-9]{8})\b/.test(formData.phone)) {
      errors.phone = "Số điện thoại không hợp lệ.";
      isValid = false;
    }
    if (!formData.address.trim()) {
      errors.address = "Địa chỉ là bắt buộc.";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.fullName || !formData.phone || !formData.address) {
      alert("Vui lòng điền đầy đủ thông tin giao hàng");
      return;
    }

    if (!paymentMethod) {
      alert("Vui lòng chọn phương thức thanh toán");
      return;
    }

    // Validate order items
    if (orderItems.length === 0) {
      alert(
        "Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm vào giỏ hàng trước khi đặt hàng."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const authData = localStorage.getItem('auth');
      const auth = authData ? JSON.parse(authData) : null;
      const userEmail = auth?.user?.email || '';
      const userId = auth?.user?.id || '';
      
      const orderData: Omit<Order, "id" | "createdAt" | "updatedAt" | "user"> = {
          items: orderItems,
          shippingAddress: `${formData.fullName}, ${formData.phone}, ${formData.address}, ${userEmail}`,
          paymentMethod,
          status: "pending" as OrderStatus,
          totalPrice: orderSummary.total,
          userId: String(userId), // Add the required userId field
        };

      console.log("Submitting order with data:", orderData);

      const response = await createOrder(orderData);
      const order = response.data;
      console.log("Order created successfully:", order);

      if (!order) {
        throw new Error("Không nhận được thông tin đơn hàng từ máy chủ");
      }

      // Navigate to confirmation with order details
      navigate("/order-confirmation", {
        state: {
          orderId: order.id,
          total: order.totalPrice,
          paymentMethod: order.paymentMethod,
          items: orderItems, // Include order items in the navigation state
        },
      });
    } catch (error) {
      console.error("Error in handleSubmit:", error);

      // More specific error messages based on error type
      let errorMessage = "Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.";

      if (
        error.message.includes("401") ||
        error.message.includes("Phiên đăng nhập")
      ) {
        errorMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
        // Redirect to login page
        navigate("/login", { state: { from: "/checkout" } });
      } else if (error.message.includes("network")) {
        errorMessage =
          "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối và thử lại.";
      }

      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN").format(price) + "₫";

  if (orderItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-grow flex items-center justify-center text-center">
          <div>
            <h2 className="text-xl font-semibold">
              Giỏ hàng của bạn đang trống
            </h2>
            <p className="text-gray-600 mt-2">
              Hãy quay lại và chọn cho mình những cuốn sách hay nhé.
            </p>
            <Link
              to="/"
              className="mt-4 inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
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
        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column - Delivery & Payment */}
            <div className="lg:w-2/3 space-y-4">
              {/* Order Items - This section is now for review */}
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                <h2 className="text-base font-semibold mb-3">
                  Chọn hình thức giao hàng
                </h2>
                <div className="space-y-2 w-full max-w-md bg-[#F8FAFF] p-1.5 rounded-md">
                  {/* Fast Delivery Option */}
                  <label
                    className={`flex items-center p-1 cursor-pointer ${
                      formData.deliveryMethod === "fast"
                        ? "border-blue-500"
                        : "border-transparent hover:border-blue-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            formData.deliveryMethod === "fast"
                              ? "border-blue-500"
                              : "border-gray-300"
                          }`}
                        >
                          {formData.deliveryMethod === "fast" && (
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <img
                          src="/iconnow.png"
                          className="w-5 h-3.5 object-contain"
                          alt="Giao siêu tốc"
                        />
                        <span className="text-sm font-medium">
                          Giao siêu tốc 2h
                        </span>
                      </div>
                    </div>
                    <div className="text-green-600 bg-white px-1 py-0.5 ml-2 rounded text-xs font-medium border">
                      -25k
                    </div>
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="fast"
                      checked={formData.deliveryMethod === "fast"}
                      onChange={() =>
                        setFormData({ ...formData, deliveryMethod: "fast" })
                      }
                      className="sr-only"
                    />
                  </label>

                  {/* Standard Delivery Option */}
                  <label
                    className={`flex items-center p-1 cursor-pointer rounded transition-colors`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            formData.deliveryMethod === "standard"
                              ? "border-blue-500 bg-white"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {formData.deliveryMethod === "standard" && (
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-medium">
                        Giao tiết kiệm
                      </span>
                    </div>
                    <div className="text-green-600 bg-white px-1 py-0.5 ml-2 rounded text-xs font-medium border">
                      -16k
                    </div>
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="standard"
                      checked={formData.deliveryMethod === "standard"}
                      onChange={() =>
                        setFormData({ ...formData, deliveryMethod: "standard" })
                      }
                      className="sr-only"
                    />
                  </label>
                </div>
                <div className="border border-gray-100 rounded-lg mt-4 overflow-hidden">
                  <div className="divide-y divide-gray-100">
                    {orderItems.map((item) => {
                      const price =
                        item.book.current_seller?.price ??
                        item.book.list_price ??
                        0;
                      const totalPrice = price * item.quantity;

                      return (
                        <div
                          key={item.book.id}
                          className="p-3 transition-colors w-2/3"
                        >
                          <div className="flex items-center">
                            <div className="w-24 h-24 bg-white rounded overflow-hidden flex-shrink-0">
                              <img
                                src={
                                  item.book.images?.[0]?.small_url ||
                                  "/placeholder-book.jpg"
                                }
                                alt={item.book.name}
                                className="w-full h-full object-contain p-1"
                              />
                            </div>
                            <div className="ml-3 flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-tight">
                                {item.book.name}
                              </h3>

                              <div className="mt-2 flex justify-between items-center">
                                <div>SL: x{item.quantity}</div>
                                <div className="text-right flex">
                                  <div className="text-xs text-gray-400 mt-0.5 font-medium mr-2 line-through">
                                    {formatPrice(item.book.list_price)}
                                  </div>
                                  <div className="text-sm font-medium text-red-600">
                                    {formatPrice(item.book.current_seller?.price)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                <h2 className="text-base font-semibold mb-3 text-gray-800">
                  Chọn hình thức thanh toán
                </h2>

                <div className="space-y-2">
                  {/* Cash on Delivery */}
                  <div className="overflow-hidden">
                    <label
                      className={`flex items-center p-3 cursor-pointer transition-colors`}
                    >
                      <div className="relative">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === "cod"
                              ? "border-blue-500 bg-white"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {paymentMethod === "cod" && (
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                          )}
                        </div>
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-white flex items-center justify-center mr-2">
                            <img
                              src="/payment/tienmat.png"
                              alt="COD"
                              className="h-7 w-auto object-contain"
                            />
                          </div>
                          <span className="block text-sm font-medium text-gray-800">
                            Thanh toán tiền mặt
                          </span>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="payment"
                        className="sr-only"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                      />
                    </label>
                  </div>

                  {/* Viettel Money */}
                  <div className="overflow-hidden">
                    <label className={`flex items-center p-3 cursor-pointer`}>
                      <div className="relative">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === "banking"
                              ? "border-blue-500 bg-white"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {paymentMethod === "banking" && (
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                          )}
                        </div>
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-white flex items-center justify-center mr-2">
                            <img
                              src="/payment/viettelmoney.png"
                              alt="Viettel Money"
                              className="h-6 w-auto object-contain"
                            />
                          </div>
                          <span className="block text-sm font-medium text-gray-800">
                            Viettel Money
                          </span>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="payment"
                        className="sr-only"
                        checked={paymentMethod === "banking"}
                        onChange={() => setPaymentMethod("banking")}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white p-4 rounded-lg shadow-sm mb-4 border border-gray-100">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Giao tới</span>
                  </div>
                  <div
                    className="text-blue-600 text-sm font-medium cursor-pointer hover:underline"
                    onClick={() => setIsEditingAddress(!isEditingAddress)}
                  >
                    {isEditingAddress ? "Hủy" : "Thay đổi"}
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="font-medium">
                      {formData.fullName || "Chưa có tên"}
                    </div>
                    <div className="text-gray-600 divide-x border-l p-1">
                      {formData.phone || "Chưa có số điện thoại"}
                    </div>
                  </div>
                  <div className="text-gray-600 pt-1 flex items-start">
                    {isEditingAddress ? (
                      <div className="w-full">
                        <input
                          type="text"
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          value={formData.address}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: e.target.value,
                            })
                          }
                          placeholder="Nhập địa chỉ giao hàng"
                        />
                        <button
                          type="button"
                          className="mt-2 px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                          onClick={handleConfirmAddress}
                        >
                          Xác nhận
                        </button>
                      </div>
                    ) : (
                      <span>{formData.address || "Chưa có địa chỉ"}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 mb-4 ">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Tiki Khuyến Mãi</span>
                  </div>
                  <div className="text-sm text-gray-500">Có thể chọn 2</div>
                </div>
                <div className="flex items-center py-3 cursor-pointer hover:border-blue-500 transition-colors">
                  <div className="flex items-center gap-3">
                    <img src="/SVG.png" className="w-5 h-5" alt="Khuyến mãi" />
                    <span className="text-blue-600 font-medium text-sm mr-4">
                      Chọn hoặc nhập mã khuyến mãi
                    </span>
                  </div>
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
              <div className="bg-white rounded shadow-sm sticky top-4">
                {/* Voucher */}
                <div className="p-4 border-b">
                  <h2 className="text-lg font-medium mb-3">Đơn hàng</h2>
                  <div className="flex items-center">
                    <span className="text-sm font-medium mr-2">1 sản phẩm</span>
                    <button
                      type="button"
                      className="text-blue-600 text-xs font-medium flex items-center"
                    >
                      Xem thông tin <ChevronDown className="w-3 h-3 ml-1" />
                    </button>
                  </div>
                </div>

                {/* Price summary */}
                <div className="p-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tổng tiền hàng</span>
                    <span>{formatPrice(orderSummary.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí vận chuyển</span>
                    <span className="text-gray-900">
                      {orderSummary.shipping > 0
                        ? formatPrice(orderSummary.shipping)
                        : "Miễn phí"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giảm giá trực tiếp</span>
                    <span className="text-green-600">-25.000đ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giảm giá vận chuyển</span>
                    <span className="text-green-600">
                      -
                      {orderSummary.shipping > 0
                        ? formatPrice(orderSummary.shipping)
                        : "Miễn phí"}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-base font-medium text-gray-900">
                        Tổng tiền thanh toán
                      </span>
                      <div className="text-base font-medium text-red-600">
                        {formatPrice(orderSummary.total - 25000)}
                      </div>
                    </div>
                    <div className="flex justify-end items-center mb-2">
                      <span className="text-sm text-green-600 mr-2">
                        Tiết kiệm:{" "}
                      </span>
                      <div className="text-sm text-green-600">35.000đ</div>
                    </div>
                    <div className="text-xs text-gray-500 text-center mt-2 px-4">
                      (Giá này đã bao gồm thuế GTGT, phí đóng gói, phí vận
                      chuyển và các chi phí phát sinh khác)
                    </div>
                  </div>
                </div>

                {/* Order button */}
                <div className="p-4 border-t">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-red-600 text-white py-3 px-4 rounded text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Đang xử lý..." : `Đặt hàng`}
                  </button>
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
