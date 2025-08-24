import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getNames } from "country-list";

// Local interface for the order item display
interface DisplayOrderItem {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  book?: any;
}

// Local interface for the order display
interface DisplayOrder {
  id: string;
  date: string;
  status: string;
  total: number;
  items: DisplayOrderItem[];
  createdAt?: string;
  totalPrice?: number;
  userId: string;  // Changed from string | number to string
  user?: any;
  shippingAddress?: string;
  paymentMethod?: string;
  customerName?: string;
  phone?: string;
}

import {
  FiUser,
  FiBell,
  FiPackage,
  FiRefreshCw,
  FiCreditCard,
  FiMapPin,
  FiHeart,
  FiEye,
  FiAward,
  FiGift,
  FiShield,
  FiPhone,
  FiMail,
  FiLock,
  FiTrash2,
} from "react-icons/fi";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import Header from "../component/Header";
import Footer from "../component/Footer";
import { updateUser, getCurrentUser, getOrders } from "../services/api";
import type { User } from "../interface/user.interface";
import { OrderStatus } from "../interface/order.interface";
import OrderDetails from "../component/OrderDetails";

// Helper function to get status text in Vietnamese
const getStatusText = (status: string | null): string => {
  switch (status) {
    case 'pending':
      return 'Chờ xác nhận';
    case 'confirmed':
      return 'Đã xác nhận';
    case 'shipping':
      return 'Đang giao hàng';
    case 'cancelled':
      return 'Đã hủy';
    case 'failed':
      return 'Giao hàng thất bại';
    case 'shipped':
      return 'Đã giao'
    default:
      return status || '';
  }
};

// Interface for the decoded token payload
interface DecodedToken {
  sub: string;
  email: string;
  username?: string;
  phone?: string;
  iat: number;
  exp: number;
}

const Profile = () => {
  const [selectedTab, setSelectedTab] = useState("profile");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<DisplayOrder | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [orders, setOrders] = useState<DisplayOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Handle search functionality
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    const filtered = orders.filter(order => {
      // Search by order ID
      if (order.id.toLowerCase().includes(searchQuery.toLowerCase())) {
        return true;
      }
      
      // Search by product name in order items
      if (order.items?.some(item => 
        item.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )) {
        return true;
      }
      
      return false;
    });
    
    return filtered;
  };
  
  // Get filtered orders based on status and search query
  const getFilteredOrders = () => {
    let result = [...orders];
    
    // Apply status filter
    if (orderStatusFilter) {
      result = result.filter(order => order.status === orderStatusFilter);
    }
    
    // Apply search filter if there's a search query
    if (searchQuery.trim()) {
      result = handleSearch() || [];
    }
    
    return result;
  };
  
  const filteredOrders = getFilteredOrders();

  // Fetch orders from backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        
        // Get user ID from auth data
        const authData = JSON.parse(localStorage.getItem('auth') || '{}');
        const userId = authData?.user?.id;
        
        if (!userId) {
          console.error('❌ Không tìm thấy userId trong auth data');
          toast.error('Vui lòng đăng nhập để xem đơn hàng');
          setIsLoading(false);
          return;
        }

        // Fetch orders for the current user
        console.log('🔄 Bắt đầu lấy đơn hàng cho userId:', userId, '(type:', typeof userId, ')');
        
        // Get authentication token
        const token = localStorage.getItem('token');
        console.log('🔑 Token exists:', !!token);
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        // Ensure userId is a string for the API
        const userIdStr = String(userId);
        console.log('🔍 Gọi API getOrders với userId:', userIdStr, '(type:', typeof userIdStr, ')');
        
        // Fetch orders with the user's ID and token
        const response = await getOrders({ 
          userId: userIdStr,
          isAdmin: false // Explicitly set isAdmin to false for regular users
        });
        console.log('🔑 Token được sử dụng:', token.substring(0, 10) + '...');
        console.log('📡 Phản hồi từ API:', {
          status: response.status,
          ok: response.ok,
          dataLength: response.data?.length || 0,
          firstOrder: response.data?.[0] || 'No orders'
        });
        
        if (!response || !response.ok || !response.data) {
          throw new Error(`Lỗi từ API: ${response?.status} ${response?.statusText}`);
        }
        
        const ordersData = response.data || [];
        
        console.log('✅ Dữ liệu đơn hàng nhận được từ API:', {
          responseStatus: response?.status,
          orderCount: ordersData.length,
          firstOrder: ordersData[0] ? {
            id: ordersData[0].id,
            status: ordersData[0].status,
            itemCount: ordersData[0].items?.length || 0
          } : 'Không có đơn hàng nào'
        });
        
        // Transform the data to match our component's expectations
        const formattedOrders: DisplayOrder[] = ordersData.map((order: any) => {
          const formattedOrder = {
            ...order,
            userId: String(order.userId || ''), // Ensure userId is a string
            date: order.createdAt,
            total: order.totalPrice || 0,
            items: (order.items || []).map((item: any) => ({
              ...item,
              name: item.book?.name || 'Sản phẩm không có tên',
              price: item.book?.list_price || 0,
              image: item.book?.images?.[0]?.thumbnail_url || 'https://via.placeholder.com/200',
              quantity: item.quantity || 1
            }))
          };
          
          console.log(`📦 Đơn hàng #${formattedOrder.id} - ${formattedOrder.status} - ${formattedOrder.items.length} sản phẩm`);
          return formattedOrder;
        });
        
        console.log(`✅ Đã tải thành công ${formattedOrders.length} đơn hàng`);
        setOrders(formattedOrders);
      } catch (error) {
        console.error('Lỗi khi tải đơn hàng:', error);
        toast.error('Có lỗi xảy ra khi tải đơn hàng');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const [editingField, setEditingField] = useState<"phone" | "email" | null>(
    null
  );
  const [tempValue, setTempValue] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    nickName: "",
    birthDate: { day: "", month: "", year: "" },
    gender: "",
    nationality: "",
    phone: "",
    email: "",
  });

  const countries = getNames().sort();

  useEffect(() => {
    const loadUserProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Vui lòng đăng nhập");
        return;
      }

      try {
        // Decode token to get basic info
        const decodedToken: DecodedToken = jwtDecode(token);

        // Fetch full user profile from API
        const { data: userProfile } = await getCurrentUser();
        setUser(userProfile);

        // Parse birth date if exists
        let birthDateParts = { day: "", month: "", year: "" };
        if (userProfile.birthDay) {
          const dateParts = userProfile.birthDay.split("-");
          if (dateParts.length === 3) {
            birthDateParts = {
              year: dateParts[0],
              month: dateParts[1],
              day: dateParts[2],
            };
          }
        }

        // Initialize form data with user information
        setFormData({
          fullName: userProfile.fullName || "",
          nickName: userProfile.nickName || "",
          birthDate: birthDateParts,
          gender: userProfile.gender || "",
          nationality: userProfile.nationality || "",
          phone: userProfile.phone || "",
          email: userProfile.email || "",
        });
      } catch (error: any) {
        console.error("Failed to load user profile:", error);
        toast.error("Không thể tải thông tin người dùng");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadUserProfile();
  }, []);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      birthDate: {
        ...prev.birthDate,
        [name]: value,
      },
    }));
  };

  const handleGenderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      gender: e.target.value,
    }));
  };

  const handleUpdateField = async (field: "phone" | "email") => {
    if (!user?.id) {
      toast.error("Không tìm thấy thông tin người dùng");
      return;
    }

    if (!tempValue.trim()) {
      toast.error(
        `Vui lòng nhập ${field === "phone" ? "số điện thoại" : "email"}`
      );
      return;
    }

    setIsLoading(true);
    try {
      const updateData = {
        ...user,
        [field]: tempValue.trim(),
      };

      const { data: updatedUser } = await updateUser(user.id, updateData);
      setUser(updatedUser);
      setFormData((prev) => ({
        ...prev,
        [field]: tempValue.trim(),
      }));
      setEditingField(null);
      setTempValue("");
      toast.success(
        `Cập nhật ${field === "phone" ? "số điện thoại" : "email"} thành công!`
      );
    } catch (error: any) {
      console.error(`Error updating ${field}:`, error);
      toast.error(
        error.message ||
          `Có lỗi xảy ra khi cập nhật ${
            field === "phone" ? "số điện thoại" : "email"
          }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartEditing = (field: "phone" | "email") => {
    setEditingField(field);
    setTempValue(formData[field] || "");
  };

  const handleCancelEditing = () => {
    setEditingField(null);
    setTempValue("");
  };

  const handleSaveProfile = async () => {
    if (!user?.id) {
      toast.error("Không tìm thấy thông tin người dùng");
      return;
    }

    setIsLoading(true);
    try {
      // Format birth date
      const birthDay =
        formData.birthDate.day &&
        formData.birthDate.month &&
        formData.birthDate.year
          ? `${formData.birthDate.year}-${formData.birthDate.month.padStart(
              2,
              "0"
            )}-${formData.birthDate.day.padStart(2, "0")}`
          : "";

      const updateData = {
        fullName: formData.fullName,
        nickName: formData.nickName,
        birthDay,
        // Lưu cả birthDate để giữ ngày/tháng/năm riêng biệt
        birthDate: formData.birthDate,
        gender: formData.gender,
        nationality: formData.nationality,
        phone: formData.phone,
        address: user.address || "", // Keep existing address
        // Giữ nguyên email và password để không làm mất credentials
        email: user.email,
        password: user.password,
        role: user.role,
      };

      const { data: updatedUser } = await updateUser(user.id, updateData);
      toast.success("Cập nhật thông tin thành công!");

      // Update local user state
      setUser(updatedUser);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật thông tin");
    } finally {
      setIsLoading(false);
    }
  };

  const sidebarLinks = [
    {
      icon: <FiUser className="text-xl" />,
      text: "Thông tin tài khoản",
      value: "profile",
    },
    {
      icon: <FiBell className="text-xl" />,
      text: "Thông báo của tôi",
      value: "notifications",
    },
    {
      icon: <FiPackage className="text-xl" />,
      text: "Quản lý đơn hàng",
      value: "orders",
    },
  ];

  if (isLoadingProfile) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-6 mb-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d5cb6] mx-auto mb-4"></div>
              <p>Đang tải thông tin người dùng...</p>
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
      <div className="container mx-auto px-12 py-6 mb-6">
        <div className="flex items-center text-sm text-[#808089] mb-4">
          <Link to="/" className="hover:text-[#0d5cb6]">
            Trang chủ
          </Link>
          <span className="mx-2">&gt;</span>
          <span>Thông tin tài khoản</span>
        </div>
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-1/4">
            <div className="flex items-center gap-4 mb-6">
              <img
                src="/avatar.png"
                alt="Avatar"
                className="w-12 h-12 rounded-full"
              />
              <div>
                <div className="font-semibold text-lg">
                  {user?.fullName || "Tài khoản"}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {sidebarLinks.map((link) => (
                <div
                  key={link.value}
                  className={`flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-gray-100 ${
                    selectedTab === link.value
                      ? "text-[#0d5cb6] bg-gray-100"
                      : "text-gray-600"
                  }`}
                  onClick={() => setSelectedTab(link.value)}
                >
                  {link.icon}
                  <span className="text-sm">{link.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          {selectedTab === "profile" && (
            <div className="flex-1">
              <h1 className="text-xl font-semibold mb-6">
                Thông tin tài khoản
              </h1>
              <div className="flex-1 bg-white rounded-lg p-6 shadow-sm">
                <div className="grid grid-cols-5 gap-8">
                  {/* Left Column (Avatar + labels) */}
                  <div className="flex flex-col col-span-1 items-start space-y-6">
                    {/* Avatar */}
                    <div className="flex flex-col items-center w-full">
                      <div className="relative w-32 h-32">
                        <div className="w-full h-full rounded-full bg-[#F0F8FF] flex items-center justify-center overflow-hidden border-4 border-[#C2E1FF]">
                          <img
                            src="/user_defau.png"
                            alt="User Avatar"
                            className="w-12 h-12 object-cover"
                          />
                        </div>
                        <div className="absolute bottom-1 right-1 w-8 h-8 flex items-center justify-center">
                          <img
                            src="/ic_edit.png"
                            alt="Edit"
                            className="w-4 h-4"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Labels */}
                    <label className="text-sm text-gray-600 !ml-4">
                      Ngày sinh
                    </label>
                    <label className="text-sm text-gray-600 !mt-10 !ml-4">
                      Giới tính
                    </label>
                    <label className="text-sm text-gray-600 !mt-10 !ml-4">
                      Quốc tịch
                    </label>
                  </div>

                  {/* Middle Column (all inputs) */}
                  <div className="col-span-2 space-y-6 border-r border-gray-200 pr-6">
                    {/* Họ & Tên */}
                    <div className="flex items-center">
                      <label className="w-32 text-sm text-gray-600">
                        Họ & Tên
                      </label>
                      <div className="flex-1">
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </div>
                    </div>

                    {/* Nickname */}
                    <div className="flex items-center">
                      <label className="w-32 text-sm text-gray-600">
                        Nickname
                      </label>
                      <div className="flex-1">
                        <input
                          type="text"
                          name="nickName"
                          value={formData.nickName}
                          onChange={handleInputChange}
                          placeholder="Thêm nickname"
                          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-400"
                        />
                      </div>
                    </div>

                    {/* Ngày sinh */}
                    <div className="!mt-12">
                      <div className="grid grid-cols-3 gap-2 w-full">
                        <select
                          name="day"
                          value={formData.birthDate.day}
                          onChange={handleDateChange}
                          className="p-2 border rounded outline-none focus:border-[#0d5cb6]"
                        >
                          <option value="">Ngày</option>
                          {days.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                        <select
                          name="month"
                          value={formData.birthDate.month}
                          onChange={handleDateChange}
                          className="p-2 border rounded outline-none focus:border-[#0d5cb6]"
                        >
                          <option value="">Tháng</option>
                          {months.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                        <select
                          name="year"
                          value={formData.birthDate.year}
                          onChange={handleDateChange}
                          className="p-2 border rounded outline-none focus:border-[#0d5cb6]"
                        >
                          <option value="">Năm</option>
                          {years.map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Giới tính */}
                    <div>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="gender"
                            value="male"
                            checked={formData.gender === "male"}
                            onChange={handleGenderChange}
                          />
                          <span>Nam</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="gender"
                            value="female"
                            checked={formData.gender === "female"}
                            onChange={handleGenderChange}
                          />
                          <span>Nữ</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="gender"
                            value="other"
                            checked={formData.gender === "other"}
                            onChange={handleGenderChange}
                          />
                          <span>Khác</span>
                        </label>
                      </div>
                    </div>

                    {/* Quốc tịch */}
                    <div>
                      <select
                        name="nationality"
                        className="w-full p-2 border rounded outline-none focus:border-[#0d5cb6]"
                        value={formData.nationality}
                        onChange={handleInputChange}
                      >
                        <option value="">Chọn quốc tịch</option>
                        {countries.map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Nút lưu */}
                    <button
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                      className="bg-[#0B74E5] text-white w-60 px-6 py-2 rounded hover:bg-[#0a4d9a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                  </div>

                  {/* Right Column - Contact & Security */}
                  <div className="divide-y divide-gray-200 col-span-2">
                    <div>
                      <h2 className="font-semibold mb-2">
                        Số điện thoại và Email
                      </h2>
                      <div className="py-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <FiPhone className="text-gray-400 text-xl" />
                            <div className="font-medium">Số điện thoại</div>
                          </div>
                          {editingField === "phone" ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdateField("phone")}
                                disabled={isLoading}
                                className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                              >
                                Lưu
                              </button>
                              <button
                                onClick={handleCancelEditing}
                                className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                              >
                                Hủy
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleStartEditing("phone")}
                              className="text-blue-600 font-semibold text-sm border border-blue-600 rounded px-4 py-1.5 hover:bg-blue-50"
                            >
                              Cập nhật
                            </button>
                          )}
                        </div>
                        {editingField === "phone" ? (
                          <input
                            type="tel"
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            className="w-full p-2 border rounded mt-2"
                            placeholder="Nhập số điện thoại"
                          />
                        ) : (
                          <div className="text-gray-600 mt-1">
                            {formData.phone || "Chưa cập nhật"}
                          </div>
                        )}
                      </div>

                      <div className="py-4 border-t">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <FiMail className="text-gray-400 text-xl" />
                            <div className="font-medium">Địa chỉ email</div>
                          </div>
                          {editingField === "email" ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdateField("email")}
                                disabled={isLoading}
                                className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                              >
                                Lưu
                              </button>
                              <button
                                onClick={handleCancelEditing}
                                className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                              >
                                Hủy
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleStartEditing("email")}
                              className="text-blue-600 font-semibold text-sm border border-blue-600 rounded px-4 py-1.5 hover:bg-blue-50"
                            >
                              Cập nhật
                            </button>
                          )}
                        </div>
                        {editingField === "email" ? (
                          <input
                            type="email"
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            className="w-full p-2 border rounded mt-2"
                            placeholder="Nhập địa chỉ email"
                          />
                        ) : (
                          <div className="text-gray-600 mt-1">
                            {formData.email || "Chưa cập nhật"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {selectedTab === "orders" && (
            <div className="flex-1">
              {selectedOrder ? (
                <OrderDetails 
                  order={selectedOrder} 
                  onBack={() => setSelectedOrder(null)} 
                />
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h1 className="text-xl font-semibold">Đơn hàng của tôi</h1>
                  </div>

                  {/* Order Status Tabs */}
                  <div className="bg-white rounded overflow-hidden mb-6 border-b">
                    <div className="grid grid-cols-6">
                      <button
                        onClick={() => setOrderStatusFilter(null)}
                        className={`py-3 text-sm font-medium whitespace-nowrap text-center ${
                          orderStatusFilter === null
                            ? "text-blue-600 border-b-2 border-blue-600 font-semibold"
                            : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                        }`}
                      >
                        Tất cả đơn
                      </button>
                      <button
                        onClick={() => setOrderStatusFilter("pending")}
                        className={`py-3 text-sm font-medium whitespace-nowrap text-center ${
                          orderStatusFilter === "pending"
                            ? "text-blue-600 border-b-2 border-blue-600 font-semibold"
                            : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                        }`}
                      >
                        Chờ xác nhận
                      </button>
                      <button
                        onClick={() => setOrderStatusFilter("confirmed")}
                        className={`py-3 text-sm font-medium whitespace-nowrap text-center ${
                          orderStatusFilter === "confirmed"
                            ? "text-blue-600 border-b-2 border-blue-600 font-semibold"
                            : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                        }`}
                      >
                        Đã xác nhận
                      </button>
                      <button
                        onClick={() => setOrderStatusFilter("shipping")}
                        className={`py-3 text-sm font-medium whitespace-nowrap text-center ${
                          orderStatusFilter === "shipping"
                            ? "text-blue-600 border-b-2 border-blue-600 font-semibold"
                            : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                        }`}
                      >
                        Đang giao hàng
                      </button>
                      <button
                        onClick={() => setOrderStatusFilter("shipped")}
                        className={`py-3 text-sm font-medium whitespace-nowrap text-center ${
                          orderStatusFilter === "shipped"
                            ? "text-blue-600 border-b-2 border-blue-600 font-semibold"
                            : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                        }`}
                      >
                        Đã giao
                      </button>
                      <button
                        onClick={() => setOrderStatusFilter("cancelled")}
                        className={`py-3 text-sm font-medium whitespace-nowrap text-center ${
                          orderStatusFilter === "cancelled"
                            ? "text-blue-600 border-b-2 border-blue-600 font-semibold"
                            : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                        }`}
                      >
                        Đã hủy
                      </button>
                    </div>
                  </div>

                  <div className="relative my-4">
                    <div className="relative flex">
                      <input
                        type="text"
                        placeholder="Tìm kiếm đơn hàng..."
                        className="w-full pl-10 pr-24 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <svg
                        className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <button
                        className="absolute right-0 h-full px-4 text-[#1877f2] divide-x border-l focus:outline-none focus:ring-offset-1"
                        onClick={() => {
                          // Trigger search when the button is clicked
                          getFilteredOrders();
                        }}
                        onKeyDown={(e) => {
                          // Trigger search on Enter key
                          if (e.key === 'Enter') {
                            getFilteredOrders();
                          }
                        }}
                      >
                        Tìm kiếm đơn
                      </button>
                    </div>
                  </div>

                  <div className="shadow-sm">
                    {filteredOrders.length === 0 ? (
                  <div className="text-center py-16">
                    <FiPackage className="mx-auto text-5xl text-gray-300 mb-4" />
                    <p className="text-gray-600 text-lg mb-6">
                      {searchQuery.trim()
                        ? 'Không tìm thấy đơn hàng phù hợp'
                        : orderStatusFilter
                          ? `Không có đơn hàng nào ${getStatusText(orderStatusFilter).toLowerCase()}`
                          : 'Bạn chưa có đơn hàng nào'}
                    </p>
                    
                  </div>
                ) : (
                  <div className="divide-y border bg-white">
                    {filteredOrders.map((order) => (
                        <div key={order.id} className="p-5 hover:bg-gray-50">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="text-sm text-gray-500 mb-1">
                                Mã đơn hàng:{" "}
                                <span className="text-gray-900 font-medium">
                                  {order.id}
                                </span>
                              </p>
                              <p className="text-sm text-gray-500">
                                Ngày đặt:{" "}
                                <span className="text-gray-900">
                                  {order.date || order.createdAt}
                                </span>
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                order.status === "delivered" || order.status === "shipped"
                                  ? "bg-green-100 text-green-800"
                                  : order.status === "shipping" ||
                                    order.status === "out_for_delivery"
                                  ? "bg-blue-100 text-blue-800"
                                  : order.status === "cancelled" ||
                                    order.status === "failed"
                                  ? "bg-red-100 text-red-800" 
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {getStatusText(order.status)}
                            </span>
                          </div>

                          <div className="border rounded-md divide-y">
                            {order.items?.map((item, index) => (
                              <div
                                key={index}
                                className="p-4 flex items-center justify-between"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                    {item.image ? (
                                      <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                        <FiPackage className="text-gray-300 text-2xl" />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900 line-clamp-2">
                                      {item.name}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                      Số lượng: {item.quantity}
                                    </p>
                                    <p className="text-red-600 font-medium mt-1">
                                      {new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                      }).format(
                                        item.price * (item.quantity || 1)
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-between items-center mt-4 pt-4 border-t">
                            <div className="text-sm">
                              <span className="text-gray-500">
                                Thành tiền:{" "}
                              </span>
                              <span className="text-red-600 font-medium text-lg">
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format(order.total || order.totalPrice || 0)}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => setSelectedOrder(order)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-50"
                              >
                                Xem chi tiết
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;
