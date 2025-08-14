import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Header from './Header';
// Footer không dùng trên trang này theo thiết kế

const CartPage: React.FC = () => {
	const { state } = useCart();
	const { items, totalItems, subtotal, totalDiscount, total } = state;

	const [deliveryMethod, setDeliveryMethod] = useState<'now' | 'economy'>('now');
	const [paymentMethod, setPaymentMethod] = useState<'cash' | 'viettel'>('cash');
	const [promoSelected, setPromoSelected] = useState<boolean>(true);

	const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + '₫';

	// Các giá trị dưới đây chỉ dùng HIỂN THỊ UI, không thay đổi state
	const shippingFee = 0; // chờ API
	const shippingDiscount = 0; // chờ API
	const promoDiscount = promoSelected ? 0 : 0; // chờ API
	const finalTotal = total; // giữ nguyên theo state

	// CSS styles for the 2-column layout
	const containerStyles: React.CSSProperties = {
		display: 'grid',
		gridTemplateColumns: '1fr 400px',
		gap: '2rem',
		width: '100%',
		position: 'relative'
	};

	const leftColumnStyles: React.CSSProperties = {
		display: 'flex',
		flexDirection: 'column',
		gap: '1.5rem'
	};

	const rightColumnStyles: React.CSSProperties = {
		position: 'sticky',
		top: '1rem',
		height: 'fit-content'
	};

	if (totalItems === 0) {
		return (
			<>
				<Header />
				<div className="min-h-screen bg-gray-50 py-12">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center">
							<svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
							</svg>
							<h2 className="mt-6 text-2xl font-bold text-gray-900">Giỏ hàng trống</h2>
							<p className="mt-2 text-gray-600">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
							<div className="mt-8">
								<Link to="/" className="inline-flex items-center px-6 py-3 text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors">
									Tiếp tục mua sắm
								</Link>
							</div>
						</div>
					</div>
				</div>
			</>
		);
	}

	return (
		<>
			<Header />
			{/* Banner xanh lá */}
			<div className="bg-green-50 py-2">
				<div className="mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center text-sm text-green-600">
						Freeship đơn từ 45k, giảm nhiều hơn cùng <span className="font-bold">FREESHIP XTRA</span>
					</div>
				</div>
			</div>

			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div style={containerStyles}>
						{/* Cột trái - Các tùy chọn */}
						<div style={leftColumnStyles}>
							{/* Tiêu đề trang */}
							<div className="bg-white rounded-lg shadow-sm p-6">
								<h1 className="text-2xl font-bold text-gray-900">Thanh toán</h1>
							</div>

							{/* Chọn hình thức giao hàng */}
							<div className="bg-white rounded-lg shadow-sm p-6">
								<h2 className="text-lg font-semibold text-gray-900 mb-4">Chọn hình thức giao hàng</h2>
								<div className="space-y-3">
									<label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
										<input type="radio" name="delivery" value="now" checked={deliveryMethod === 'now'} onChange={() => setDeliveryMethod('now')} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
										<div className="ml-3 flex-1">
											<div className="flex items-center justify-between">
												<span className="font-medium text-gray-900">NOW Giao siêu tốc 2h</span>
												<span className="text-green-600 font-medium">-25K</span>
											</div>
										</div>
									</label>
									<label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
										<input type="radio" name="delivery" value="economy" checked={deliveryMethod === 'economy'} onChange={() => setDeliveryMethod('economy')} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
										<div className="ml-3 flex-1">
											<div className="flex items-center justify-between">
												<span className="font-medium text-gray-900">Giao tiết kiệm</span>
												<span className="text-green-600 font-medium">-16K</span>
											</div>
										</div>
									</label>
								</div>
								{/* Gói hàng */}
								<div className="mt-4 p-4 bg-gray-50 rounded-lg">
									<h3 className="font-medium text-gray-900 mb-2">Gói: Giao siêu tốc 2h, trước 13h hôm nay</h3>
									<div className="flex items-center space-x-4">
										<div className="w-16 h-16 rounded bg-gray-100 overflow-hidden flex items-center justify-center">
											{items[0]?.image ? (
												<img src={items[0].image} alt={items[0].name} className="w-full h-full object-cover" />
											) : (
												<span className="text-xs text-gray-500">No image</span>
											)}
										</div>
										<div className="flex-1">
											<div className="font-medium text-gray-900 truncate">{items[0]?.name || 'Sản phẩm'}</div>
											<div className="text-sm text-gray-600">SL: x{items[0]?.quantity || 1}</div>
										</div>
										<div className="text-right">
											<div className="text-sm text-gray-500 line-through">&nbsp;</div>
											<div className="text-green-600 font-medium">MIỄN PHÍ</div>
										</div>
									</div>
								</div>
								<div className="mt-4">
									<Link to="#" className="text-blue-600 hover:text-blue-800 text-sm">Thêm mã khuyến mãi của Shop &gt;</Link>
								</div>
							</div>

							{/* Chọn hình thức thanh toán */}
							<div className="bg-white rounded-lg shadow-sm p-6">
								<h2 className="text-lg font-semibold text-gray-900 mb-4">Chọn hình thức thanh toán</h2>
								<div className="space-y-3">
									<label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
										<input type="radio" name="payment" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
										<div className="ml-3 font-medium text-gray-900">Thanh toán tiền mặt</div>
									</label>
									<label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
										<input type="radio" name="payment" value="viettel" checked={paymentMethod === 'viettel'} onChange={() => setPaymentMethod('viettel')} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
										<div className="ml-3 font-medium text-gray-900">Viettel Money</div>
									</label>
								</div>
							</div>

							{/* Ưu đãi thanh toán thẻ */}
							<div className="bg-white rounded-lg shadow-sm p-6">
								<h2 className="text-lg font-semibold text-gray-900 mb-4">Ưu đãi thanh toán thẻ</h2>
								<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
									{Array.from({ length: 8 }).map((_, i) => (
										<div key={i} className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 cursor-pointer">
											<div className="text-sm font-medium text-red-600 mb-1">{i % 3 === 0 ? 'Freeship' : `Giảm ${[30, 50, 70, 100, 150][i % 5]}k`}</div>
											<div className="text-xs text-gray-600 mb-1">Shinhan Bank</div>
											<div className="text-xs text-gray-500">Không giới hạn</div>
										</div>
									))}
								</div>
							</div>
						</div>

						{/* Cột phải - Tổng quan đơn hàng */}
						<div style={rightColumnStyles}>
							<div className="bg-white rounded-lg shadow-sm p-6">
								{/* Địa chỉ giao */}
								<div className="mb-6">
									<h3 className="text-lg font-semibold text-gray-900 mb-3">Giao tới</h3>
									<div className="space-y-1 text-sm">
										<div className="font-medium text-gray-900">Vũ Anh Tú <span className="text-gray-500">| 0942438693</span></div>
										<div className="text-gray-600">Văn phòng, số 17 Duy Tân, Phường Dịch Vọng, Quận Cầu Giấy, Hà Nội</div>
										<Link to="#" className="text-blue-600 hover:text-blue-800">Thay đổi</Link>
									</div>
								</div>

								{/* Khuyến mãi Tiki */}
								<div className="mb-6">
									<h3 className="text-lg font-semibold text-gray-900 mb-3">Tiki Khuyến Mãi <span className="text-xs text-gray-500">(Có thể chọn 2)</span></h3>
									<div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg mb-2">
										<div className="flex items-center text-green-600">
											<svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
											<span className="font-medium">Giảm 25K</span>
										</div>
										<button onClick={() => setPromoSelected(!promoSelected)} className="text-red-600 hover:text-red-800 text-sm">{promoSelected ? 'Bỏ chọn' : 'Chọn'}</button>
									</div>
									<Link to="#" className="text-blue-600 hover:text-blue-800 text-sm">Chọn hoặc nhập mã khác &gt;</Link>
								</div>

								{/* Tổng đơn hàng */}
								<div className="mb-6">
									<h3 className="text-lg font-semibold text-gray-900 mb-3">Đơn hàng</h3>
									<div className="text-sm text-gray-600 mb-3">{totalItems} sản phẩm. <Link to="#" className="text-blue-600 hover:text-blue-800">Xem thông tin</Link></div>
									<div className="space-y-3 text-sm">
										<div className="flex justify-between"><span className="text-gray-600">Tổng tiền hàng</span><span className="text-gray-900">{formatPrice(subtotal)}</span></div>
										<div className="flex justify-between"><span className="text-gray-600">Phí vận chuyển</span><span className="text-gray-900">{formatPrice(shippingFee)}</span></div>
										{totalDiscount > 0 && (<div className="flex justify-between"><span className="text-gray-600">Giảm giá trực tiếp</span><span className="text-green-600">-{formatPrice(totalDiscount)}</span></div>)}
										{shippingDiscount > 0 && (<div className="flex justify-between"><span className="text-gray-600">Giảm giá vận chuyển</span><span className="text-green-600">-{formatPrice(shippingDiscount)}</span></div>)}
										{promoSelected && promoDiscount > 0 && (<div className="flex justify-between"><span className="text-gray-600">Khuyến mãi</span><span className="text-green-600">-{formatPrice(promoDiscount)}</span></div>)}
										<div className="border-t border-gray-200 pt-3">
											<div className="flex justify-between text-lg font-bold"><span className="text-gray-900">Tổng tiền thanh toán</span><span className="text-red-600">{formatPrice(finalTotal)}</span></div>
										</div>
										<div className="text-xs text-gray-500 mt-1">(Giá này đã bao gồm thuế GTGT, phí đóng gói, phí vận chuyển và các chi phí phát sinh khác)</div>
									</div>
								</div>

								<button className="w-full bg-red-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-red-700 transition-colors">Đặt hàng</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Footer ngắn cuối trang theo ảnh */}
			<div className="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-600">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="mb-2">Bằng việc tiến hành Đặt Mua, bạn đồng ý với các Điều kiện Giao dịch chung:</div>
					<div className="flex flex-wrap gap-3 justify-center text-blue-600">
						<Link to="#" className="hover:text-blue-800">Quy chế hoạt động</Link>
						<Link to="#" className="hover:text-blue-800">Chính sách giải quyết khiếu nại</Link>
						<Link to="#" className="hover:text-blue-800">Chính sách bảo hành</Link>
						<Link to="#" className="hover:text-blue-800">Chính sách bảo mật thanh toán</Link>
						<Link to="#" className="hover:text-blue-800">Chính sách bảo mật thông tin cá nhân</Link>
					</div>
				</div>
			</div>
		</>
	);
};

export default CartPage;