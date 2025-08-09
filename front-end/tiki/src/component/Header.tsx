import { FiHome, FiShoppingCart, FiX } from 'react-icons/fi';
import { BsSearch } from 'react-icons/bs';
import { FaRegFaceGrinWink } from "react-icons/fa6";
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Books } from '../interface/book.interface';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Books[]>([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch search suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchQuery.trim()) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:3000/books?q=${encodeURIComponent(searchQuery)}&_limit=5`
        );
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
    }
  };
  return (
    <header className="bg-white text-[#808089] py-2 font-sans border-b border-[#f0f0f0]">
      <div className="mx-auto px-5">
        <div className="flex items-center justify-between gap-[20px] ">
          <div className="text-center">
              <img src="/tiki-logo.png" alt="Tiki Logo" className="h-8" />
            <span className="block text-xs font-bold">Tốt & Nhanh</span>
          </div>
          <div className="flex-grow flex flex-col" ref={searchRef}>
            <div className="flex items-center gap-4">
              <form onSubmit={handleSearch} className="flex-grow relative">
                <div className="flex items-center border border-gray-200 rounded-md h-9 bg-white">
                  <BsSearch className="text-gray-400 mx-2.5" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Giao ST25 25k/kg bao thật" 
                    className="flex-grow h-full bg-transparent outline-none px-2 text-sm text-gray-800" 
                  />
                  {searchQuery && (
                    <button 
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-gray-400 hover:text-gray-600 p-1 mr-2"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  )}
                  <div className="border-l border-gray-200 h-5"></div>
                  <button 
                    type="submit"
                    className="text-[#0A68FF] font-semibold px-3 whitespace-nowrap cursor-pointer hover:bg-[#f0f8ff] transition-colors rounded-r-md h-full text-sm"
                  >
                    Tìm kiếm
                  </button>
                </div>

                {/* Search Suggestions */}
                {showSuggestions && searchQuery.trim() && (
                  <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
                    {loading ? (
                      <div className="p-3 text-sm text-gray-500">Đang tìm kiếm...</div>
                    ) : suggestions.length > 0 ? (
                      <ul className="py-1">
                        {suggestions.map((book) => (
                          <li 
                            key={book.id}
                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center"
                            onClick={() => {
                              navigate(`/books/${book.id}`);
                              setShowSuggestions(false);
                            }}
                          >
                            <img 
                              src={book.images?.[0]?.thumbnail_url || 'https://via.placeholder.com/40x50'} 
                              alt={book.name}
                              className="w-8 h-10 object-cover mr-3"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">{book.name}</div>
                              <div className="text-sm text-red-600 font-medium">
                                {book.list_price ? new Intl.NumberFormat('vi-VN').format(book.list_price) + '₫' : 'Liên hệ'}
                              </div>
                            </div>
                          </li>
                        ))}
                        <li 
                          className="px-4 py-2 bg-gray-50 text-blue-600 hover:bg-gray-100 cursor-pointer text-sm font-medium"
                          onClick={() => {
                            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                            setShowSuggestions(false);
                          }}
                        >
                          Xem tất cả kết quả cho "{searchQuery}"
                        </li>
                      </ul>
                    ) : searchQuery.trim() ? (
                      <div className="p-3 text-sm text-gray-500">Không tìm thấy kết quả</div>
                    ) : null}
                  </div>
                )}
              </form>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-[#808089] no-underline text-xs whitespace-nowrap cursor-pointer px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
                onClick={() => navigate('/')}>
                  <FiHome className="text-lg" />
                  <span>Trang chủ</span>
                </div>
                <div className="flex items-center gap-1 text-[#808089] no-underline text-xs whitespace-nowrap cursor-pointer px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors">
                  <FaRegFaceGrinWink className="text-lg" />
                  <span>Tài khoản</span>
                </div>
                <div className="border-l border-gray-200 h-5"></div>
                <div className="relative">
                  <div className="flex items-center justify-center text-[#0d5cb6] cursor-pointer w-9 h-9 rounded-md hover:bg-[#f0f8ff] transition-colors">
                    <FiShoppingCart className="text-xl" />
                    <span className="absolute top-0 right-0 bg-[#ff424e] text-white rounded-full w-3.5 h-3.5 text-[10px] flex items-center justify-center font-semibold border border-white">0</span>
                  </div>
                </div>
          </div>
        </div>
        <div className="flex justify-start gap-4 text-xs text-[#808089] whitespace-nowrap overflow-hidden text-ellipsis mt-2">
          <span>trái cây</span>
          <span>thịt, trứng</span>
          <span>rau củ quả</span>
          <span>sữa, bơ, phô mai</span>
          <span>hải sản</span>
          <span>gạo, mì ăn liền</span>
          <span>đồ uống, bia, rượu</span>
        </div>
          </div>
        </div>
        <div className="flex items-center py-1.5 gap-4">
          <span className="font-bold text-[#0d5cb6] text-xs whitespace-nowrap">Cam kết</span>
          <div className="flex items-center divide-x divide-gray-200">
            <div className="flex items-center gap-1 pr-3 text-xs">
              <img src="https://salt.tikicdn.com/ts/upload/96/76/a3/16324a16c76ee4f507d5777608dab831.png" alt="100% hàng thật" className="w-4 h-4" />
              <span>100% hàng thật</span>
            </div>
            <div className="flex items-center gap-1 px-3 text-xs">
              <img src="https://salt.tikicdn.com/ts/upload/11/09/ec/456a2a8c308c2de089a34bbfef1c757b.png" alt="freeship" className="w-4 h-4" />
              <span>Freeship mọi đơn</span>
            </div>
            <div className="flex items-center gap-1 px-3 text-xs">
              <img src="https://salt.tikicdn.com/ts/upload/3a/f4/7d/86ca29927e9b360dcec43dccb85d2061.png" alt="đổi trả" className="w-4 h-4" />
              <span>Hoàn 200% nếu hàng giả</span>
            </div>
            <div className="flex items-center gap-1 px-3 text-xs">
              <img src="	https://salt.tikicdn.com/ts/upload/87/98/77/fc33e3d472fc4ce4bae8c835784b707a.png" alt="giao nhanh" className="w-4 h-4" />
              <span>Giao nhanh 2h</span>
            </div>
            <div className="flex items-center gap-1 px-3 text-xs">
              <img src="https://salt.tikicdn.com/ts/upload/6a/81/06/0675ef5512c275a594d5ec1d58c37861.png" alt="gia" className="w-4 h-4" />
              <span>Giá siêu rẻ</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;