import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CartIcon: React.FC = () => {
	const { state } = useCart();
	return (
		<Link to="/cart" className="relative flex items-center text-[#0d5cb6] cursor-pointer w-9 h-9 rounded-md hover:bg-[#f0f8ff] transition-colors">
			<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
			</svg>
			{state.totalItems > 0 && (
				<span className="absolute -top-1 -right-1 bg-[#ff424e] text-white rounded-full w-4.5 h-4.5 text-[10px] flex items-center justify-center font-semibold border border-white">
					{state.totalItems > 99 ? '99+' : state.totalItems}
				</span>
			)}
		</Link>
	);
};

export default CartIcon;
