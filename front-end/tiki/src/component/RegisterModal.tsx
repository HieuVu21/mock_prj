import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const RegisterModal = ({
  isOpen,
  onClose,
  onSwitchToLogin,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset form khi modal đóng
  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setUsername("");
      setError("");
    }
  }, [isOpen]);

  const baseUrl = "http://localhost:3000"; // Base URL for API requests
  // const baseUrl = 'https://be-mock-project.vercel.app'
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate password match
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(baseUrl + `/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          fullname: username, // Backend expects 'name' field
          role: "user", // Mặc định role là user
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Lỗi server");
      }

      const data = await res.json();

      // Lưu token vào localStorage
      if (data.accessToken) {
        localStorage.setItem("token", data.accessToken);
      }

      // Đăng ký thành công
      toast.success("Đăng ký thành công");
      onClose();

      // Reload trang để cập nhật trạng thái đăng nhập
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.53)" }}
    >
      <div className="bg-white rounded-lg shadow-lg flex w-[700px] h-[450px] relative">
        {/* Left side - Form */}
        <form
          className="flex-1 p-8 flex flex-col justify-center"
          onSubmit={handleRegister}
        >
          <h2 className="text-2xl font-bold mb-2">Tạo tài khoản bằng email</h2>
          <p className="mb-6 text-gray-600">
            Nhập thông tin để tạo tài khoản Tiki
          </p>

          {error && <div className="text-red-500 text-sm mb-3">{error}</div>}

          <input
            type="email"
            placeholder="acb@email.com"
            className="border-b w-full mb-4 text-base outline-none py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Tên người dùng"
            className="border-b w-full mb-4 text-base outline-none py-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu"
              className="border-b w-full text-base outline-none py-2 pr-16"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-0 top-2 text-[#189eff] text-sm"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Ẩn" : "Hiện"}
            </button>
          </div>

          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Xác nhận mật khẩu"
              className="border-b w-full text-base outline-none py-2"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-0 top-2 text-[#189eff] text-sm"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Ẩn" : "Hiện"}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#ff424e] text-white rounded-md py-3 w-full text-xl font-semibold mb-4"
          >
            {loading ? "Đang xử lý..." : "Tạo tài khoản"}
          </button>

          <div className="flex justify-between text-xs mb-2">
            <span className="text-gray-500"></span>
            <span>
              Đã có tài khoản?{" "}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSwitchToLogin();
                }}
                className="text-[#189eff] font-medium hover:underline border-none bg-transparent p-0 cursor-pointer"
              >
                Đăng nhập
              </button>
            </span>
          </div>
        </form>

        {/* Right side - Image */}
        <div className="flex-1 bg-[#eaf6ff] flex flex-col items-center justify-center rounded-r-lg">
          <img
            src="/public/img_login.png"
            alt="Tiki Icon"
            className="w-32 mb-4"
          />
          <div className="text-[#189eff] text-lg font-semibold">
            Mua sắm tại Tiki
          </div>
          <div className="text-[#189eff] text-sm">Siêu ưu đãi mỗi ngày</div>
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="fixed z-[60]"
        style={{
          top: "calc(50% - 225px - 24px)",
          right: "calc(50% - 350px - 24px)",
          width: "48px",
          height: "48px",
          background: "#fff",
          borderRadius: "50%",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
        aria-label="Đóng"
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="14" cy="14" r="14" fill="none" />
          <path
            d="M9 9L19 19M19 9L9 19"
            stroke="#8B8B8B"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
};

export default RegisterModal;
