// src/pages/admin/Dashboard.tsx

import { useState, useEffect, useMemo } from 'react';
import { 
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  Eye,
  Star,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/component/ui/card';
import { Button } from '@/component/ui/button';
import { Progress } from '@/component/ui/progress';
import { Link, useNavigate } from 'react-router-dom';

// Import các hàm API
import { getProducts, getOrders, getUsers } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Books } from '@/interface/book.interface';
// Bạn nên tạo interface cho Order và User
type Order = any; 
type User = any;

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  recentOrders: Order[];
  topProducts: Books[];
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Dashboard | Admin Panel";
    
    const fetchData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        // Gọi song song các API để tăng tốc
        const [productsRes, ordersRes, usersRes] = await Promise.all([
          getProducts({ _limit: 1000 }), // Lấy nhiều sản phẩm để tính toán
          getOrders({ isAdmin: true }), // Lấy tất cả đơn hàng cho admin
          getUsers()
        ]);
        
        const products = productsRes.data || [];
        const orders = ordersRes.data || [];
        const users = usersRes.data || [];
        
        // Tính toán số liệu
        const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.totalPrice || 0), 0);
        const totalProducts = products.length; // Hoặc lấy từ header nếu có
        const totalOrders = orders.length;
        const totalUsers = users.length;
        
        const recentOrders = orders.slice(0, 10); // Lấy 3 đơn hàng mới nhất
        
        // Tìm 3 sản phẩm bán chạy nhất (dựa vào quantity_sold)
        const topProducts = [...products]
          .sort((a, b) => (b.quantity_sold?.value ?? 0) - (a.quantity_sold?.value ?? 0))
          .slice(0, 10);

        setStats({
          totalRevenue,
          totalOrders,
          totalProducts,
          totalUsers,
          recentOrders,
          topProducts,
        });

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        // toast({ title: "Lỗi", description: "Không thể tải dữ liệu dashboard."});
      } finally {
        setLoading(false);
      }
    };
    
    void fetchData();
  }, [token]);
  
  // Các hàm tiện ích
  const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'processing': return 'Đang xử lý';
      case 'shipped': return 'Đang giao hàng';
      case 'delivered': return 'Đã giao';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Chuẩn bị dữ liệu cho biểu đồ
  const chartData = useMemo(() => {
    if (!stats) return [];
    
    // Nhóm đơn hàng theo ngày
    const ordersByDate = stats.recentOrders.reduce((acc: Record<string, number>, order: any) => {
      const date = new Date(order.createdAt).toLocaleDateString('vi-VN');
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    
    // Chuyển đổi thành mảng dữ liệu cho biểu đồ
    return Object.entries(ordersByDate).map(([date, count]) => ({
      date,
      'Số đơn hàng': count,
      'Tổng tiền': stats.recentOrders
        .filter((o: any) => new Date(o.createdAt).toLocaleDateString('vi-VN') === date)
        .reduce((sum: number, o: any) => sum + (o.totalPrice || 0), 0)
    }));
  }, [stats]);
  
  // Màu sắc cho biểu đồ
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  if (loading) {
    return <div>Đang tải dữ liệu Dashboard...</div>;
  }

  if (!stats) {
    return <div>Không có dữ liệu để hiển thị.</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">+20.1% so với tháng trước</p>
          </CardContent>
        </Card>
        {/* Total Orders */}
        <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đơn hàng</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">+180.1% so với tháng trước</p>
          </CardContent>
        </Card>
        {/* Total Products */}
        <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sản phẩm</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">Tổng số sản phẩm trong kho</p>
          </CardContent>
        </Card>
        {/* Total Users */}
        <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Người dùng</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">+21 so với tháng trước</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Đơn hàng gần đây</CardTitle>
              <CardDescription>Bạn có {stats.recentOrders.length} đơn hàng mới.</CardDescription>
            </div>
            <Link to="/admin/orders">
              <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-2" />Xem tất cả</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => value.split('/').slice(0, 2).join('/')}
                  />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'Tổng tiền') {
                        return [formatCurrency(Number(value)), name];
                      }
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar 
                    yAxisId="left" 
                    dataKey="Số đơn hàng" 
                    name="Số đơn hàng"
                    fill="#8884d8"
                    radius={[4, 4, 0, 0]}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                  <Bar 
                    yAxisId="right" 
                    dataKey="Tổng tiền" 
                    name="Tổng tiền (VND)"
                    fill="#82ca9d"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-2 mt-4">
              <h4 className="text-sm font-medium">Đơn hàng gần đây</h4>
              <div className="space-y-2">
                {stats.recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-2 border rounded-md hover:bg-muted/50">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">#{order.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(order.totalPrice)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Sản phẩm bán chạy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             {stats.topProducts.map((product, index) => (
                <div key={index} className="flex items-center gap-4">
                    <div className="avatar">
                        <div className="w-12 h-12 rounded bg-muted">
                            <img src={product.images?.[0]?.thumbnail_url} alt={product.name}/>
                        </div>
                    </div>
                    <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none line-clamp-1">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{formatCurrency(product.list_price)}</p>
                    </div>
                    <div className="font-medium text-right">
                        <div>{product.quantity_sold?.value ?? 0}</div>
                        <div className="text-xs text-muted-foreground">đã bán</div>
                    </div>
                </div>
             ))}
          </CardContent>
        </Card>
      </div>
      {/* Quick Actions */}
      <Card>
         <CardHeader>
          <CardTitle>Thao tác nhanh</CardTitle>
         </CardHeader>
         <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Button onClick={() => navigate('/admin/products/', { state: { openCreateModal: true } })} className="h-24 flex-col space-y-2">
              <Package className="h-6 w-6" /><span>Thêm sản phẩm</span>
            </Button>
            <Button onClick={() => navigate('/admin/users')} variant="outline" className="h-24 flex-col space-y-2">
              <Users className="h-6 w-6" /><span>Quản lý người dùng</span>
            </Button>
            <Button onClick={() => navigate('/admin/orders')} variant="outline" className="h-24 flex-col space-y-2">
              <ShoppingBag className="h-6 w-6" /><span>Xử lý đơn hàng</span>
            </Button>
            
          </div>
         </CardContent>
      </Card>
    </div>
  );
}