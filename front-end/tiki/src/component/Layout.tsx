import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with Hero Section */}
      <header className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        
      </header>

      <div className="flex flex-1">
        <main className="flex-1 bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout; 