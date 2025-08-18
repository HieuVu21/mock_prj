import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getNames } from 'country-list';
import { 
  FiUser, FiBell, FiPackage, FiRefreshCw, FiCreditCard, FiMapPin, FiHeart, FiEye, FiAward, FiGift, FiShield, 
  FiPhone, FiMail, FiLock, FiTrash2 
} from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';
import Header from '../component/Header';
import Footer from '../component/Footer';
import { updateUser, getCurrentUser, getOrders, updateOrderStatus } from '../services/api';
import type { User } from '../interface/user.interface';
import type { Order } from '../interface/order.interface';

// Interface for the decoded token payload
interface DecodedToken {
  sub: string;
  email: string;
  username?: string;
  phone?: string;
  iat: number;
  exp: number;
}

const statusLabels: Record<Order['status'], string> = {
  pending: 'Chờ thanh toán',
  confirmed: 'Đang xử lý',
  shipping: 'Đang vận chuyển',
  delivered: 'Giao hàng thành công',
  cancelled: 'Đã hủy',
};

const formatCurrency = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + ' đ';

// Demo orders fallback when API has no data
const FAKE_ORDERS: Order[] = [
  {
    id: 'DH10001',
    userId: '1',
    customerName: 'Tiếp Nguyễn',
    items: [
      {
        book: { name: 'Gel nghệ Nano siêu hấp thu Decumar New (20g)', book_cover: '/anh/1.png', original_price: 75000, manufacturer: 'CVI Pharma' },
        quantity: 1,
      },
    ],
    totalPrice: 93000,
    status: 'delivered',
    shippingAddress: 'Hà Nội',
    paymentMethod: 'cod',
    createdAt: '2025-05-01T10:00:00Z',
  },
  {
    id: 'DH10002',
    userId: '1',
    customerName: 'Nam doãn',
    items: [
      {
        book: { name: 'Sữa Rửa Mặt Tinh Chất Nghệ E100 (50g)', book_cover: '/anh/2.png', original_price: 27000, manufacturer: 'LOTTE MART' },
        quantity: 1,
      },
    ],
    totalPrice: 27000,
    status: 'cancelled',
    shippingAddress: 'Hà Nội',
    paymentMethod: 'cod',
    createdAt: '2025-04-22T08:30:00Z',
  },
  {
    id: 'DH10003',
    userId: '1',
    customerName: 'Tiếp Nguyễn',
    items: [
      {
        book: { name: 'Cẩm Nang Cấu Trúc Tiếng Anh', book_cover: '/anh/3.png', original_price: 72498, manufacturer: 'trungthanh2018' },
        quantity: 1,
      },
    ],
    totalPrice: 72498,
    status: 'delivered',
    shippingAddress: 'Hà Nội',
    paymentMethod: 'vnpay',
    createdAt: '2025-04-20T10:00:00Z',
  },
];

const Profile = () => {
  const [selectedTab, setSelectedTab] = useState('profile');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [orderStatus, setOrderStatus] = useState<'all' | Order['status']>('all');
  const [orderSearch, setOrderSearch] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    nickName: '',
    birthDate: { day: '', month: '', year: '' },
    gender: '',
    nationality: '',
    phone: '',
    email: ''
  });

  const countries = getNames().sort();

  useEffect(() => {
    const loadUserProfile = async () => {
      const token = localStorage.getItem('token');
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
        let birthDateParts = { day: '', month: '', year: '' };
        if (userProfile.birthDay) {
          const dateParts = userProfile.birthDay.split('-');
          if (dateParts.length === 3) {
            birthDateParts = {
              year: dateParts[0] || '',
              month: dateParts[1] || '',
              day: dateParts[2] || ''
            };
          }
        }
        
        // Initialize form data with user information
        setFormData({
          fullName: userProfile.fullName || userProfile.name || '',
          nickName: userProfile.nickName || '',
          birthDate: birthDateParts,
          gender: userProfile.gender || '',
          nationality: userProfile.nationality || '',
          phone: userProfile.phone || '',
          email: userProfile.email || ''
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

  useEffect(() => {
    // Sync tab from URL
    if (location.pathname === '/profile/order') {
      setSelectedTab('orders');
    } else if (location.pathname === '/profile') {
      setSelectedTab('profile');
    }
  }, [location.pathname]);

  // Load orders when switching to orders tab
  useEffect(() => {
    const loadOrders = async () => {
      if (selectedTab !== 'orders') return;
      setIsLoadingOrders(true);
      try {
        if (!user?.id) {
          setOrders(FAKE_ORDERS);
          return;
        }
        const { data } = await getOrders({ userId: user.id, _sort: 'createdAt', _order: 'desc' });
        if (Array.isArray(data) && data.length > 0) {
          setOrders(data);
        } else {
          setOrders(FAKE_ORDERS);
        }
      } catch (error) {
        setOrders(FAKE_ORDERS);
      } finally {
        setIsLoadingOrders(false);
      }
    };

    loadOrders();
  }, [selectedTab, user?.id]);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      birthDate: {
        ...prev.birthDate,
        [name]: value
      }
    }));
  };

  const handleGenderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      gender: e.target.value
    }));
  };

  const handleSaveProfile = async () => {
    if (!user?.id) {
      toast.error("Không tìm thấy thông tin người dùng");
      return;
    }

    setIsLoading(true);
    try {
      // Format birth date
      const birthDay = formData.birthDate.day && formData.birthDate.month && formData.birthDate.year
        ? `${formData.birthDate.year}-${formData.birthDate.month.padStart(2, '0')}-${formData.birthDate.day.padStart(2, '0')}`
        : '';

      const updateData = {
        fullName: formData.fullName,
        nickName: formData.nickName,
        birthDay,
        gender: formData.gender,
        nationality: formData.nationality,
        phone: formData.phone,
        address: user.address || '' // Keep existing address
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

  const handleChangeStatus = async (orderId: string | number, next: Order['status']) => {
    try {
      setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status: next } : o)));
      await updateOrderStatus(orderId, next);
      toast.success('Cập nhật trạng thái thành công');
    } catch (err: any) {
      toast.error('Cập nhật thất bại trên server (đang dùng dữ liệu demo)');
    }
  };

  const handleCancelOrder = async (orderId: string | number) => {
    try {
      setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status: 'cancelled' } : o)));
      await updateOrderStatus(orderId, 'cancelled');
      toast.success('Hủy đơn hàng thành công');
    } catch (err: any) {
      toast.error('Hủy đơn hàng thất bại (đang dùng dữ liệu demo)');
    }
  };

  const sidebarLinks = [
    { icon: <FiUser className="text-xl" />, text: 'Thông tin tài khoản', value: 'profile' },
    { icon: <FiBell className="text-xl" />, text: 'Thông báo của tôi', value: 'notifications' },
    { icon: <FiPackage className="text-xl" />, text: 'Quản lý đơn hàng', value: 'orders' },
    { icon: <FiRefreshCw className="text-xl" />, text: 'Quản lý đổi trả', value: 'returns' },
    { icon: <FiMapPin className="text-xl" />, text: 'Sổ địa chỉ', value: 'addresses' },
    { icon: <FiCreditCard className="text-xl" />, text: 'Thông tin thanh toán', value: 'payment' },
    { icon: <FiHeart className="text-xl" />, text: 'Sản phẩm yêu thích', value: 'wishlist' },
    { icon: <FiEye className="text-xl" />, text: 'Sản phẩm bạn đã xem', value: 'viewed' },
    { icon: <FiAward className="text-xl" />, text: 'Nhận xét của tôi', value: 'reviews' },
    { icon: <FiGift className="text-xl" />, text: 'Mã giảm giá', value: 'vouchers' },
  ];

  const filteredOrders = orders
    .filter(o => (orderStatus === 'all' ? true : o.status === orderStatus))
    .filter(o => {
      if (!orderSearch.trim()) return true;
      const keyword = orderSearch.toLowerCase();
      const inId = String(o.id).toLowerCase().includes(keyword);
      const inItems = o.items?.some(i => (i.book?.name || '').toLowerCase().includes(keyword));
      return inId || inItems;
    });

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
      <div className="container mx-auto px-4 py-6 mb-6">
        <div className="flex items-center text-sm text-[#808089] mb-4">
          <Link to="/" className="hover:text-[#0d5cb6]">Trang chủ</Link>
          <span className="mx-2">&gt;</span>
          <span>Thông tin tài khoản</span>
        </div>
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-1/4">
            <div className="flex items-center gap-4 mb-6">
              <img src="/tiki-icon.png" alt="Avatar" className="w-12 h-12 rounded-full" />
              <div>
                <div className="font-semibold text-lg">
                  {user?.fullName || user?.name || 'Tài khoản'}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {sidebarLinks.map((link) => (
                <div
                  key={link.value}
                  className={`flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-gray-100 ${
                    selectedTab === link.value ? 'text-[#0d5cb6] bg-gray-100' : 'text-gray-600'
                  }`}
                  onClick={() => {
                    setSelectedTab(link.value);
                    if (link.value === 'orders') navigate('/profile/order');
                    if (link.value === 'profile') navigate('/profile');
                  }}
                >
                  {link.icon}
                  <span className="text-sm">{link.text}</span>
                </div>
              ))}
              <div className="flex items-center gap-3 p-2 cursor-pointer hover:bg-gray-100 text-blue-600">
                <FiShield className="text-xl" />
                <div className="text-sm">
                  <div>Tiki VIP</div>
                  <div className="text-xs text-gray-500">Thành viên</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          {selectedTab === 'profile' && (
            <div className="flex-1 bg-white rounded-lg p-6 shadow-sm">
              <h1 className="text-xl font-bold mb-6">Thông tin tài khoản</h1>
              
              <div className="grid grid-cols-2 gap-8">
                {/* Left Column - Personal Info */}
                <div>
                  <h2 className="font-medium mb-4">Thông tin cá nhân</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-600 mb-1">Họ & Tên</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded outline-none focus:border-[#0d5cb6]"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">Nickname</label>
                      <input
                        type="text"
                        name="nickName"
                        value={formData.nickName}
                        onChange={handleInputChange}
                        placeholder="Thêm nickname"
                        className="w-full p-2 border rounded outline-none focus:border-[#0d5cb6]"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">Ngày sinh</label>
                      <div className="grid grid-cols-3 gap-2">
                        <select 
                          name="day" 
                          value={formData.birthDate.day} 
                          onChange={handleDateChange} 
                          className="p-2 border rounded outline-none focus:border-[#0d5cb6]"
                        >
                          <option value="">Ngày</option>
                          {days.map((d) => (
                            <option key={d} value={d}>{d}</option>
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
                            <option key={m} value={m}>{m}</option>
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
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">Giới tính</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                          <input 
                            type="radio" 
                            name="gender" 
                            value="male" 
                            checked={formData.gender === 'male'}
                            onChange={handleGenderChange}
                          />
                          <span>Nam</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input 
                            type="radio" 
                            name="gender" 
                            value="female" 
                            checked={formData.gender === 'female'}
                            onChange={handleGenderChange}
                          />
                          <span>Nữ</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input 
                            type="radio" 
                            name="gender" 
                            value="other" 
                            checked={formData.gender === 'other'}
                            onChange={handleGenderChange}
                          />
                          <span>Khác</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">Quốc tịch</label>
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
                    <button 
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                      className="bg-[#0d5cb6] text-white px-6 py-2 rounded hover:bg-[#0a4d9a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                  </div>
                </div>

                {/* Right Column - Contact & Security */}
                <div className="divide-y divide-gray-200">
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Số điện thoại và Email</h2>
                    <div className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-3">
                        <FiPhone className="text-gray-400 text-xl"/>
                        <div>
                          <div>Số điện thoại</div>
                          <div className="text-gray-500">{formData.phone || 'Chưa cập nhật'}</div>
                        </div>
                      </div>
                      <button className="text-blue-600 font-semibold text-sm border border-blue-600 rounded px-4 py-1.5 hover:bg-blue-50">Cập nhật</button>
                    </div>
                    <div className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-3">
                        <FiMail className="text-gray-400 text-xl"/>
                        <div>
                          <div>Địa chỉ email</div>
                          <div className="text-gray-500">{formData.email || 'Chưa cập nhật'}</div>
                        </div>
                      </div>
                      <button className="text-blue-600 font-semibold text-sm border border-blue-600 rounded px-4 py-1.5 hover:bg-blue-50">Cập nhật</button>
                    </div>
                  </div>

                  <div className="pt-4">
                    <h2 className="text-lg font-semibold mb-2">Bảo mật</h2>
                    <div className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-3"><FiLock className="text-gray-400 text-xl"/><span>Thiết lập mật khẩu</span></div>
                      <button className="text-blue-600 font-semibold text-sm border border-blue-600 rounded px-4 py-1.5 hover:bg-blue-50">Cập nhật</button>
                    </div>
                    <div className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-3"><FiShield className="text-gray-400 text-xl"/><span>Thiết lập mã PIN</span></div>
                      <button className="text-blue-600 font-semibold text-sm border border-blue-600 rounded px-4 py-1.5 hover:bg-blue-50">Thiết lập</button>
                    </div>
                    <div className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-3"><FiTrash2 className="text-gray-400 text-xl"/><span>Yêu cầu xóa tài khoản</span></div>
                      <button className="text-blue-600 font-semibold text-sm border border-blue-600 rounded px-4 py-1.5 hover:bg-blue-50">Yêu cầu</button>
                    </div>
                  </div>

                  <div className="pt-4">
                    <h2 className="text-lg font-semibold mb-2">Liên kết mạng xã hội</h2>
                    <div className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-3">
                        <img src="/social/facebook.png" alt="Facebook" className="w-6 h-6" />
                        <span>Facebook</span>
                      </div>
                      <button className="text-blue-600 font-semibold text-sm border border-blue-600 rounded px-4 py-1.5 hover:bg-blue-50">Liên kết</button>
                    </div>
                    <div className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-3">
                        <img src="https://frontend.tikicdn.com/_desktop-next/static/img/account/google.png" alt="Google" className="w-6 h-6" />
                        <span>Google</span>
                      </div>
                      <span className="text-gray-500 text-sm">Đã liên kết</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'orders' && (
            <div className="flex-1 bg-white rounded-lg p-6 shadow-sm">
              <h1 className="text-xl font-semibold mb-4">Đơn hàng của tôi</h1>

              {/* Tabs */}
              <div className="flex gap-4 mb-4">
                {[
                  { key: 'all', label: 'Tất cả đơn' },
                  { key: 'pending', label: 'Chờ thanh toán' },
                  { key: 'confirmed', label: 'Đang xử lý' },
                  { key: 'shipping', label: 'Đang vận chuyển' },
                  { key: 'delivered', label: 'Đã giao' },
                  { key: 'cancelled', label: 'Đã hủy' },
                ].map(t => (
                  <button
                    key={t.key}
                    onClick={() => {
                      if (selectedTab !== 'orders') navigate('/profile/order');
                      setOrderStatus(t.key as any);
                    }}
                    className={`px-3 py-2 text-sm border-b-2 -mb-[2px] ${orderStatus === (t.key as any) ? 'border-[#0d5cb6] text-[#0d5cb6] font-semibold' : 'border-transparent text-gray-600'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="mb-4">
                <div className="flex items-center border border-gray-300 rounded w-full overflow-hidden">
                  <input
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="flex-1 px-3 py-2 outline-none"
                    placeholder="Tìm đơn theo Mã đơn hàng, Nhà bán hoặc Tên sản phẩm"
                  />
                  <span className="text-gray-400 px-2">|</span>
                  <button
                    onClick={() => setOrderSearch(orderSearch.trim())}
                    className="px-3 py-2 text-[#0d5cb6] text-sm hover:bg-blue-50"
                  >
                    Tìm đơn hàng
                  </button>
                </div>
              </div>

              {/* List */}
              {isLoadingOrders ? (
                <div className="flex items-center justify-center h-40">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d5cb6] mx-auto mb-4"></div>
                    <p>Đang tải danh sách đơn hàng...</p>
                  </div>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <img src="/emptycart.png" alt="empty" className="w-32 mx-auto mb-3" />
                  <p>Không có đơn hàng phù hợp</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="border border-gray-300 rounded-lg overflow-hidden">
                      <div className="px-4 py-2 bg-gray-50 text-sm text-gray-600 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                        <span className="font-medium">{statusLabels[order.status]}</span>
                        <span className="text-gray-400">•</span>
                        <span>Mã đơn: {order.id}</span>
                      </div>

                      <div className="p-4">
                        {/* First item preview */}
                        {order.items?.slice(0, 1).map((item, idx) => (
                          <div key={idx} className="flex items-start gap-4">
                            <div className="relative">
                              <img
                                className="w-16 h-16 object-contain rounded border border-gray-300"
                                src={item.book?.images?.[0]?.thumbnail_url || item.book?.book_cover || '/emptycart.png'}
                                alt={item.book?.name || 'Book'}
                              />
                              <span className="absolute -bottom-0 right-0 text-xs px-1 rounded bg-gray-100 border border-gray-300" style={{color: '#0d5cb6'}}>x{item.quantity}</span>
                            </div>
                            <div className="flex-1">
                              <div className="text-sm line-clamp-2 mb-1">{item.book?.name}</div>
                              <div className="text-gray-500 text-xs">{item.book?.manufacturer}</div>
                            </div>
                            <div className="text-right text-lg text-gray-700 min-w-[120px]">
                              {formatCurrency(item.book?.original_price || 0)}
                            </div>
                          </div>
                        ))}

                        {/* If more items */}
                        {order.items?.length > 1 && (
                          <div className="text-xs text-gray-500 mt-2">+{order.items.length - 1} sản phẩm khác</div>
                        )}

                        <div className="flex items-center justify-between mt-4">
                          <div></div>
                          <div className="flex items-center gap-3 flex-col">
                            <div className="flex items-center gap-3">
                            <div className="text-lg " style={{color: '#808089'}}>Tổng tiền:</div>
                            <div className="text-[#0d5cb6] text-xl font-semibold">{formatCurrency(order.totalPrice)}</div>
                            </div>
                            <div className="flex items-center gap-3">
                            <button className="ml-4 text-sm px-4 py-1.5 border rounded text-blue-600 border-blue-600 hover:bg-blue-50">Mua lại</button>
                            <Link to={`/orders/${order.id}`} state={{ order }} className="text-sm px-4 py-1.5 border rounded hover:bg-gray-50">Xem chi tiết</Link>
                            {order.status === 'confirmed' && (
                              <button 
                                onClick={() => handleCancelOrder(order.id)}
                                className="text-sm px-4 py-1.5 border border-red-600 rounded text-red-600 hover:bg-red-50"
                              >
                                Hủy đơn
                              </button>
                            )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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