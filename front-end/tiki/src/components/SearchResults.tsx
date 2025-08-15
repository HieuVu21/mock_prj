import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import type { Books } from '../interface/book.interface';
import StarRating from './StarRating';
import Footer from './Footer';
import Header from './Header';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Books[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [screenSize, setScreenSize] = useState(window.innerWidth);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:3000/books?q=${encodeURIComponent(query)}`
        );
        if (!response.ok) throw new Error('Failed to fetch results');
        const data = await response.json();
        setResults(data);
        setError(null);
      } catch (err) {
        console.error('Search error:', err);
        setError('Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  useEffect(() => {
    const handleResize = () => {
      setScreenSize(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  };

  // Determine grid columns based on screen size
  const getGridColumns = () => {
    if (screenSize >= 1280) return 4; // xl: 4 columns
    if (screenSize >= 1024) return 3;  // lg: 3 columns
    if (screenSize >= 640) return 2;   // sm: 2 columns
    return 1; // mobile: 1 column
  };

  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${getGridColumns()}, 1fr)`,
    gap: '1.5rem'
  };

  const cardStyles: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    overflow: 'hidden',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    cursor: 'pointer',
    transition: 'box-shadow 0.2s ease-in-out'
  };

  const cardHoverStyles: React.CSSProperties = {
    ...cardStyles,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
  };

  const imageContainerStyles: React.CSSProperties = {
    aspectRatio: '2/3',
    backgroundColor: '#f3f4f6',
    position: 'relative'
  };

  const imageStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    padding: '1rem'
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '3rem', paddingBottom: '3rem' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ textAlign: 'center' }}>Đang tìm kiếm "{query}"...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '3rem', paddingBottom: '3rem' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ textAlign: 'center', color: '#dc2626' }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>
      <Header />
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
        <h1 className="text-2xl font-bold text-gray-900 mb-6 mt-6">
          Kết quả tìm kiếm cho: "{query}"
          <span className="text-gray-500 text-lg" style={{ marginLeft: '0.5rem' }}>({results.length} kết quả)</span>
        </h1>
        
        {results.length > 0 ? (
          <div style={gridStyles}>
            {results.map((book) => (
              <div 
                key={book.id}
                style={cardStyles}
                onClick={() => navigate(`/books/${book.id}`)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                }}
              >
                <div style={imageContainerStyles}>
                  <img
                    src={book.images?.[0]?.base_url || 'https://via.placeholder.com/200x300'}
                    alt={book.name}
                    style={imageStyles}
                    loading="lazy"
                  />
                </div>
                <div style={{ padding: '1rem' }}>
                  <h3 className="text-sm font-medium text-gray-900" 
                      style={{ 
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        height: '2.5rem',
                        marginBottom: '0.5rem',
                        lineHeight: '1.25rem'
                      }}>
                    {book.name}
                  </h3>
                  <div className="flex items-center" style={{ marginBottom: '0.5rem' }}>
                    <StarRating rating={book.rating_average || 0} />
                    {book.review_count !== undefined && book.review_count > 0 && (
                      <span className="text-xs text-gray-500" style={{ marginLeft: '0.25rem' }}>({book.review_count})</span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-red-600 font-semibold">
                      {book.list_price ? formatPrice(book.list_price) : 'Liên hệ'}
                    </span>
                    {book.original_price && book.original_price > book.list_price && (
                      <span className="text-xs text-gray-500" style={{ textDecoration: 'line-through' }}>
                        {formatPrice(book.original_price)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', paddingTop: '3rem', paddingBottom: '3rem' }}>
            <div className="text-gray-500 text-lg mb-6 mt-6">Không tìm thấy kết quả cho "{query}"</div>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white rounded-md font-medium"
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#2563eb',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8'}
              onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb'}
            >
              Quay lại trang chủ
            </button>
          </div>
        )}
      </div>
      <Footer/>
    </div>
  );
};

export default SearchResults;