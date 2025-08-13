import React from 'react';

interface DescriptionComponentProps {
  description: string;
}

const DescriptionComponent: React.FC<DescriptionComponentProps> = ({ description }) => {
  return (
    <div 
      className="text-gray-700 text-sm"
      dangerouslySetInnerHTML={{ __html: description }}
    />
  );
};

export default DescriptionComponent;