// src/pages/admin/Orders.tsx

import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { 
  Search, Filter, MoreHorizontal, Eye, Truck, CheckCircle, XCircle, Clock, Package, Calendar, User, MapPin
} from 'lucide-react';

// Import UI components
import { Button } from '@/component/ui/button';
import { Input } from '@/component/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/component/ui/card';
import { Badge } from '@/component/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/component/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/component/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/component/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/component/ui/select';

// Import API, Auth và Interfaces
import { getOrders, updateOrderStatus } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Order } from "@/interface/order.interface";

const statusConfig = {
  pending: { label: 'Chờ xác nhận', icon: Clock },
  confirmed: { label: 'Đã xác nhận', icon: CheckCircle },
  shipping: { label: 'Đang giao hàng', icon: Truck },
  delivered: { label: 'Đã giao hàng', icon: Package },
  cancelled: { label: 'Đã hủy', icon: XCircle }
};

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    document.title = "Quản lý Đơn hàng | Admin Panel";
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    getOrders({ _sort: 'id', _order: 'desc' }) // Sắp xếp đơn hàng mới nhất lên đầu
      .then(({ data }) => setOrders(data || []))
      .catch(() => toast.error("Tải danh sách đơn hàng thất bại."))
      .finally(() => setLoading(false));
  }, [token]);

  const getStatusBadge = (status: Order['status']) => {
    const config = statusConfig[status];
    if (!config) return <Badge variant="secondary">{status}</Badge>;
    const Icon = config.icon;
    return <Badge><Icon className="h-3 w-3 mr-1" />{config.label}</Badge>;
  };

  const filteredOrders = useMemo(() => 
    orders.filter(order => 
      (String(order.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
       (order.customerName || order.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedStatus === 'all' || order.status === selectedStatus)
    ), [orders, searchTerm, selectedStatus]);
  
  const handleStatusChange = async (orderId: string | number, newStatus: Order['status']) => {
    if (!token) return toast.error("Thiếu quyền xác thực");
    try {
      const { data: updatedOrder } = await updateOrderStatus(orderId, newStatus, token);
      setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
      toast.success(`Đã cập nhật trạng thái đơn hàng thành "${statusConfig[newStatus].label}"`);
    } catch (e: any) {
      toast.error(e.message || "Cập nhật thất bại");
    }
  };

  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailDialogOpen(true);
  };
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Quản lý đơn hàng</h1>
        <p className="text-muted-foreground">Theo dõi và xử lý các đơn hàng của khách hàng</p>
      </div>
      
      <Card><CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Tìm kiếm theo mã đơn, tên khách hàng..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" /></div>
          </div>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[180px]"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              {Object.entries(statusConfig).map(([status, config]) => (<SelectItem key={status} value={status}>{config.label}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </CardContent></Card>

      <Card>
        <CardHeader><CardTitle>Danh sách đơn hàng</CardTitle><CardDescription>Hiển thị {filteredOrders.length} trên tổng số {orders.length} đơn hàng</CardDescription></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Mã đơn hàng</TableHead><TableHead>Khách hàng</TableHead><TableHead>Sản phẩm</TableHead><TableHead>Tổng tiền</TableHead><TableHead>Trạng thái</TableHead><TableHead>Ngày đặt</TableHead><TableHead className="w-[70px]"></TableHead></TableRow></TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell><div><p className="font-medium text-foreground">#{order.id}</p><p className="text-xs text-muted-foreground">{order.paymentMethod}</p></div></TableCell>
                  <TableCell><div><p className="font-medium text-foreground">{order.customerName || order.user?.email}</p><p className="text-sm text-muted-foreground">{order.user?.phone}</p></div></TableCell>
                  <TableCell><div><p className="font-medium text-foreground">{order.items.length} sản phẩm</p><p className="text-sm text-muted-foreground line-clamp-1">{order.items[0]?.book.name}{order.items.length > 1 && ` +${order.items.length - 1}`}</p></div></TableCell>
                  <TableCell><p className="font-semibold text-foreground">{formatCurrency(order.totalPrice)}</p></TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell><div className="flex items-center space-x-1 text-sm text-muted-foreground"><Calendar className="h-3 w-3" /><span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</span></div></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetail(order)}><Eye className="h-4 w-4 mr-2" />Xem chi tiết</DropdownMenuItem>
                        {order.status === 'pending' && (<DropdownMenuItem onClick={() => handleStatusChange(order.id, 'confirmed')}><CheckCircle className="h-4 w-4 mr-2" />Xác nhận đơn</DropdownMenuItem>)}
                        {order.status === 'confirmed' && (<DropdownMenuItem onClick={() => handleStatusChange(order.id, 'shipping')}><Truck className="h-4 w-4 mr-2" />Bắt đầu giao</DropdownMenuItem>)}
                        {order.status === 'shipping' && (<DropdownMenuItem onClick={() => handleStatusChange(order.id, 'delivered')}><Package className="h-4 w-4 mr-2" />Đã giao</DropdownMenuItem>)}
                        {['pending', 'confirmed'].includes(order.status) && (<DropdownMenuItem onClick={() => handleStatusChange(order.id, 'cancelled')} className="text-destructive focus:text-destructive focus:bg-destructive/10"><XCircle className="h-4 w-4 mr-2" />Hủy đơn</DropdownMenuItem>)}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader><DialogTitle>Chi tiết đơn hàng #{selectedOrder.id}</DialogTitle><DialogDescription>Thông tin chi tiết về đơn hàng và khách hàng</DialogDescription></DialogHeader>
              <div className="space-y-6 py-4">
                <div className="flex items-center justify-between">
                  <div><h3 className="font-semibold text-foreground">Trạng thái đơn hàng</h3><p className="text-sm text-muted-foreground">Cập nhật: {selectedOrder.updatedAt ? new Date(selectedOrder.updatedAt).toLocaleString('vi-VN') : 'N/A'}</p></div>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center"><User className="h-4 w-4 mr-2" />Thông tin khách hàng</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><p className="text-muted-foreground">Họ tên:</p><p className="font-medium">{selectedOrder.customerName || selectedOrder.user?.fullName}</p></div>
                    <div><p className="text-muted-foreground">Email:</p><p className="font-medium">{selectedOrder.user?.email}</p></div>
                    <div><p className="text-muted-foreground">Số điện thoại:</p><p className="font-medium">{selectedOrder.user?.phone}</p></div>
                    <div><p className="text-muted-foreground">Phương thức thanh toán:</p><p className="font-medium">{selectedOrder.paymentMethod}</p></div>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center"><MapPin className="h-4 w-4 mr-2" />Thông tin giao hàng</h3>
                  <div className="text-sm space-y-2"><div><p className="text-muted-foreground">Địa chỉ:</p><p className="font-medium">{selectedOrder.shippingAddress}</p></div></div>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center"><Package className="h-4 w-4 mr-2" />Sản phẩm đặt mua</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <div><p className="font-medium text-foreground">{item.book.name}</p><p className="text-sm text-muted-foreground">Số lượng: {item.quantity}</p></div>
                        <p className="font-semibold text-foreground">{formatCurrency(item.book.list_price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <p className="font-semibold text-lg">Tổng cộng:</p><p className="font-bold text-xl text-primary">{formatCurrency(selectedOrder.totalPrice)}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}