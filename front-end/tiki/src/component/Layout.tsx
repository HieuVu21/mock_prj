import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, fullWidth = false, className = '' }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      
      <main className={`flex-1 ${fullWidth ? '' : 'max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6'} ${className}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;