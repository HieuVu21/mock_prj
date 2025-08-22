import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getNames } from "country-list";
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
import { updateUser, getCurrentUser } from "../services/api";
import type { User } from "../interface/user.interface";

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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
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
          fullName: userProfile.fullName || userProfile.name || "",
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
      link: "/orders",
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
                  {user?.fullName || user?.name || "Tài khoản"}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {sidebarLinks.map((link) =>
                link.link ? (
                  <Link
                    key={link.value}
                    to={link.link}
                    className="flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-gray-100 text-gray-600"
                  >
                    {link.icon}
                    <span className="text-sm">{link.text}</span>
                  </Link>
                ) : (
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
                )
              )}
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
                    <label className="text-sm text-gray-600 !ml-4">Ngày sinh</label>
                    <label className="text-sm text-gray-600 !mt-10 !ml-4">Giới tính</label>
                    <label className="text-sm text-gray-600 !mt-10 !ml-4">Quốc tịch</label>
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
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;
