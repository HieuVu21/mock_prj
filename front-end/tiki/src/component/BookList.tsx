import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router";
import type { Books } from "../interface/book.interface";
import Header from "./Header";
import { MobileHeader } from "./mobile/Header";
import Footer from "./Footer";
import SkeletonCard from "./SkeletonCard";
import StarRating from "./StarRating";
import Banner from "./Banner";

const baseUrl = "http://localhost:3000";
const API_URL = baseUrl + "/books";

const HomeComponent = () => {
  const [books, setBooks] = useState<Books[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<"name" | "rating" | "sold" | "price">(
    "name"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(true);
  const [screenSize, setScreenSize] = useState(window.innerWidth);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setBooks(data))
      .catch((error) => console.error("Failed to fetch books:", error))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleResize = () => setScreenSize(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = new Map();
    books.forEach((book) => {
      if (book.categories) {
        uniqueCategories.set(book.categories.id, book.categories.name);
      }
    });
    return Array.from(uniqueCategories.entries()).map(([id, name]) => ({
      id,
      name,
    }));
  }, [books]);

  // Filter and sort books
  const filteredAndSortedBooks = useMemo(() => {
    let filtered = books.filter((book) => {
      const matchesSearch =
        searchTerm === "" ||
        book.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (book.short_description &&
          book.short_description
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (book.description &&
          book.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        selectedCategory === "" ||
        (book.categories && book.categories.id.toString() === selectedCategory);

      return matchesSearch && matchesCategory;
    });

    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "rating":
          aValue = a.rating_average || 0;
          bValue = b.rating_average || 0;
          break;
        case "sold":
          aValue = a.quantity_sold?.value || 0;
          bValue = b.quantity_sold?.value || 0;
          break;
        case "price":
          aValue = a.list_price;
          bValue = b.list_price;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortOrder === "asc"
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
    });

    return filtered;
  }, [books, searchTerm, selectedCategory, sortBy, sortOrder]);

  // Determine grid columns based on screen size
  const getProductColumns = () => {
    if (screenSize >= 1536) return 5; // 2xl screens
    if (screenSize >= 1280) return 4; // xl screens
    if (screenSize >= 1024) return 3; // lg screens
    if (screenSize >= 640) return 2; // sm screens
    return 1; // mobile
  };

  // Layout styles
  const mainContainerStyles: React.CSSProperties = {
    minHeight: "100vh",
    backgroundColor: "#f9fafb",
  };

  const contentStyles: React.CSSProperties = {
    maxWidth: "1440px",
    margin: "0 auto",
    padding:
      screenSize >= 1024
        ? "0 2rem"
        : screenSize >= 768
        ? "0 1.25rem"
        : "0 0.5rem",
    paddingTop: screenSize >= 640 ? "1.5rem" : "1rem",
    paddingBottom: screenSize >= 640 ? "1.5rem" : "1rem",
  };

  const layoutStyles: React.CSSProperties = {
    display: "flex",
    gap: "1.5rem",
    flexDirection: screenSize >= 768 ? "row" : "column",
  };

  // Hide sidebar on mobile
  const shouldShowSidebar = screenSize >= 768;

  const sidebarStyles: React.CSSProperties = {
    width: screenSize >= 1024 ? "280px" : screenSize >= 768 ? "240px" : "100%",
    flexShrink: 0,
    position: screenSize < 768 ? "sticky" : "static",
    top: screenSize < 640 ? "56px" : "0", // Account for mobile header
    zIndex: 10,
    backgroundColor: screenSize < 768 ? "white" : "transparent",
    padding: screenSize < 768 ? "0.5rem 0" : "0",
    boxShadow: screenSize < 768 ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
    borderBottom: screenSize < 768 ? "1px solid #e5e7eb" : "none",
  };

  const productGridContainerStyles: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const productGridStyles: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${getProductColumns()}, 1fr)`,
    gap:
      screenSize >= 1024 ? "1.5rem" : screenSize >= 640 ? "0.75rem" : "0.5rem",
    width: "100%",
    padding: screenSize < 640 ? "0.25rem" : "0",
  };

  const skeletonGridStyles: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${getProductColumns()}, 1fr)`,
    gap: "1rem",
  };

  // Render header based on screen size
  const renderHeader = () => {
    if (screenSize < 768) {
      return <MobileHeader />;
    }
    return <Header />;
  };

  return (
    <div style={mainContainerStyles}>
      {renderHeader()}
      {/* Main Content */}
      <div style={contentStyles}>
        {/* Page Title - Hidden on mobile */}
        {screenSize >= 768 && (
          <div
            key="page-title"
            className="flex items-center justify-between mb-6"
          >
            <h1 className="text-2xl font-bold text-gray-900">Sách</h1>
          </div>
        )}

        <div style={layoutStyles}>
          {/* Sidebar - Hidden on mobile */}
          {shouldShowSidebar && (
            <div style={sidebarStyles}>
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden sticky top-0">
                <h3 className="font-semibold text-gray-900 text-xs px-4 py-3 bg-gray-50 border-b border-gray-100">
                  Danh mục sản phẩm
                </h3>
                <div className="divide-y divide-gray-100">
                  <button
                    onClick={() => setSelectedCategory("")}
                    className={`w-full text-left px-4 py-3 text-xs transition-colors duration-150 ${
                      selectedCategory === ""
                        ? "bg-blue-50 text-blue-600 font-medium border-l-4 border-blue-500"
                        : "text-gray-700 hover:bg-gray-50 hover:text-blue-600 hover:font-medium"
                    }`}
                  >
                    <span className="flex items-center">Tất cả sản phẩm</span>
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() =>
                        setSelectedCategory(category.id.toString())
                      }
                      className={`w-full text-left px-4 py-3 text-xs transition-colors duration-150 ${
                        selectedCategory === category.id.toString()
                          ? "bg-blue-50 text-blue-600 font-medium border-l-4 border-blue-500"
                          : "text-gray-700 hover:bg-gray-50 hover:text-blue-600 hover:font-medium"
                      }`}
                    >
                      <span className="flex items-center">{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Product Grid Container - Full width on mobile */}
          <div
            style={{
              ...productGridContainerStyles,
              width: shouldShowSidebar ? "auto" : "100%",
              padding: shouldShowSidebar ? "0" : "0 0.5rem",
            }}
          >
            {/* Banner - Hidden on mobile */}
            {screenSize >= 768 && <Banner />}

            {/* Category Section - Hidden on mobile */}
            {screenSize >= 768 && (
              <div className="bg-white p-4 mb-6 rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">
                  Khám phá theo danh mục
                </h2>
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 overflow-x-auto pb-3 -mx-2 px-2 no-scrollbar">
                  {[
                    { src: "/quanque.png", alt: "English Books" },
                    { src: "/tangluong.png", alt: "Sách tiếng Việt" },
                    { src: "/casio.png", alt: "Văn phòng phẩm" },
                    { src: "/meomeo.png", alt: "Quà lưu niệm" },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center w-20 sm:w-24 flex-shrink-0"
                    >
                      <div className="w-20 h-20 rounded-full overflow-hidden border-2 p-1 bg-white cursor-pointer">
                        <img
                          src={item.src}
                          alt={item.alt}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="mt-2 text-xs text-center text-gray-700 line-clamp-2 h-8 flex items-center">
                        {item.alt}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Filter options */}
            <div className="mb-4 bg-white p-4 rounded-lg shadow-sm">
              <h2 className="text-lg font-medium mb-3">Tất cả sản phẩm</h2>
              <div className="flex items-center gap-1 sm:gap-0 divide-x divide-gray-200 overflow-x-auto pb-3 -mx-2 px-2 no-scrollbar">
                <label className="flex items-center gap-1.5 bg-white px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-gray-50 flex-shrink-0 text-sm sm:text-base">
                  <input
                    type="checkbox"
                    className="rounded text-blue-500 border-gray-300 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                  />
                  <div className="flex items-center gap-2">
                    <img src="/iconnow.png" alt="Now" className="h-4" />
                    <span className="text-[11px] sm:text-xs whitespace-nowrap">
                      Giao siêu tốc 2H
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-1.5 bg-white px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-gray-50 flex-shrink-0 text-sm sm:text-base">
                  <input
                    type="checkbox"
                    className="rounded text-blue-500 border-gray-300 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-red-500 font-medium">
                      TOP DEAL
                    </span>
                    <span className="text-[11px] sm:text-xs whitespace-nowrap">
                      Siêu rẻ
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-1.5 bg-white px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-gray-50 flex-shrink-0 text-sm sm:text-base">
                  <input
                    type="checkbox"
                    className="rounded text-blue-500 border-gray-300 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-blue-600 font-medium">
                      FREESHIP
                    </span>
                    <span className="text-[11px] sm:text-xs whitespace-nowrap">
                      XTRA
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-1.5 bg-white px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-gray-50 flex-shrink-0 text-sm sm:text-base">
                  <input
                    type="checkbox"
                    className="rounded text-blue-500 border-gray-300 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-yellow-400">★★★★★</span>
                    <span className="text-[11px] sm:text-xs whitespace-nowrap">
                      từ 4 sao
                    </span>
                  </div>
                </label>
              </div>
              {/* Sort options */}
              <div className="flex items-center justify-between my-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">Sắp xếp</span>
                  <div className="relative">
                    <select
                      value={`${sortBy}-${sortOrder}`}
                      onChange={(e) => {
                        const [selectedSortBy, selectedSortOrder] =
                          e.target.value.split("-") as [
                            "rating" | "sold" | "price",
                            "asc" | "desc"
                          ];
                        setSortBy(selectedSortBy);
                        setSortOrder(selectedSortOrder);
                      }}
                      className="appearance-none bg-white border border-gray-300 rounded-full pl-3 pr-8 py-2 text-xs font-medium text-gray-700 focus:outline-none  cursor-pointer transition-colors duration-200"
                    >
                      <option value="sold-desc">Bán chạy nhất</option>
                      <option value="rating-desc">Đánh giá cao nhất</option>
                      <option value="price-asc">Thấp đến cao</option>
                      <option value="price-desc">Cao đến thấp</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-gray-500">
                      <svg
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Grid */}
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
                        onKeyDown={(e) => {
                          if (e.key === "Enter") navigate(`/books/${book.id}`);
                        }}
                      >
                        {/* Image Container */}
                        <div
                          style={{
                            position: "relative",
                            paddingTop: "100%",
                            overflow: "hidden",
                            backgroundColor: "#f9fafb",
                            borderTopLeftRadius: "0.5rem",
                            borderTopRightRadius: "0.5rem",
                          }}
                        >
                          <img
                            src={
                              book.images?.[0]?.small_url ||
                              "/placeholder-book.jpg"
                            }
                            alt={book.name}
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              transition: "transform 0.3s ease",
                            }}
                          />
                        </div>

                        {/* Content */}
                        <div
                          style={{
                            padding: "0.5rem",
                            flexGrow: 1,
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          {/* Title */}
                          <h3 className="text-sm text-gray-800 mb-1.5 line-clamp-2 leading-snug transition-colors flex-grow">
                            {book.name}
                          </h3>

                          {/* Rating and Sold count */}
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
                            <StarRating rating={book.rating_average || 0} />
                            <div
                              style={{
                                width: "1px",
                                height: "0.75rem",
                                backgroundColor: "#e5e7eb",
                              }}
                            ></div>
                            <span>Đã bán {book.quantity_sold?.value || 0}</span>
                          </div>

                          <div className="flex items-baseline gap-2 mb-2">
                            {book.original_price >
                            (book.current_seller?.price ?? book.list_price) ? (
                              <>
                                <span className="text-base font-bold text-red-500">
                                  {(
                                    book.current_seller?.price ??
                                    book.list_price
                                  ).toLocaleString()}
                                  ₫
                                </span>
                                <span className="text-xs text-black bg-gray-200 font-semibold px-1.5 py-0.5 rounded ml-1 align-middle">
                                  -
                                  {Math.round(
                                    ((book.original_price -
                                      (book.current_seller?.price ??
                                        book.list_price)) /
                                      book.original_price) *
                                      100
                                  )}
                                  %
                                </span>
                              </>
                            ) : (
                              <span className="text-base font-bold text-red-500">
                                {(
                                  book.current_seller?.price ?? book.list_price
                                ).toLocaleString()}
                                ₫
                              </span>
                            )}
                          </div>

                          {/* Shipping */}
                          <div className="text-xs text-gray-700 flex items-center gap-1">
                            <img
                              src="/iconnow.png"
                              alt="Now Ship"
                              style={{ height: "1rem" }}
                            />
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
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Không tìm thấy sản phẩm
                      </h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        {searchTerm
                          ? `Không có sản phẩm nào phù hợp với "${searchTerm}". Hãy thử từ khóa khác hoặc xóa bộ lọc.`
                          : "Không có sản phẩm nào trong danh mục này. Hãy thử danh mục khác."}
                      </p>
                      {(searchTerm || selectedCategory) && (
                        <button
                          onClick={() => {
                            setSearchTerm("");
                            setSelectedCategory("");
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
      </div>
      {screenSize >= 768 && <Footer />}
    </div>
  );
};

export default HomeComponent;
