import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import type { Books } from "../interface/book.interface";
import DescriptionComponent from "./DescriptionComponent";
import StarRating from "./StarRating";
import Header from './Header';
import Footer from './Footer';
import Breadcrumb from './Breadcrumb';

const BookDetailComponent = () => {
  const { id } = useParams();
  const [book, setBook] = useState<Books | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<Books[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState<number>(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);
  const itemsPerPage = 8; // 4 columns x 2 rows

  useEffect(() => {
    const fetchBookAndRelated = async () => {
      if (id) {
        try {
          setLoading(true);
          // Fetch book details
          const bookResponse = await fetch(`http://localhost:3000/books/${id}`);
          const bookData = await bookResponse.json();
          setBook(bookData);
          
          // Fetch related books if category is available
          if (bookData.categories && bookData.categories.id) {
            const categoryId = bookData.categories.id;
            // First, get all books in the same category
            const allBooksResponse = await fetch('http://localhost:3000/books');
            const allBooks = await allBooksResponse.json();
            
            // Filter books in the same category (excluding current book)
            const related = allBooks.filter((b: Books) => 
              b.id !== id && 
              b.categories && 
              b.categories.id === categoryId
            ).slice(0, 4); // Limit to 4 related books
            
            setRelatedBooks(related);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchBookAndRelated();
  }, [id]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!book) return <div className="p-8 text-center">Đang tải...</div>;


  const getAuthorName = () => {
    if (book.authors && book.authors.length > 0) {
      return book.authors.map(author => author.name).join(', ');
    }
    return 'Đang cập nhật';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  };

  // CSS styles for the 3-column layout
  const containerStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1.5fr 1fr',
    gap: '2rem',
    width: '100%',
    position: 'relative'
  };

  const leftColumnStyles: React.CSSProperties = {
    order: isMobile ? 2 : 1
  };

  const middleColumnStyles: React.CSSProperties = {
    order: isMobile ? 1 : 2
  };

  const rightColumnStyles: React.CSSProperties = {
    position: isMobile ? 'relative' : 'sticky',
    top: '1rem',
    height: 'fit-content',
    order: isMobile ? 3 : 3
  };

  const spaceYStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  };

  const purchaseCardStyles: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
  };

  // Get category name from book data
  const getCategoryName = () => {
    if (book?.categories?.name) {
      return book.categories.name;
    }
    return 'Danh mục';
  };

  return (
    <>
      <Header />
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb 
            items={[
              { name: 'Trang chủ', path: '/' },
              { name: getCategoryName(), path: `/?category=${book.categories.id || ''}` },
              { name: book?.name || 'Sản phẩm' }
            ]} 
          />
        </div>
      </div>
      <div className="p-6 bg-gray-100" style={{ minHeight: '100vh' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', width: '100%' }}>
          <div style={containerStyles}>
            {/* Left Column - Book Images */}
            <div style={leftColumnStyles}>
              <div className="bg-white rounded-lg p-4 flex flex-col items-center sticky top-4">
                <img
                  src={book.images[selectedImg]?.large_url}
                  alt={book.name}
                  className="rounded"
                  style={{ 
                    width: '100%', 
                    maxWidth: '24rem', 
                    height: '24rem', 
                    objectFit: 'contain',
                    marginBottom: '1rem',
                    border: '1px solid #e5e7eb'
                  }}
                />
                <div className="relative">
                  <div className="flex overflow-x-auto py-2 gap-2 hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
                    {book.images.slice(thumbnailStartIndex, thumbnailStartIndex + 5).map((img, idx) => {
                      const actualIndex = thumbnailStartIndex + idx;
                      return (
                        <img
                          key={actualIndex}
                          src={img.thumbnail_url}
                          alt={book.name}
                          className={`flex-shrink-0 rounded ${selectedImg === actualIndex ? 'border-blue-500' : 'border-gray-200'}`}
                          style={{
                            width: '3rem',
                            height: '4rem',
                            objectFit: 'contain',
                            border: selectedImg === actualIndex ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                            cursor: 'pointer'
                          }}
                          onClick={() => setSelectedImg(actualIndex)}
                        />
                      );
                    })}
                  </div>
                  {thumbnailStartIndex > 0 && (
                    <button
                      onClick={() => setThumbnailStartIndex(prev => Math.max(0, prev - 1))}
                      className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                      style={{
                        transform: 'translate(-50%, -50%)',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}
                  {thumbnailStartIndex < book.images.length - 5 && (
                    <button
                      onClick={() => setThumbnailStartIndex(prev => Math.min(book.images.length - 5, prev + 1))}
                      className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                      style={{
                        transform: 'translate(50%, -50%)',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Middle Column - Book Info and Description */}
            <div style={middleColumnStyles}>
              <div style={spaceYStyles}>
                {/* Book Title Card */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex">
                      <span className="w-12 text-gray-500 text-sm">Tác giả:</span>
                      <span className="text-blue-600 font-medium text-sm">
                        {getAuthorName()}
                      </span>
                    </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{book.name}</h1>
                  
                  {/* Rating and Reviews */}
                  <div className="flex items-center">
                    <div className="flex items-center">
                      <div className="flex items-center mr-1">
                        <StarRating rating={book.rating_average || 0} />
                        <span className="text-sm text-gray-600 ml-1">
                          {typeof book.rating_average === 'number' ? book.rating_average.toFixed(1) : '0.0'}
                        </span>
                      </div>
                      {book.review_count && (
                        <>
                          <span className="mx-1 text-gray-400">•</span>
                          <span className="text-sm text-blue-600 underline hover:text-blue-800 cursor-pointer">
                            {book.review_count} đánh giá
                          </span>
                        </>
                      )}
                    </div>
                    {(book.quantity_sold?.value > 0) && (
                      <>
                        <div className="h-4 w-px bg-gray-300 mx-3"></div>
                        <div className="text-sm text-gray-500">
                          Đã bán {book.quantity_sold.value}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex items-end">
                    <span className="text-3xl font-bold text-red-600 mr-3">
                      {formatPrice(book.list_price || 0)}
                    </span>
                    {book.original_price && book.original_price > book.list_price && (
                      <div className="flex items-center">
                        <span className="text-base text-gray-500 line-through mr-2">
                          {formatPrice(book.original_price)}
                        </span>
                        <span className="bg-red-600 text-white text-xs font-medium px-2 py-0.5 rounded">
                          -{Math.round((1 - (book.list_price / book.original_price)) * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Specifications Card */}
                {book.specifications && book.specifications.length > 0 && (
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="space-y-6">
                      {book.specifications.map((spec, specIndex) => (
                        <div key={specIndex}>
                          <h2 className="text-base font-medium text-gray-800 mb-3">{spec.name}</h2>
                          <div className="border border-gray-200 rounded">
                          {spec.attributes.map((attr, attrIndex) => (
                            <div 
                              key={attrIndex} 
                                className={`flex ${attrIndex < spec.attributes.length - 1 ? 'border-b border-gray-200' : ''} ${attrIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                            >
                                <div className="w-1/3 py-3 px-4 text-sm text-gray-500 font-medium">
                                {attr.name}
                              </div>
                              <div className="w-2/3 py-3 px-4 text-sm text-gray-900">
                                {attr.value}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                )}

                {/* Description Card */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Mô tả sản phẩm</h2>
                  <div className="relative">
                    <div className="prose max-w-none text-gray-700">
                      {showFullDescription ? (
                        <DescriptionComponent description={book.description || "Đang cập nhật"} />
                      ) : (
                        <DescriptionComponent description={book.short_description || book.description || "Đang cập nhật"} />
                      )}
                    </div>
                    {book.description && book.description.length > 200 && (
                      <div className="mt-2 text-right">
                        <button 
                          onClick={() => setShowFullDescription(!showFullDescription)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium focus:outline-none"
                        >
                          {showFullDescription ? (
                            <span className="flex items-center justify-end">
                              Thu gọn <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                            </span>
                          ) : (
                            <span className="flex items-center justify-end">
                              Xem thêm <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </span>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                {/* Related Books Section - Compact 4 Column Grid */}
                {relatedBooks.length > 0 && (
                  <div className="mt-6 bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-lg font-semibold text-gray-800">Sản phẩm tương tự</h2>
                      {relatedBooks.length > itemsPerPage && (
                        <div className="flex space-x-1">
                          <button 
                            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                            disabled={currentPage === 0}
                            className="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Trang trước"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => setCurrentPage(prev => 
                              Math.min(prev + 1, Math.ceil(relatedBooks.length / itemsPerPage) - 1)
                            )}
                            disabled={currentPage >= Math.ceil(relatedBooks.length / itemsPerPage) - 1}
                            className="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Trang sau"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="relative">
                      <div className="grid grid-cols-4 gap-2">
                        {relatedBooks
                          .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
                          .map((relatedBook) => (
                            <Link 
                              key={relatedBook.id} 
                              to={`/books/${relatedBook.id}`} 
                              className="flex flex-col hover:shadow-sm transition-shadow rounded overflow-hidden bg-white"
                            >
                              <div className="relative pt-[140%]">
                                <img 
                                  src={relatedBook.images?.[0]?.base_url || 'https://via.placeholder.com/100x140'} 
                                  alt={relatedBook.name}
                                  className="absolute top-0 left-0 w-full h-full object-cover p-1"
                                  loading="lazy"
                                />
                              </div>
                              <div className="p-1.5 flex-1 flex flex-col">
                                <h3 className="text-xs font-medium text-gray-900 line-clamp-2 mb-1 leading-tight">
                                  {relatedBook.name}
                                </h3>
                                <div className="mt-auto">
                                  <div className="flex flex-col">
                                    <span className="text-red-600 font-semibold text-xs">
                                      {relatedBook.list_price ? formatPrice(relatedBook.list_price) : 'NaN'}
                                    </span>
                                    {relatedBook.original_price && relatedBook.original_price > relatedBook.list_price && (
                                      <span className="text-[10px] text-gray-500 line-through">
                                        {formatPrice(relatedBook.original_price)}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center mt-1">
                                    <StarRating rating={relatedBook.rating_average || 0} />
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
                </div>
              </div>
            </div>

            {/* Right Column - Purchase Section */}
            <div style={rightColumnStyles}>
              <div style={purchaseCardStyles}>
                {/* Seller Info */}
                <div className="mb-4 pb-3 border-b border-gray-200">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-2">
                      {book.current_seller?.logo ? (
                        <img 
                          src={book.current_seller.logo} 
                          alt={book.current_seller.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-blue-600 text-sm font-medium">
                          {book.current_seller?.name?.charAt(0) || 'T'}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-800">
                        {book.current_seller.name}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        
                        {book.current_seller.is_offline_installment_supported && (
                          <span className="flex items-center">
                            <svg className="w-3.5 h-3.5 text-green-500 mr-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Chính hãng
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Section */}
                <div className="mb-4">
                  <div className="text-2xl font-bold text-red-600 mb-1">
                    {book.list_price ? formatPrice(book.list_price * quantity) : 'NAN'}
                  </div>
                  
                  {book.original_price && book.original_price > book.list_price && (
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 line-through mr-2">
                        {formatPrice(book.original_price)}
                      </span>
                      <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                        -{Math.round((1 - book.list_price / book.original_price) * 100)}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Quantity Selector */}
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <span className="text-sm text-gray-700 mr-4">Số lượng</span>
                    <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                      <button 
                        className="px-3 py-1 text-lg font-medium hover:bg-gray-50 text-gray-600"
                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <span className="px-4 py-1 border-l border-r border-gray-300 text-center w-12">
                        {quantity}
                      </span>
                      <button 
                        className="px-3 py-1 text-lg font-medium hover:bg-gray-50 text-gray-600"
                        onClick={() => setQuantity(prev => prev + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  </div>

                {/* Action Buttons */}
                <div className="mb-4">
                  <button 
                    className="w-full py-2.5 rounded-md font-medium text-white flex items-center justify-center bg-orange-500 hover:bg-orange-600 transition-colors mb-2"
                  >
                    <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Mua ngay
                  </button>
                  <button 
                    className="w-full py-2.5 rounded-md font-medium flex items-center justify-center border border-orange-500 text-orange-500 hover:bg-orange-50 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Thêm vào giỏ
                  </button>
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

export default BookDetailComponent;