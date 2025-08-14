import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Header from './Header';
import Footer from './Footer';

const CartPage: React.FC = () => {
	const { state, removeFromCart, updateQuantity, clearCart } = useCart();
	const { items, totalItems, subtotal, totalDiscount, total } = state;

	const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + '₫';

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
				<Footer />
			</>
		);
	}

	return (
		<>
			<Header />
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex flex-col lg:flex-row gap-8">
						<div className="flex-1">
							<div className="bg-white rounded-lg shadow-sm">
								<div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
									<h1 className="text-2xl font-bold text-gray-900">Giỏ hàng ({totalItems} sản phẩm)</h1>
									<button onClick={clearCart} className="text-red-600 hover:text-red-800 text-sm font-medium">
										Xóa tất cả
									</button>
								</div>
								<div className="divide-y divide-gray-200">
									{items.map(item => (
										<div key={item.id} className="p-6 flex items-center gap-4">
											<img src={item.image} alt={item.name} className="w-20 h-24 object-cover rounded-md" />
											<div className="flex-1 min-w-0">
												<h3 className="text-lg font-medium text-gray-900 truncate">{item.name}</h3>
												<p className="text-sm text-gray-500">Người bán: {item.seller.name}</p>
												<div className="flex items-center mt-2">
													<span className="text-lg font-bold text-red-600">{formatPrice(item.price)}</span>
													{item.originalPrice && item.originalPrice > item.price && (
														<span className="text-sm text-gray-500 line-through ml-2">{formatPrice(item.originalPrice)}</span>
													)}
												</div>
											</div>
											<div className="flex items-center gap-2">
												<button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50">-</button>
												<span className="w-12 text-center text-gray-900 font-medium">{item.quantity}</span>
												<button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50">+</button>
											</div>
											<div className="text-right">
												<div className="text-lg font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</div>
											</div>
											<button onClick={() => removeFromCart(item.id)} className="text-red-600 hover:text-red-800">
												<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
												</svg>
											</button>
										</div>
									))}
								</div>
							</div>
						</div>
						<div className="lg:w-80">
							<div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
								<h2 className="text-lg font-bold text-gray-900 mb-4">Tổng quan giỏ hàng</h2>
								<div className="space-y-3 mb-6">
									<div className="flex justify-between text-sm text-gray-600">
										<span>Tạm tính ({totalItems} sản phẩm)</span>
										<span>{formatPrice(subtotal)}</span>
									</div>
									{totalDiscount > 0 && (
										<div className="flex justify-between text-sm text-green-600">
											<span>Tiết kiệm</span>
											<span>-{formatPrice(totalDiscount)}</span>
										</div>
									)}
									<div className="border-t border-gray-200 pt-3">
										<div className="flex justify-between text-lg font-bold text-gray-900">
											<span>Tổng cộng</span>
											<span>{formatPrice(total)}</span>
										</div>
									</div>
								</div>
								<div className="space-y-3">
									<Link to="/checkout" className="w-full bg-red-600 text-white py-3 px-4 rounded-md font-medium hover:bg-red-700 transition-colors text-center block">Tiến hành thanh toán</Link>
									<Link to="/" className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-md font-medium hover:bg-gray-50 transition-colors text-center block">Tiếp tục mua sắm</Link>
								</div>
								<div className="mt-6 pt-6 border-t border-gray-200 text-sm text-gray-600">
									<div className="flex items-center mb-2">
										<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-14 0a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V8a2 2 0 00-2-2" />
										</svg>
										Giao hàng miễn phí từ 45k
									</div>
									<div className="flex items-center">
										<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
										Giao trong 2-4 giờ
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<Footer />
		</>
	);
};

export default CartPage;
