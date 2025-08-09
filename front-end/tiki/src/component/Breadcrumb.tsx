import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

type BreadcrumbItem = {
  name: string;
  path?: string;
};

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb = ({ items, className = '' }: BreadcrumbProps) => {
  return (
    <div className={`flex items-center text-sm text-gray-500 ${className}`}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />}
          {item.path ? (
            <Link 
              to={item.path} 
              className="text-gray-500 hover:text-gray-800 hover:underline"
            >
              {item.name}
            </Link>
          ) : (
            <span className="text-gray-500">{item.name}</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default Breadcrumb;
