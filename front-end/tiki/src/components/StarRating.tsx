import React from 'react';

interface StarRatingProps {
  rating: number;
  totalStars?: number;
}

const Star: React.FC<{ fill: string; id?: string }> = ({ fill, id }) => (
  <svg className="w-4 h-4" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 0L13.4697 7.15685H21.3511L15.4407 11.5865L17.9104 18.7434L11 14.3137L4.08961 18.7434L6.55928 11.5865L0.648926 7.15685H8.5303L11 0Z" fill={id ? `url(#${id})` : fill} />
  </svg>
);

const StarRating: React.FC<StarRatingProps> = ({ rating, totalStars = 5 }) => {
  const fullStars = Math.floor(rating);
  const partialFill = rating % 1;
  const emptyStars = totalStars - fullStars - (partialFill > 0 ? 1 : 0);

  const gradientId = `grad-${Math.random()}`;

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => <Star key={`full-${i}`} fill="#FFC400" />)}

      {partialFill > 0 && (
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset={`${partialFill * 100}%`} style={{ stopColor: '#FFC400', stopOpacity: 1 }} />
              <stop offset={`${partialFill * 100}%`} style={{ stopColor: '#E0E0E0', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
        </svg>
      )}
      {partialFill > 0 && <Star fill={`url(#${gradientId})`} id={gradientId} />}

      {[...Array(emptyStars < 0 ? 0 : emptyStars)].map((_, i) => <Star key={`empty-${i}`} fill="#E0E0E0" />)}
    </div>
  );
};

export default StarRating;
