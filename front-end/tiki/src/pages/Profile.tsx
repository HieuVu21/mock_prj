import React, { useState } from 'react';
import { FiHome} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { getName, getNames } from 'country-list';
import { FiUser, FiBell, FiPackage, FiRefreshCw, FiCreditCard, FiMapPin, FiHeart, FiEye, FiAward, FiGift, FiShield } from 'react-icons/fi';
import Header from '../component/Header';
import Footer from '../component/Footer';

const Profile = () => {
  const [selectedTab, setSelectedTab] = useState('profile');
  const [selectedCountry, setSelectedCountry] = useState('');
  const countries = getNames().sort();
  
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
              <img src="/public/tiki-icon.png" alt="Avatar" className="w-12 h-12 rounded-full" />
              <div>
                <div className="font-semibold">BĐCCNPhạm Thanh Sơn</div>
              
            </div>
          </div>
          <div className="space-y-2">
            {sidebarLinks.map((link) => (
              <div
                key={link.value}
                className={`flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-gray-100 \${
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
                      value="BĐCCNPhạm Thanh Sơn"
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
                      <select className="p-2 border rounded outline-none">
                        <option>Ngày</option>
                      </select>
                      <select className="p-2 border rounded outline-none">
                        <option>Tháng</option>
                      </select>
                      <select className="p-2 border rounded outline-none">
                        <option>Năm</option>
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

              {/* Right Column - Contact Info */}
              <div>
                <h2 className="font-medium mb-4">Số điện thoại và Email</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <div className="text-gray-600">Số điện thoại</div>
                      <div className="font-medium">0395770993</div>
                    </div>
                    <button className="text-[#0d5cb6]">Cập nhật</button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <div className="text-gray-600">Địa chỉ email</div>
                      <div className="font-medium">sonpt2304@gmail.com</div>
                    </div>
                    <button className="text-[#0d5cb6]">Cập nhật</button>
                  </div>

                  <h2 className="font-medium mt-8 mb-4">Bảo mật</h2>
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <div className="font-medium">Thiết lập mật khẩu</div>
                      <div className="text-gray-600">Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác</div>
                    </div>
                    <button className="text-[#0d5cb6]">Cập nhật</button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <div className="font-medium">Thiết lập mã PIN</div>
                      <div className="text-gray-600">Thiết lập mã PIN để mua sắm dễ dàng hơn</div>
                    </div>
                    <button className="text-[#0d5cb6]">Thiết lập</button>
                  </div>
                  
                  <h2 className="font-medium mt-8 mb-4">Liên kết mạng xã hội</h2>
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div className="flex items-center gap-2">
                      <img src="/public/social/facebook.png" alt="Facebook" className="w-6 h-6" />
                      <span>Facebook</span>
                    </div>
                    <button className="text-[#0d5cb6]">Liên kết</button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div className="flex items-center gap-2">
                      <img src="https://frontend.tikicdn.com/_desktop-next/static/img/account/google.png" alt="Google" className="w-6 h-6" />
                      <span>Google</span>
                    </div>
                    <button className="text-gray-500">Đã liên kết</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
    </>
  );
};

export default Profile;
