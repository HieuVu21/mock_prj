import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getNames } from 'country-list';
import { 
  FiUser, FiBell, FiPackage, FiRefreshCw, FiCreditCard, FiMapPin, FiHeart, FiEye, FiAward, FiGift, FiShield, 
  FiPhone, FiMail, FiLock, FiTrash2 
} from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';
import Header from '../component/Header';
import Footer from '../component/Footer';

// Interface for the decoded token payload
interface DecodedToken {
  id: number;
  email: string;
  username: string;
  phone: string;
  iat: number;
}

const Profile = () => {
  const [selectedTab, setSelectedTab] = useState('profile');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [username, setUsername] = useState('');
  const [birthDate, setBirthDate] = useState({ day: '', month: '', year: '' });
  const countries = getNames().sort();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: DecodedToken = jwtDecode(token);
        setUser(decodedToken);
        setUsername(decodedToken.username || '');
      } catch (error) {
        console.error("Failed to decode token:", error);
        // Handle invalid token, e.g., by logging out the user
      }
    }
  }, []);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBirthDate(prev => ({ ...prev, [name]: value }));
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
                <div className="font-semibold text-lg">{user?.username || 'Tài khoản'}</div>
              </div>
            </div>
            <div className="space-y-2">
              {sidebarLinks.map((link) => (
                <div
                  key={link.value}
                  className={`flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-gray-100 ${
                    selectedTab === link.value ? 'text-[#0d5cb6] bg-gray-100' : 'text-gray-600'
                  }`}
                  onClick={() => setSelectedTab(link.value)}
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
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-2 border rounded outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">Nickname</label>
                      <input
                        type="text"
                        placeholder="Thêm nickname"
                        className="w-full p-2 border rounded outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">Ngày sinh</label>
                      <div className="grid grid-cols-3 gap-2">
                        <select name="day" value={birthDate.day} onChange={handleDateChange} className="p-2 border rounded outline-none">
                          <option value="">Ngày</option>
                          {days.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <select name="month" value={birthDate.month} onChange={handleDateChange} className="p-2 border rounded outline-none">
                          <option value="">Tháng</option>
                          {months.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <select name="year" value={birthDate.year} onChange={handleDateChange} className="p-2 border rounded outline-none">
                          <option value="">Năm</option>
                          {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">Giới tính</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                          <input type="radio" name="gender" value="male" />
                          <span>Nam</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="radio" name="gender" value="female" />
                          <span>Nữ</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="radio" name="gender" value="other" />
                          <span>Khác</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">Quốc tịch</label>
                      <select 
                        className="w-full p-2 border rounded outline-none"
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                      >
                        <option value="">Chọn quốc tịch</option>
                        {countries.map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button className="bg-[#0d5cb6] text-white px-6 py-2 rounded">
                      Lưu thay đổi
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
                          <div className="text-gray-500">{user?.phone || 'Chưa cập nhật'}</div>
                        </div>
                      </div>
                      <button className="text-blue-600 font-semibold text-sm border border-blue-600 rounded px-4 py-1.5 hover:bg-blue-50">Cập nhật</button>
                    </div>
                    <div className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-3">
                        <FiMail className="text-gray-400 text-xl"/>
                        <div>
                          <div>Địa chỉ email</div>
                          <div className="text-gray-500">{user?.email || 'Chưa cập nhật'}</div>
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
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;