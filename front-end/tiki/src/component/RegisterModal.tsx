import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }: { 
  isOpen: boolean; 
  onClose: () => void;
  onSwitchToLogin: () => void;
}) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Reset form khi modal đóng
  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setUsername('');
      setError('');
    }
  }, [isOpen]);

  const baseUrl = 'http://localhost:3000'; // Base URL for API requests

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate password match
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(baseUrl + `/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          username,
          role: 'user' // Mặc định role là user
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Lỗi server');
      }

      const data = await res.json();
      
      // Đăng ký thành công
      onClose();
      // Có thể chuyển người dùng đến trang đăng nhập hoặc tự động đăng nhập
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.53)' }}>
      <div className="bg-white rounded-lg shadow-lg flex w-[700px] h-[450px] relative">
        {/* Left side - Form */}
        <form className="flex-1 p-8 flex flex-col justify-center" onSubmit={handleRegister}>
          <h2 className="text-2xl font-semibold mb-6">Tạo tài khoản</h2>
          
          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-600 rounded">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Tên người dùng</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4 relative">
            <label className="block text-sm font-medium mb-1">Mật khẩu</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-8 text-gray-500"
            >
              {showPassword ? "Ẩn" : "Hiện"}
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Xác nhận mật khẩu</label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#ff424e] text-white rounded-md py-3 w-full text-xl font-semibold mb-4"
          >
            {loading ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
          <div className="flex justify-center text-xs mb-2">
            <span>
              Đã có tài khoản?{" "}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSwitchToLogin();
                }}
                className="text-[#189eff] font-medium hover:underline"
              >
                Đăng nhập
              </button>
            </span>
          </div>
        </form>

        {/* Right side - Image */}
        <div className="flex-1 bg-gray-100 flex flex-col items-center justify-center p-8">
          <img src="/public/img_login.png" alt="Tiki Icon" className="w-32 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Chào mừng đến với Tiki</h3>
          <p className="text-gray-600 text-center">
            Đăng ký để trải nghiệm dịch vụ mua sắm tốt nhất
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default RegisterModal;
