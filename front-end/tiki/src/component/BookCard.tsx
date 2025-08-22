import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import type { Books } from "../interface/book.interface";
import { useCart } from "../contexts/CartContext";
import DescriptionComponent from "./DescriptionComponent";
import StarRating from "./StarRating";
import Header from './Header';
import Footer from './Footer';
import Breadcrumb from './Breadcrumb';
import { createOrder } from "../services/api";

const BookDetailComponent = () => {
  const baseUrl = 'https://be-mock-project.vercel.app';
  const { id } = useParams();
  const { addToCart } = useCart();
  const [book, setBook] = useState<Books | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<Books[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState<number>(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [topDealPage, setTopDealPage] = useState(0);
  const [similarPage, setSimilarPage] = useState(0);
  const [topDealBooks, setTopDealBooks] = useState<Books[]>([]);
  const [similarBooks, setSimilarBooks] = useState<Books[]>([]);
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const itemsPerPage = 8; // 4 columns x 2 rows
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(baseUrl + `/books/${id}`);
        const data = await response.json();
        setBook(data);

        // Fetch all books for related and top deals
        const allBooksResponse = await fetch(baseUrl+'/books');
        const allBooks = await allBooksResponse.json();
        
        // Filter top deal books (rating > 4)
        const topDeals = allBooks.filter(
          (b: Books) => b.rating_average > 4 && b.id !== data.id
        );
        setTopDealBooks(topDeals);

        // Fetch similar books from the same category
        const similar = allBooks.filter(
          (b: Books) => b.categories.id === data.category_id && b.id !== data.id
        ).slice(0, 8);
        setSimilarBooks(similar);
        
        // Fetch related books from the same category
        if (data.categories && data.categories.id) {
          const categoryId = data.categories.id;
          const related = allBooks.filter(
            (b: Books) => 
              b.id !== data.id && 
              b.categories && 
              b.categories.id === categoryId
          );

          setRelatedBooks(related);
        } 
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
    gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr 0.8fr',
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

  const handleBuyNow = () => {
    if (!book) return;
    
    // Create a cart item for the checkout
    const cartItem = {
      book: {
        id: book.id,
        name: book.name,
        images: book.images,
        list_price: book.list_price,
        original_price: book.original_price,
        current_seller: book.current_seller,
        rating_average: book.rating_average,
        quantity_sold: book.quantity_sold
      },
      quantity: quantity
    };
    
    // Navigate to checkout with the item
    navigate('/checkout', { 
      state: { 
        items: [cartItem],
        fromBuyNow: true
      } 
    });
  };

  return (
    <>
      {/* Top Bar with Freeship message */}
    

      <Header />

        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb
            items={[
              { name: 'Trang chủ', path: '/' },
              { name: getCategoryName(), path: `/?category=${book.categories.id || ''}` },
              { name: book?.name || 'Sản phẩm' }
            ]}
          />
      </div>

      <div className="p-6 " style={{ minHeight: '100vh' }}>
        <div style={{ maxWidth: '120rem', margin: '0 auto', width: '100%' }}>
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
                      onClick={() => setThumbnailStartIndex(prev => Math.max(0, prev - 5))}
                      className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
                      style={{
                        transform: 'translate(-50%, -50%)',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}
                  {thumbnailStartIndex < book.images.length - 5 && (
                    <button
                      onClick={() => setThumbnailStartIndex(prev => Math.min(book.images.length - 5, prev + 5))}
                      className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
                      style={{
                        transform: 'translate(50%, -50%)',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10
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
                <div className="flex items-center mb-2">
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
                        <span className="text-sm text-gray-600 mx-1">
                          {typeof book.rating_average === 'number' ? book.rating_average.toFixed(1) : '0.0'}
                        </span>
                        <StarRating rating={book.rating_average || 0} />
                      </div>
                      
                    </div>
                    
                  </div>
                  <div className="flex items-end">
                    {(() => {
                      const salePrice = book.current_seller?.price ?? book.list_price;
                      const hasDiscount = book.original_price && book.original_price > salePrice;
                      return (
                        <>
                          <span className="text-3xl font-bold text-red-600 mr-3">
                            {formatPrice(salePrice || 0)}
                          </span>
                          {hasDiscount && (
                            <div className="flex items-center">
                              <span className="bg-gray-200 text-black text-xs font-medium px-2 py-0.5 rounded">
                                -{Math.round(((book.original_price - salePrice) / book.original_price) * 100)}%
                              </span>
                              <span className="text-base text-gray-500 line-through ml-2">
                                {formatPrice(book.original_price)}
                              </span>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Specifications Card */}
                {book.specifications && book.specifications.length > 0 && (
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="space-y-6">
                      {book.specifications.map((spec, specIndex) => (
                        <div key={specIndex}>
                          <h2 className="text-base font-medium text-black mb-3">{spec.name}</h2>
                          
                            {spec.attributes.map((attr, attrIndex) => (
                              <div key={attrIndex} className="flex relative bg-white">
                                {attrIndex < spec.attributes.length - 1 && (
                                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200"></div>
                                )}
                                <div className="w-1/3 py-3 px-4 text-sm text-gray-400 font-medium">
                                  {attr.name}
                                </div>
                                <div className="w-2/3 py-3 px-4 text-sm text-gray-900">
                                  {attr.value}
                                </div>
                              </div>
                            ))}
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
                      <div className="relative mt-2">
                        {!showFullDescription && (
                          <div className="absolute bottom-full left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                        )}
                        <div className="text-center">
                          <button
                            onClick={() => setShowFullDescription(!showFullDescription)}
                            className="relative z-10 bg-white text-blue-600 hover:text-blue-800 text-sm font-medium focus:outline-none px-4 py-1 rounded-full shadow-sm"
                          >
                            {showFullDescription ? (
                              <span className="flex items-center justify-center">
                                Thu gọn
                              </span>
                            ) : (
                              <span className="flex items-center justify-center">
                                Xem thêm
                              </span>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  {/* Related Books Section */}
                  {relatedBooks.length > 0 && (
                    <div className="mt-6 bg-white rounded-lg p-4 shadow-sm">


                      <div className="relative">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Sản phẩm tương tự</h3>
                        <div className="relative">
                          <div className="grid grid-cols-4 gap-2">
                            {relatedBooks.slice(currentPage * 4, (currentPage * 4) + 4).map((relatedBook) => (
                              <Link
                                key={relatedBook.id}
                                to={`/books/${relatedBook.id}`}
                                className="flex flex-col hover:shadow-sm transition-shadow rounded overflow-hidden bg-white border border-gray-100"
                              >
                                <div className="relative pt-[140%]">
                                  <img
                                    src={relatedBook.images?.[0]?.base_url || 'https://via.placeholder.com/100x140'}
                                    alt={relatedBook.name}
                                    className="absolute top-0 left-0 w-full h-full object-cover p-1"
                                    loading="lazy"
                                  />
                                </div>
                                <div className="p-2 flex-1 flex flex-col">
                                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
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

                          {/* Next button overlay */}
                          {relatedBooks.length > 4 && (currentPage + 1) * 4 < relatedBooks.length && (
                            <button
                              onClick={() => setCurrentPage(prev => prev + 1)}
                              className="absolute right-6 top-1/2 -translate-y-1/2 translate-x-6 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                              style={{
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 10
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          )}

                          {/* Previous button */}
                          {currentPage > 0 && (
                            <button
                              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                              style={{
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 10
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                          )}
                        </div>
                        <div className="flex justify-center items-center space-x-1 px-2 mt-2">
                                {Array.from({ length: Math.ceil(relatedBooks.length / 4) }, (_, i) => (
                                  <button
                                    key={i}
                                    onClick={() => setCurrentPage(i)}
                                    className={`w-8 h-1 rounded-full ${currentPage === i ? 'bg-blue-600' : 'bg-gray-300'}`}
                                    aria-label={`Page ${i + 1}`}
                                  />
                                ))}
                              </div>
                      </div>
                    </div>
                  )}
                  {/* Top Deal Section */}
                  {topDealBooks.length > 0 && (
                    <div className="mt-6 bg-white rounded-lg p-4 shadow-sm">
                      <div className="relative">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Top Deals</h3>
                        <div className="relative">
                          <div className="grid grid-cols-4 gap-2">
                            {topDealBooks.slice(topDealPage * 4, (topDealPage * 4) + 4).map((book) => (
                              <Link
                                key={book.id}
                                to={`/books/${book.id}`}
                                className="flex flex-col hover:shadow-sm transition-shadow rounded overflow-hidden bg-white border border-gray-100"
                              >
                                <div className="relative pt-[140%]">
                                  <img
                                    src={book.images?.[0]?.base_url || 'https://via.placeholder.com/100x140'}
                                    alt={book.name}
                                    className="absolute top-0 left-0 w-full h-full object-cover p-1"
                                    loading="lazy"
                                  />
                                </div>
                                <div className="p-2 flex-1 flex flex-col">
                                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                                    {book.name}
                                  </h3>
                                  <div className="mt-auto">
                                    <div className="flex flex-col">
                                      <span className="text-red-600 font-semibold text-xs">
                                        {book.current_seller?.price ? formatPrice(book.current_seller.price) : 'Liên hệ'}
                                      </span>
                                      
                                    </div>
                                    <div className="flex items-center mt-1">
                                      <StarRating rating={book.rating_average || 0} />
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                          
                          {/* Navigation Arrows */}
                          {topDealPage > 0 && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setTopDealPage(prev => Math.max(0, prev - 1));
                              }}
                              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                            >
                              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                          )}
                          
                          {(topDealPage + 1) * 4 < topDealBooks.length && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setTopDealPage(prev => Math.min(Math.ceil(topDealBooks.length / 4) - 1, prev + 1));
                              }}
                              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                            >
                              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          )}
                        </div>
                        
                        {/* Pagination Dots */}
                        <div className="flex justify-center items-center space-x-1 px-2 mt-4">
                          {Array.from({ length: Math.ceil(topDealBooks.length / 4) }, (_, i) => (
                            <button
                              key={i}
                              onClick={(e) => {
                                e.preventDefault();
                                setTopDealPage(i);
                              }}
                              className={`w-8 h-1 rounded-full ${topDealPage === i ? 'bg-blue-600' : 'bg-gray-300'}`}
                              aria-label={`Page ${i + 1}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-6 bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-base font-medium">An tâm mua sắm</h2>
                      <img 
                        src="/ic_right.png" 
                        alt="Xem thêm" 
                        className="w-4 h-4 opacity-50 hover:opacity-100 cursor-pointer"
                      />
                    </div>
                    <div className="space-y-3 text-sm text-gray-700">
                      <div className="flex items-start">
                        <div className="w-5 h-5 mr-2 flex-shrink-0 flex items-center justify-center">
                          <img 
                            src="/ic_dongkiem.png" 
                            alt="Đồng kiểm" 
                            className="w-4 h-4 object-contain"
                          />
                        </div>
                        <span>Được đồng kiểm khi nhận hàng</span>
                      </div>
                      <div className="flex items-start">
                        <div className="w-5 h-5 mr-2 flex-shrink-0 flex items-center justify-center">
                          <img 
                            src="/ic_hoantien.png" 
                            alt="Hoàn trả" 
                            className="w-4 h-4 object-contain"
                          />
                        </div>
                        <span>Được hoàn tiền 200% nếu là hàng giả</span>
                      </div>
                      <div className="flex items-start">
                        <div className="w-5 h-5 mr-2 flex-shrink-0 flex items-center justify-center">
                          <img 
                            src="/ic_doitra.png" 
                            alt="Đổi trả" 
                            className="w-4 h-4 object-contain"
                          />
                        </div>
                        <span>Đổi trả miễn phí trong 30 ngày. Được đổi ý.</span>
                      </div>
                    </div>
                    <a href="#" className="text-blue-500 text-sm hover:underline mt-3 inline-block font-medium">Chi tiết</a>
                  </div>
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
                        <img src="/tick_official.png" alt="Official" className="w-12 h-4 ml-1 mt-1" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="mb-4">
                  <div className="text-xl text-gray-700 mb-2">Số lượng</div>
                  <div className="flex items-center space-x-2 mb-2">
                    <button
                      className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 text-gray-600 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <div className="w-12 h-10 flex items-center justify-center border border-gray-300 rounded-md text-center text-lg">
                      {quantity}
                    </div>
                    <button
                      className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 text-gray-600 text-lg font-medium"
                      onClick={() => setQuantity(prev => prev + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Price Section */}
                <div className="mb-4">
                  <div className="text-xl font-bold text-gray-700">
                    Tạm tính
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {(book.current_seller?.price ? formatPrice(book.current_seller.price * quantity) : (book.list_price ? formatPrice(book.list_price * quantity) : 'NAN'))}
                  </div>
                </div>



                {/* Action Buttons */}
                <div className="mb-4">
                  <button 
                    onClick={handleBuyNow}
                    className="w-full py-1.5 rounded-md font-medium text-white flex items-center justify-center bg-red-600 hover:bg-red-700 transition-colors mb-2"
                  >
                    Mua ngay
                  </button>
                  <button 
                    onClick={() => book && addToCart(book, quantity)}
                    className="w-full py-1.5 rounded-md font-medium flex items-center justify-center border border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors mb-2"
                  >
                    Thêm vào giỏ
                  </button>
                  <button 
                    className="w-full py-1.5 rounded-md font-medium flex items-center justify-center border border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    Mua trước trả sau
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