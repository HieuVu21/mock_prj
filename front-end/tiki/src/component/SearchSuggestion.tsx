import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Books } from '../interface/book.interface';

interface SearchSuggestionProps {
  query: string;
  onSelect: (query: string) => void;
  onClose: () => void;
}

const SearchSuggestion = ({ query, onSelect, onClose }: SearchSuggestionProps) => {
  const [suggestions, setSuggestions] = useState<Books[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query.trim()) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:3000/books?q=${encodeURIComponent(query)}&_limit=5`
        );
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!query.trim() || (suggestions.length === 0 && !loading)) {
    return null;
  }

  return (
    <div 
      ref={dropdownRef}
      className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-96 overflow-y-auto"
    >
      {loading ? (
        <div className="p-4 text-gray-500 text-sm">Đang tìm kiếm...</div>
      ) : suggestions.length > 0 ? (
        <ul className="py-1">
          {suggestions.map((book) => (
            <li 
              key={book.id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
              onClick={() => {
                navigate(`/books/${book.id}`);
                onClose();
              }}
            >
              <img 
                src={book.images?.[0]?.thumbnail_url || 'https://via.placeholder.com/40x50'} 
                alt={book.name}
                className="w-10 h-12 object-cover mr-3"
              />
              <div>
                <div className="text-sm font-medium text-gray-900 line-clamp-1">{book.name}</div>
                <div className="text-sm text-red-600 font-medium">
                  {book.list_price ? new Intl.NumberFormat('vi-VN').format(book.list_price) + '₫' : 'Liên hệ'}
                </div>
              </div>
            </li>
          ))}
          <li 
            className="px-4 py-2 bg-gray-50 text-blue-600 hover:bg-gray-100 cursor-pointer text-sm font-medium"
            onClick={() => {
              navigate(`/search?q=${encodeURIComponent(query)}`);
              onClose();
            }}
          >
            Xem tất cả kết quả cho "{query}"
          </li>
        </ul>
      ) : (
        <div className="p-4 text-gray-500 text-sm">Không tìm thấy kết quả</div>
      )}
    </div>
  );
};

export default SearchSuggestion;
