import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import type { Books } from '../interface/book.interface';
import Header from './Header';
import Footer from './Footer';
import SkeletonCard from './SkeletonCard'; // Import SkeletonCard
import StarRating from './StarRating'; // Import StarRating

const API_URL = 'http://localhost:3000/books'; 

const HomeComponent = () => {
  const [books, setBooks] = useState<Books[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'sold' | 'price'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(true); // Add loading state
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        setBooks(data);
      })
      .catch(error => console.error('Failed to fetch books:', error))
      .finally(() => setLoading(false)); // Set loading to false after fetch
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
      <Header />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Sách</h1>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Sắp xếp:</span>
            <div className="relative">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [selectedSortBy, selectedSortOrder] = e.target.value.split('-') as ['name' | 'rating' | 'sold' | 'price', 'asc' | 'desc'];
                  setSortBy(selectedSortBy);
                  setSortOrder(selectedSortOrder);
                }}
                className="appearance-none bg-white border border-gray-300 rounded-full pl-2 pr-2 py-2 text-xs font-medium text-gray-700 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer transition-colors duration-200"
              >
                <option value="sold-desc">Bán chạy nhất</option>
                <option value="rating-desc">Đánh giá cao nhất</option>
                <option value="price-asc">Giá: Thấp đến cao</option>
                <option value="price-desc">Giá: Cao đến thấp</option>
                <option value="name-asc">Tên: A đến Z</option>
                <option value="name-desc">Tên: Z đến A</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-gray-500">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <h3 className="font-semibold text-gray-900 text-xs px-4 py-3 bg-gray-50 border-b border-gray-100">
                Danh mục sản phẩm
              </h3>
              <div className="divide-y divide-gray-100">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left px-4 py-3 text-xs transition-colors duration-150 ${
                    selectedCategory === ''
                      ? 'bg-blue-50 text-blue-600 font-medium border-l-4 border-blue-500'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600 hover:font-medium'
                  }`}
                >
                  <span className="flex items-center">
                    Tất cả sản phẩm
                  </span>
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id.toString())}
                    className={`w-full text-left px-4 py-3 text-xs transition-colors duration-150 ${
                      selectedCategory === category.id.toString()
                        ? 'bg-blue-50 text-blue-600 font-medium border-l-4 border-blue-500'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600 hover:font-medium'
                    }`}
                  >
                    <span className="flex items-center">
                      {category.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Product Grid */}
          <div className="col-span-9">
            {/* Product grid will be rendered here */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading ? (
              <div className="grid grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-4 gap-4">
                  {filteredAndSortedBooks.map((book) => (
                    <div
                      key={book.id}
                      className="group bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 cursor-pointer flex flex-col h-full hover:shadow-2xl transition-shadow duration-300"
                      onClick={() => navigate(`/books/${book.id}`)}
                      tabIndex={0}
                      role="button"
                      onKeyDown={e => { if (e.key === 'Enter') navigate(`/book/${book.id}`); }}
                    >
                      {/* Image Container */}
                      <div className="relative pt-[100%] overflow-hidden bg-gray-50 rounded-t-lg">
                        <img
                          src={book.images[0].small_url}
                          alt={book.name}
                          className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300"
                        />

                        {/* Badges under image */}
                        <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                          <img src="https://salt.tikicdn.com/ts/upload/c2/bc/6d/ff18cc8968e2bbb43f7ac58efbfafdff.png" alt="Chính Hãng" className="h-70 w-60 absolute bottom-2 left-2" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-2 flex-grow flex flex-col">
                        {/* Title */}
                        <h3 className="text-sm text-gray-800 mb-1.5 line-clamp-2 leading-snug transition-colors flex-grow">
                          {book.name}
                        </h3>

                        {/* Rating and Sold count */}
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
                          <StarRating rating={book.rating_average || 0} />
                          <div className="w-px h-3 bg-gray-200"></div>
                          <span>Đã bán {book.quantity_sold?.value || 0}</span>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-base font-bold text-red-500">
                            {book.list_price.toLocaleString()}₫
                          </span>
                          {book.original_price > book.list_price && (
                            <span className="text-xs bg-gray-100 text-gray-500 font-semibold px-1 py-0.5 rounded">
                              -{Math.round(((book.original_price - book.list_price) / book.original_price) * 100)}%
                            </span>
                          )}
                        </div>

                        {/* Shipping */}
                        <div className="text-xs text-gray-700 flex items-center gap-1">
                          <img src="/iconnow.png" alt="Now Ship" className="h-4"/>
                          <span>Giao siêu tốc 2h</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* No Results */}
                {!loading && filteredAndSortedBooks.length === 0 && (
                  <div className="text-center py-16 col-span-full">
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
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
    </div>
  );
};

export default HomeComponent;