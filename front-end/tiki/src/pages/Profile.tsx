import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getNames } from 'country-list';
import { 
  FiUser, FiBell, FiPackage, FiRefreshCw, FiCreditCard, FiMapPin, FiHeart, FiEye, FiAward, FiGift, FiShield, 
  FiPhone, FiMail, FiLock, FiTrash2 
} from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';
import Header from '../component/Header';
import Footer from '../component/Footer';
import { updateUser, getCurrentUser } from '../services/api';
import type { User } from '../interface/user.interface';

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
  const [selectedTab, setSelectedTab] = useState('profile');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  
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
              year: dateParts[0],
              month: dateParts[1],
              day: dateParts[2]
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
                          {days.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <select 
                          name="month" 
                          value={formData.birthDate.month} 
                          onChange={handleDateChange} 
                          className="p-2 border rounded outline-none focus:border-[#0d5cb6]"
                        >
                          <option value="">Tháng</option>
                          {months.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <select 
                          name="year" 
                          value={formData.birthDate.year} 
                          onChange={handleDateChange} 
                          className="p-2 border rounded outline-none focus:border-[#0d5cb6]"
                        >
                          <option value="">Năm</option>
                          {years.map(y => <option key={y} value={y}>{y}</option>)}
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
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;