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
  const [loading, setLoading] = useState(true);
  const [screenSize, setScreenSize] = useState(window.innerWidth);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        setBooks(data);
      })
      .catch(error => console.error('Failed to fetch books:', error))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setScreenSize(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  // Determine grid columns based on screen size
  const getProductColumns = () => {
    if (screenSize >= 1400) return 5; // Very large screens
    if (screenSize >= 1200) return 4; // Large screens
    if (screenSize >= 900) return 3;  // Medium screens
    if (screenSize >= 600) return 2;  // Small screens
    return 1; // Mobile
  };

  // Layout styles
  const mainContainerStyles: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: '#f9fafb'
  };

  const contentStyles: React.CSSProperties = {
    maxWidth: '1248px',
    margin: '0 auto',
    padding: screenSize >= 768 ? '0 1.5rem' : '0 1rem',
    paddingTop: '1.5rem',
    paddingBottom: '1.5rem'
  };

  const layoutStyles: React.CSSProperties = {
    display: 'flex',
    gap: '1.5rem',
    flexDirection: screenSize >= 768 ? 'row' : 'column'
  };

  const sidebarStyles: React.CSSProperties = {
    width: screenSize >= 768 ? '240px' : '100%',
    flexShrink: 0
  };

  const productGridContainerStyles: React.CSSProperties = {
    flex: 1,
    minWidth: 0
  };

  const productGridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${getProductColumns()}, 1fr)`,
    gap: '1rem',
    width: '100%'
  };

  const skeletonGridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${getProductColumns()}, 1fr)`,
    gap: '1rem'
  };

  return (
    <div style={mainContainerStyles}>
      <Header />
      
      {/* Main Content */}
      <div style={contentStyles}>
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
        
        <div style={layoutStyles}>
          {/* Sidebar */}
          <div style={sidebarStyles}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden sticky top-0">
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

          {/* Product Grid Container */}
          <div style={productGridContainerStyles}>
            {loading ? (
              <div style={skeletonGridStyles}>
                {Array.from({ length: 8 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))}
              </div>
            ) : (
              <>
                <div style={productGridStyles}>
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
                      <div style={{ position: 'relative', paddingTop: '100%', overflow: 'hidden', backgroundColor: '#f9fafb', borderTopLeftRadius: '0.5rem', borderTopRightRadius: '0.5rem' }}>
                        <img
                          src={book.images[0].small_url}
                          alt={book.name}
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                        />

                        {/* Badges under image */}
                        <div style={{ position: 'absolute', bottom: '0.5rem', left: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <img src="https://salt.tikicdn.com/ts/upload/c2/bc/6d/ff18cc8968e2bbb43f7ac58efbfafdff.png" alt="Chính Hãng" style={{ height: '70px', width: '60px' }} />
                        </div>
                      </div>

                      {/* Content */}
                      <div style={{ padding: '0.5rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        {/* Title */}
                        <h3 className="text-sm text-gray-800 mb-1.5 line-clamp-2 leading-snug transition-colors flex-grow">
                          {book.name}
                        </h3>

                        {/* Rating and Sold count */}
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
                          <StarRating rating={book.rating_average || 0} />
                          <div style={{ width: '1px', height: '0.75rem', backgroundColor: '#e5e7eb' }}></div>
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
                          <img src="/iconnow.png" alt="Now Ship" style={{ height: '1rem' }} />
                          <span>Giao siêu tốc 2h</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* No Results */}
                {!loading && filteredAndSortedBooks.length === 0 && (
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
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HomeComponent;