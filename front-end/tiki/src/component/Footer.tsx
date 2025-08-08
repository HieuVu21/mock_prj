const Footer = () => {
  return (
    <footer className="bg-white py-10 border-t border-gray-200 font-sans text-sm text-gray-500">
      <div className="max-w-7xl mx-auto px-5">
        <div className="flex justify-between gap-5 pb-8 border-b border-gray-200">
          {/* Hỗ trợ khách hàng */}
          <div className="flex-1 min-w-[180px]">
            <h4 className="text-base text-gray-800 mb-4 font-bold">Hỗ trợ khách hàng</h4>
            <p className="mb-2.5">
              Hotline: <a href="tel:1900-6035" className="font-bold text-gray-800 hover:text-blue-600">1900-6035</a> <span className="text-xs">(1000 đ/phút, 8-21h kể cả T7, CN)</span>
            </p>
            <a href="#" className="block text-gray-500 no-underline mb-2.5 hover:text-blue-600">Các câu hỏi thường gặp</a>
            <a href="#" className="block text-gray-500 no-underline mb-2.5 hover:text-blue-600">Gửi yêu cầu hỗ trợ</a>
            <a href="#" className="block text-gray-500 no-underline mb-2.5 hover:text-blue-600">Hướng dẫn đặt hàng</a>
            <a href="#" className="block text-gray-500 no-underline mb-2.5 hover:text-blue-600">Phương thức vận chuyển</a>
            <a href="#" className="block text-gray-500 no-underline mb-2.5 hover:text-blue-600">Chính sách kiểm hàng</a>
            <a href="#" className="block text-gray-500 no-underline mb-2.5 hover:text-blue-600">Chính sách đổi trả</a>
            <a href="#" className="block text-gray-500 no-underline mb-2.5 hover:text-blue-600">Hướng dẫn trả góp</a>
            <a href="#" className="block text-gray-500 no-underline mb-2.5 hover:text-blue-600">Chính sách hàng nhập khẩu</a>
            <p className="mb-2.5">Hỗ trợ khách hàng: <a href="mailto:hotro@tiki.vn" className="hover:text-blue-600">hotro@tiki.vn</a></p>
            <p className="mb-2.5">Báo lỗi bảo mật: <a href="mailto:security@tiki.vn" className="hover:text-blue-600">security@tiki.vn</a></p>
          </div>

          {/* Về Tiki */}
          <div className="flex-1 min-w-[180px]">
            <h4 className="text-base text-gray-800 mb-4 font-bold">Về Tiki</h4>
            <a href="#" className="block text-gray-500 no-underline mb-2.5 hover:text-blue-600">Giới thiệu Tiki</a>
            <a href="#" className="block text-gray-500 no-underline mb-2.5 hover:text-blue-600">Tiki Blog</a>
            <a href="#" className="block text-gray-500 no-underline mb-2.5 hover:text-blue-600">Tuyển dụng</a>
            <a href="#" className="block text-gray-500 no-underline mb-2.5 hover:text-blue-600">Chính sách bảo mật thanh toán</a>
            <a href="#" className="block text-gray-500 no-underline mb-2.5 hover:text-blue-600">Chính sách bảo mật thông tin cá nhân</a>
            <a href="#" className="block text-gray-500 no-underline mb-2.5 hover:text-blue-600">Chính sách giải quyết khiếu nại</a>
            <a href="#" className="block text-gray-500 no-underline mb-2.5 hover:text-blue-600">Điều khoản sử dụng</a>
            <a href="#" className="block text-gray-500 no-underline mb-2.5 hover:text-blue-600">Giới thiệu Tiki Xu</a>
            <a href="#" className="block text-gray-500 no-underline mb-2.5 hover:text-blue-600">Tiếp thị liên kết cùng Tiki</a>
            <a href="#" className="block text-gray-500 no-underline mb-2.5 hover:text-blue-600">Bán hàng doanh nghiệp</a>
            <a href="#" className="block text-gray-500 no-underline mb-2.5 hover:text-blue-600">Điều kiện vận chuyển</a>
          </div>

          {/* Hợp tác và liên kết */}
          <div className="flex-1 min-w-[180px]">
            <h4 className="text-base text-gray-800 mb-4 font-bold">Hợp tác và liên kết</h4>
            <a href="#" className="block text-gray-500 no-underline mb-2.5 hover:text-blue-600">Quy chế hoạt động Sàn GDTMĐT</a>
            <a href="#" className="block text-gray-500 no-underline mb-2.5 hover:text-blue-600">Bán hàng cùng Tiki</a>
            <h4 className="text-base text-gray-800 mb-4 font-bold mt-5">Chứng nhận bởi</h4>
            <div className="flex items-center gap-2.5">
              <img src="/condau.png" alt="Con dấu" className="h-[35px]" />
              <img src="/bocongthuong.png" alt="Đã Đăng Ký Bộ Công Thương" className="h-[35px]" />
              <img src="/dmca.png" alt="DMCA Protected" className="h-[35px]" />
            </div>
          </div>

          {/* Phương thức thanh toán */}
          <div className="flex-1 min-w-[180px]">
            <h4 className="text-base text-gray-800 mb-4 font-bold">Phương thức thanh toán</h4>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 items-center">
                <img src="/payment/tikipay.png" alt="Tiki" className="h-6 max-w-10" />
                <img src="/payment/visa.png" alt="Visa" className="h-6 max-w-10" />
                <img src="/payment/mastercard.png" alt="Mastercard" className="h-6 max-w-10" />
                <img src="/payment/jcb.png" alt="JCB" className="h-6 max-w-10" />
                <img src="/payment/atm.png" alt="ATM" className="h-6 max-w-10" />
              </div>
              <div className="flex gap-2 items-center">
                <img src="/payment/momo.png" alt="Momo" className="h-6 max-w-10" />
                <img src="/payment/zalopay.png" alt="ZaloPay" className="h-6 max-w-10" />
                <img src="/payment/viettelmoney.png" alt="Viettel Money" className="h-6 max-w-10" />
                <img src="/payment/vnpay.png" alt="VNPay" className="h-6 max-w-10" />
                <img src="/payment/tienmat.png" alt="Tiền mặt" className="h-6 max-w-10" />
              </div>
              <div className="flex gap-2 items-center">
                <img src="/payment/tragop.png" alt="Trả góp" className="h-6 max-w-10" />
              </div>
            </div>
            <h4 className="text-base text-gray-800 mb-4 font-bold mt-4">Dịch vụ giao hàng</h4>
            <div className="mt-4">
              <a href="#"><img src="/tikinow.png" alt="TikiNow" className="h-[30px]" /></a>
            </div>
          </div>

          {/* Kết nối với chúng tôi */}
          <div className="flex-1 min-w-[180px]">
            <h4 className="text-base text-gray-800 mb-4 font-bold">Kết nối với chúng tôi</h4>
            <div className="flex gap-2.5 mb-5">
              <img src="/social/facebook.png" alt="Facebook" className="h-8 w-8 rounded-full cursor-pointer" />
              <img src="/social/youtube.png" alt="Youtube" className="h-8 w-8 rounded-full cursor-pointer" />
              <img src="/social/zalo.png" alt="Zalo" className="h-8 w-8 rounded-full cursor-pointer" />
            </div>
            <h4 className="text-base text-gray-800 mb-4 font-bold">Tải ứng dụng trên điện thoại</h4>
            <div className="flex gap-2.5 items-center">
              <img src="/qr-code.png" alt="QR Code" className="w-20 h-20"/>
              <div className="flex flex-col gap-2.5">
                <a href="#"><img src="/appstore.png" alt="App Store" className="h-[30px]" /></a>
                <a href="#"><img src="/googleplay.png" alt="Google Play" className="h-[30px]" /></a>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-5 border-t border-gray-200 mt-5">
          <p className="mb-1.5">Công ty TNHH TIKI</p>
          <p className="mb-1.5">Tòa nhà số 52 đường Út Tịch, Phường 4, Quận Tân Bình, Thành phố Hồ Chí Minh</p>
          <p className="mb-1.5">Giấy chứng nhận đăng ký doanh nghiệp số 0309532909 do Sở Kế Hoạch và Đầu Tư Thành phố Hồ Chí Minh cấp lần đầu vào ngày 06/01/2010.</p>
          <p className="mb-1.5">Hotline: <a href="tel:1900-6035" className="hover:text-blue-600">1900 6035</a></p>
        </div>

        <div className="pt-5 border-t border-gray-200 mt-5">
          <h4 className="text-sm text-gray-800 mb-2.5 font-bold">Thương Hiệu Nổi Bật</h4>
          <div className="leading-loose text-gray-500">
            <span>vascara</span> / <span>dior</span> / <span>estee lauder</span> / <span>th truemilk</span> / <span>barbie</span> / <span>owen</span> / <span>ensure</span> / <span>durex</span> / <span>bioderma</span> / <span>elly</span> / <span>milo</span> / <span>skechers</span> / <span>aldo</span> / <span>triumph</span> / <span>nutifood</span> / <span>kindle</span> / <span>nerman</span> / <span>wacom</span> / <span>anessa</span> / <span>yoosee</span> / <span>olay</span> / <span>similac</span> / <span>comfort</span> / <span>bitas</span> / <span>shiseido</span> / <span>langfarm</span> / <span>hukan</span> / <span>vichy</span> / <span>fila</span> / <span>tsubaki</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
