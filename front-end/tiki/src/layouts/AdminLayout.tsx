// src/layouts/AdminLayout.tsx

import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingBag, 
  FolderOpen, 
  Menu, 
  X,
  Settings,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext'; 

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Sản phẩm', href: '/admin/products', icon: Package },
  { name: 'Danh mục', href: '/admin/categories', icon: FolderOpen },
  { name: 'Người dùng', href: '/admin/users', icon: Users },
  { name: 'Đơn hàng', href: '/admin/orders', icon: ShoppingBag },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const currentPage = navigation.find(item => isActive(item.href))?.name || 'Dashboard';

  // 1. SỬA LẠI: Nền chính là 'bg-background' thay vì 'bg-muted/40'
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out",
        // 2. SỬA LẠI: Chiều rộng khi thu gọn là w-16
        sidebarOpen ? "w-64" : "w-16"
      )}>
        {/* 3. SỬA LẠI: Sidebar có 'bg-gradient-card', 'border-border/50' và 'shadow-lg' */}
        <div className="flex h-full flex-col bg-gradient-card border-r border-border/50 shadow-lg">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-border/50">
            {sidebarOpen && (
              // 4. SỬA LẠI: Title là 'Admin Panel' và các class font/text
              <h1 className="text-lg font-semibold bg-gradient-primary bg-clip-text text-transparent animate-fade-in">
                Admin Panel
              </h1>
            )}
            <Button
              variant="ghost"
              // 5. SỬA LẠI: Size button là 'sm'
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hover:bg-muted/50"
            >
              {/* 6. SỬA LẠI: Size icon là h-4 w-4 */}
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 px-3 py-4">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={cn(
                    // 7. SỬA LẠI: Các class giống hệt code gốc
                    "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                    active
                      ? "bg-gradient-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <item.icon className={cn(
                    // 8. SỬA LẠI: Class của icon giống hệt code gốc
                    "h-5 w-5 flex-shrink-0 transition-colors",
                    active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                  {sidebarOpen && (
                    <span className="ml-3 animate-fade-in">{item.name}</span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-border/50 p-3 space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn( "w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50", !sidebarOpen && "justify-center" )}
            >
              <Settings className="h-4 w-4 flex-shrink-0" />
              {sidebarOpen && <span className="ml-3">Cài đặt</span>}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout} // Giữ lại logic logout
              className={cn( "w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50", !sidebarOpen && "justify-center" )}
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              {sidebarOpen && <span className="ml-3">Đăng xuất</span>}
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className={cn(
        "transition-all duration-300 ease-in-out",
        // 9. SỬA LẠI: Chiều rộng khi thu gọn là ml-16
        sidebarOpen ? "ml-64" : "ml-16"
      )}>
        {/* Top bar */}
        <header className="bg-card/50 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
          <div className="flex h-16 items-center justify-between px-6">
            <h2 className="text-xl font-semibold text-foreground">
              {currentPage}
            </h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse"></div>
                <span>Online</span>
              </div>
              {/* Giữ lại phần hiển thị user của bạn */}
              <div className="text-sm text-foreground">{user?.email}</div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-6 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}