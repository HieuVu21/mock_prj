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
  // const baseURL = 'https://be-mock-project.vercel.app'; // Base URL for API requests
  const baseURL = 'http://localhost:3000'; // Base URL for API requests

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Function to normalize Vietnamese text for better search
  const normalizeVietnamese = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd');
  };

  // Function to check if a word exists in the title
  const wordExistsInTitle = (searchWord: string, title: string) => {
    if (!searchWord || !title) return false;
    
    // Normalize both search word and title
    const normalizedSearch = normalizeVietnamese(searchWord.trim());
    const normalizedTitle = normalizeVietnamese(title);
    const originalSearchWord = searchWord.toLowerCase().trim();
    const originalTitle = title.toLowerCase();
    
    // More comprehensive word boundaries for Vietnamese
    const wordBoundaryRegex = /[\s\-\.\,\:\;\!\?\(\)\[\]\{\}\"\'\/\\\|\+\=\*\&\%\$\#\@\~\`\^\<\>\n\r\t\u2013\u2014\u2015\u2016\u2017\u2018\u2019\u201A\u201B\u201C\u201D\u201E\u201F\u2020\u2021\u2022\u2023\u2024\u2025\u2026\u2027\u2030\u2031\u2032\u2033\u2034\u2035\u2036\u2037\u2038\u2039\u203A\u203B\u203C\u203D\u203E\u203F\u2040]/;
    
    // Split title into words using comprehensive word boundaries
    const titleWords = originalTitle.split(wordBoundaryRegex).filter(word => word.length > 0);
    const normalizedTitleWords = normalizedTitle.split(wordBoundaryRegex).filter(word => word.length > 0);
    
    // Debug log to see what words are being compared
    // console.log('Search word:', originalSearchWord, 'Title words:', titleWords);
    
    // Check exact match first (with original diacritics)
    const hasExactMatch = titleWords.some(word => word === originalSearchWord);
    if (hasExactMatch) return true;
    
    // Check normalized match (without diacritics) - STRICT word match only
    const hasNormalizedMatch = normalizedTitleWords.some(word => word === normalizedSearch);
    if (hasNormalizedMatch) return true;
    
    // For very short search terms (1-2 characters), only allow exact matches
    if (originalSearchWord.length <= 2) {
      return false; // Already checked exact and normalized matches above
    }
    
    // For longer terms, allow partial matches only if the search word starts a title word
    const hasStartsWithMatch = titleWords.some(word => 
      word.length >= originalSearchWord.length && word.startsWith(originalSearchWord)
    ) || normalizedTitleWords.some(word => 
      word.length >= normalizedSearch.length && word.startsWith(normalizedSearch)
    );
    
    return hasStartsWithMatch;
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query.trim()) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        // First, fetch all books
        const response = await fetch(baseURL + '/books');
        if (!response.ok) throw new Error('Failed to fetch books');
        const allBooks = await response.json();

        // Split query into words and filter out empty strings
        const searchTerms = query.trim().split(/\s+/).filter(term => term.length > 0);
        
        // Filter and score books based on word matches in title
        const matchedBooks = allBooks
          .map((book: Books) => {
            const title = book.name;
            
            // Check if all search terms exist as words in the title
            const matchingTerms = searchTerms.filter(term => {
              const matches = wordExistsInTitle(term, title);
              // Uncomment below line for debugging
              // if (matches) console.log(`"${term}" matches in "${title}"`);
              return matches;
            });
            
            // Only include books where at least one search term matches
            if (matchingTerms.length === 0) return null;
            
            // Calculate score based on:
            // 1. How many search terms match
            // 2. Exact word matches get higher score
            // 3. Shorter titles get preference for same match count
            let score = 0;
            
            // Base score for each matching term
            score += matchingTerms.length * 10;
            
            // Bonus for exact matches (all search terms found)
            if (matchingTerms.length === searchTerms.length) {
              score += 50;
            }
            
            // Bonus for exact word matches (case sensitive)
            searchTerms.forEach(term => {
              const titleWords = title.split(/[\s\-\.\,\:\;\!\?\(\)\[\]\{\}\"\'\/\\\|\+\=\*\&\%\$\#\@\~\`\^\<\>\n\r\t]/)
                .filter(word => word.length > 0);
              
              if (titleWords.some(word => word.toLowerCase() === term.toLowerCase())) {
                score += 20;
              }
            });
            
            // Small penalty for longer titles to prioritize more relevant results
            score -= Math.floor(title.length / 10);
            
            return { ...book, _score: score, _matchCount: matchingTerms.length };
          })
          .filter((book: any): book is Books & { _score: number; _matchCount: number } => book !== null)
          .sort((a, b) => {
            // Sort by score descending, then by match count descending, then by title length ascending
            if (b._score !== a._score) return b._score - a._score;
            if (b._matchCount !== a._matchCount) return b._matchCount - a._matchCount;
            return a.name.length - b.name.length;
          })
          .slice(0, 8) // Increase limit to 8 suggestions for better results
          .map(({ _score, _matchCount, ...book }) => book); // Remove scoring properties

        setSuggestions(matchedBooks);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 200); // Reduce delay for better UX
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
                className="w-10 h-12 object-cover mr-3 rounded"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">{book.name}</div>
                <div className="text-sm text-red-600 font-medium">
                  {book.list_price ? new Intl.NumberFormat('vi-VN').format(book.list_price) + '₫' : 'Liên hệ'}
                </div>
              </div>
            </li>
          ))}
          <li 
            className="px-4 py-2 bg-gray-50 text-blue-600 hover:bg-gray-100 cursor-pointer text-sm font-medium border-t"
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