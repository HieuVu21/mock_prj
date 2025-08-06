import { useState } from "react";

const Sidebar = () => {
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'sold' | 'price'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  return (
    <div className="col-span-2">
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-24">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Sắp xếp</h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Theo tên</label>
          <div className="space-y-2">
            <button
              onClick={() => { setSortBy('name'); setSortOrder('asc'); }}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                sortBy === 'name' && sortOrder === 'asc'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Tên A-Z
            </button>
            <button
              onClick={() => { setSortBy('name'); setSortOrder('desc'); }}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                sortBy === 'name' && sortOrder === 'desc'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Tên Z-A
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Theo đánh giá</label>
          <div className="space-y-2">
            <button
              onClick={() => { setSortBy('rating'); setSortOrder('desc'); }}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                sortBy === 'rating' && sortOrder === 'desc'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Đánh giá cao nhất
            </button>
            <button
              onClick={() => { setSortBy('rating'); setSortOrder('asc'); }}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                sortBy === 'rating' && sortOrder === 'asc'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Đánh giá thấp nhất
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Theo bán chạy</label>
          <div className="space-y-2">
            <button
              onClick={() => { setSortBy('sold'); setSortOrder('desc'); }}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                sortBy === 'sold' && sortOrder === 'desc'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Bán chạy nhất
            </button>
            <button
              onClick={() => { setSortBy('sold'); setSortOrder('asc'); }}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                sortBy === 'sold' && sortOrder === 'asc'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Bán ít nhất
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Theo giá</label>
          <div className="space-y-2">
            <button
              onClick={() => { setSortBy('price'); setSortOrder('asc'); }}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                sortBy === 'price' && sortOrder === 'asc'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Giá thấp nhất
            </button>
            <button
              onClick={() => { setSortBy('price'); setSortOrder('desc'); }}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                sortBy === 'price' && sortOrder === 'desc'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Giá cao nhất
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default Sidebar;