import React from 'react';

interface OrderStatusBadgeProps {
  status: string;
  showCancelButton?: boolean;
  onCancel?: () => void;
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ 
  status, 
  showCancelButton = false, 
  onCancel 
}) => {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          text: 'Chờ xác nhận',
          color: 'bg-yellow-100 text-yellow-800',
          icon: '⏳'
        };
      case 'confirmed':
        return {
          text: 'Đã xác nhận',
          color: 'bg-blue-100 text-blue-800',
          icon: '✅'
        };
      case 'shipping':
        return {
          text: 'Đang giao hàng',
          color: 'bg-purple-100 text-purple-800',
          icon: '🚚'
        };
      case 'delivered':
        return {
          text: 'Đã giao hàng',
          color: 'bg-green-100 text-green-800',
          icon: '📦'
        };
      case 'cancelled':
        return {
          text: 'Đã hủy',
          color: 'bg-red-100 text-red-800',
          icon: '❌'
        };
      default:
        return {
          text: status,
          color: 'bg-gray-100 text-gray-800',
          icon: '❓'
        };
    }
  };

  const statusInfo = getStatusInfo(status);

  return (
    <div className="flex items-center space-x-3">
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color} flex items-center gap-2`}>
        <span>{statusInfo.icon}</span>
        {statusInfo.text}
      </span>
      
      {showCancelButton && status === 'confirmed' && onCancel && (
        <button
          onClick={onCancel}
          className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors border border-red-200 hover:border-red-300"
        >
          Hủy đơn
        </button>
      )}
    </div>
  );
};

export default OrderStatusBadge;
