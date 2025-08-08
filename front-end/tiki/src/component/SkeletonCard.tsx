const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="w-full h-48 bg-gray-300"></div>
      <div className="p-4">
        {/* Title Skeleton */}
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
        
        {/* Rating Skeleton */}
        <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>

        {/* Price Skeleton */}
        <div className="h-6 bg-gray-300 rounded w-1/3"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;
