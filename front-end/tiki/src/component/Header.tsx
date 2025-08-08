import { FiHome, FiShoppingCart } from 'react-icons/fi';
import { BsSearch } from 'react-icons/bs';
import { FaRegFaceGrinWink } from "react-icons/fa6";


const Header = () => {
  return (
    <header className="bg-white text-[#808089] py-2 font-sans border-b border-[#f0f0f0]">
      <div className="max-w-[1240px] mx-auto px-5">
        <div className="flex items-center justify-between gap-[20px]">
          <div className="text-center">
              <img src="/tiki-logo.png" alt="Tiki Logo" className="h-8" />
            <span className="block text-xs font-bold">Tốt & Nhanh</span>
          </div>
          <div className="flex-grow flex flex-col">
            <div className="flex items-center gap-4">
              <div className="flex-grow flex items-center border border-gray-200 rounded-md h-9">
                <BsSearch className="text-gray-400 mx-2.5" />
                <input type="text" placeholder="Giao ST25 25k/kg bao thật" className="flex-grow h-full bg-transparent outline-none px-2 text-xs" />
                <div className="border-l border-gray-200 h-5"></div>
                <button className="text-[#0A68FF] font-semibold px-3 whitespace-nowrap cursor-pointer hover:bg-[#f0f8ff] transition-colors rounded-r-md h-full text-sm">Tìm kiếm</button>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-[#808089] no-underline text-xs whitespace-nowrap cursor-pointer px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors">
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