import { Search, ArrowLeft, Menu } from 'lucide-react';
import { Input } from '../ui/input';

export function MobileHeader() {
  return (
    <header className="bg-[#1BA9FF] px-4 py-3 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        {/* Back arrow */}
        <ArrowLeft className="text-white h-6 w-6" />
        
        {/* Search Bar */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            placeholder="Sách đáng đọc tháng 12"
            className="pl-10 bg-white border-none rounded-lg h-10 text-sm"
          />
        </div>
        
        {/* Menu icon */}
        <Menu className="text-white h-6 w-6" />
      </div>
    </header>
  );
}