import { useState } from 'react';
import { ChevronUp, Filter } from 'lucide-react';

const sortOptions = [
  { id: 'popular', label: 'Phổ biến' },
  { id: 'bestseller', label: 'Bán chạy' },
  { id: 'new', label: 'Hàng mới' },
  { id: 'price', label: 'Giá ↑' }
];

const filterTags = [
  { id: 'filter', label: 'Lọc', icon: Filter, active: false },
  { id: 'new', label: 'NEW', active: false },
  { id: 'topdeal', label: 'TOP DEAL', active: true },
  { id: 'freeship', label: 'FREESHIP EXTRA', active: false }
];

export function FilterTabs() {
  const [activeSort, setActiveSort] = useState('popular');

  return (
    <div className="bg-white px-4 py-3 border-b border-gray-100">
      {/* Sort options */}
      <div className="flex items-center gap-4 mb-3">
        {sortOptions.map(option => (
          <button
            key={option.id}
            onClick={() => setActiveSort(option.id)}
            className={`text-sm pb-2 border-b-2 transition-colors ${
              activeSort === option.id 
                ? 'text-[#1BA9FF] border-[#1BA9FF]' 
                : 'text-gray-600 border-transparent'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Filter tags */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {filterTags.map(tag => {
          const IconComponent = tag.icon;
          return (
            <button
              key={tag.id}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs whitespace-nowrap border ${
                tag.active 
                  ? 'bg-[#1BA9FF] text-white border-[#1BA9FF]' 
                  : 'bg-white text-gray-600 border-gray-300'
              }`}
            >
              {IconComponent && <IconComponent className="h-3 w-3" />}
              <span>{tag.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}