import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import type { Books } from '../interface/book.interface';

const API_URL = 'http://localhost:3000/books'; 

const HomeComponent = () => {
  const [books, setBooks] = useState<Books[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'sold' | 'price'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const navigate = useNavigate();

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        setBooks(data);
      });
  }, []);

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = new Map();
    books.forEach(book => {
      if (book.categories) {
        uniqueCategories.set(book.categories.id, book.categories.name);
      }
    });
    return Array.from(uniqueCategories.entries()).map(([id, name]) => ({ id, name }));
  }, [books]);

  // Filter and sort books
  const filteredAndSortedBooks = useMemo(() => {
    let filtered = books.filter(book => {
      const matchesSearch = searchTerm === '' || 
        book.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (book.short_description && book.short_description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (book.description && book.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === '' || 
        (book.categories && book.categories.id.toString() === selectedCategory);
      
      return matchesSearch && matchesCategory;
    });

    // Sort books
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'rating':
          aValue = a.rating_average || 0;
          bValue = b.rating_average || 0;
          break;
        case 'sold':
          aValue = a.quantity_sold?.value || 0;
          bValue = b.quantity_sold?.value || 0;
          break;
        case 'price':
          aValue = a.list_price;
          bValue = b.list_price;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc' 
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
    });

    return filtered;
  }, [books, searchTerm, selectedCategory, sortBy, sortOrder]);

  return (
    <div className="min-h-screen bg-gray-50">
     

      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm sách, tác giả, mô tả..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{filteredAndSortedBooks.length}</span> sản phẩm
              {searchTerm && (
                <span className="ml-1">
                  cho "<span className="font-medium text-blue-600">{searchTerm}</span>"
                </span>
              )}
              {selectedCategory && (
                <span className="ml-1">
                  trong "<span className="font-medium text-blue-600">{categories.find(c => c.id.toString() === selectedCategory)?.name}</span>"
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Sort Options */}
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

          {/* Right Side - Books Grid */}
          <div className="col-span-10">
          <div className="grid grid-cols-4 gap-4">
              {filteredAndSortedBooks.map((book) => (
                <div
                  key={book.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer group border border-gray-100 overflow-hidden"
                  onClick={() => navigate(`/book/${book.id}`)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={e => { if (e.key === 'Enter') navigate(`/book/${book.id}`); }}
                >
                  {/* Image Container */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                    <img
                      src={book.images[0].small_url}
                      alt={book.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    
                    {/* Rating Badge */}
                    {book.rating_average > 0 && (
                      <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
                        <span className="text-yellow-600">★</span>
                        <span>{book.rating_average.toFixed(1)}</span>
                      </div>
                    )}

                    {/* Discount Badge */}
                    {book.original_price > book.list_price && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                        -{Math.round(((book.original_price - book.list_price) / book.original_price) * 100)}%
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-3">
                    {/* Price */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-red-600">
                        {book.list_price.toLocaleString()}₫
                      </span>
                      {book.original_price > book.list_price && (
                        <span className="text-sm text-gray-400 line-through">
                          {book.original_price.toLocaleString()}₫
                        </span>
                      )}
                    </div>

                    {/* Author */}
                    {book.authors?.[0]?.name && (
                      <p className="text-xs text-gray-500 mb-1 truncate">
                        {book.authors[0].name}
                      </p>
                    )}

                    {/* Title */}
                    <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                      {book.name}
                    </h3>

                    {/* Bottom Info */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        Đã bán {book.quantity_sold?.value || 0}
                      </span>
                      {book.categories && (
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                          {book.categories.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* No Results */}
            {filteredAndSortedBooks.length === 0 && (
              <div className="text-center py-16">
                <div className="text-gray-300 text-8xl mb-6">📚</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {searchTerm 
                    ? `Không có sản phẩm nào phù hợp với "${searchTerm}". Hãy thử từ khóa khác hoặc xóa bộ lọc.`
                    : 'Không có sản phẩm nào trong danh mục này. Hãy thử danh mục khác.'
                  }
                </p>
                {(searchTerm || selectedCategory) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('');
                    }}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeComponent;