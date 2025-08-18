// src/pages/admin/Products.tsx

import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { 
  Plus, Search, Filter, MoreHorizontal, Edit2, Trash2, Eye, SortAsc, SortDesc 
} from 'lucide-react';

// Import các component UI bạn đã có
import { Button } from '@/component/ui/button';
import { Input } from '@/component/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/component/ui/card';
import { Badge } from '@/component/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/component/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/component/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/component/ui/dialog';
import { Label } from '@/component/ui/label';
import { Textarea } from '@/component/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/component/ui/select';

// Import logic API và Auth của bạn
import { createProduct, deleteProduct, getProducts, getCategories, updateProduct } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Books, Category } from "@/interface/book.interface";

// Component nhỏ cho trạng thái
const StatusBadge = ({ stock }: { stock: number }) => {
  if (stock === 0) return <Badge variant="destructive">Hết hàng</Badge>;
  if (stock < 10) return <Badge variant="secondary">Sắp hết</Badge>;
  return <Badge className="bg-success text-success-foreground hover:bg-success/90">Còn hàng</Badge>;
};

// Hàm định dạng tiền tệ
const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

export default function ProductManagement() {
  // === STATE MANAGEMENT ===
  const [products, setProducts] = useState<Books[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  
  // State cho bộ lọc và sắp xếp
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // State cho Dialogs (modals)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Books | null>(null);

  // State cho Form
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    list_price: '',
    original_price: '',
    stock_quantity: '',
    description: ''
  });

  const navigate = useNavigate();
  const { token } = useAuth();
  
  // === DATA FETCHING ===
  useEffect(() => {
    setLoading(true);
    const productsPromise = getProducts({ 
      _sort: sortField, 
      _order: sortDirection, 
      q: searchTerm,
      'categories.id_like': selectedCategory === 'all' ? '' : selectedCategory 
    });
    const categoriesPromise = getCategories();
    
    Promise.all([productsPromise, categoriesPromise])
      .then(([productsRes, categoriesRes]) => {
        setProducts(productsRes.data || []);
        setTotal(Number(productsRes.headers.get("X-Total-Count") || productsRes.data?.length || 0));
        setCategories(categoriesRes.data || []);
      })
      .catch(() => toast.error("Tải dữ liệu thất bại."))
      .finally(() => setLoading(false));
  }, [searchTerm, sortField, sortDirection, selectedCategory]);

  const handleSort = (field: string) => {
    if (sortField === field) setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // === FORM HANDLING & CRUD ===
  const resetForm = () => {
    setFormData({ name: '', categoryId: '', list_price: '', original_price: '', stock_quantity: '', description: '' });
  };

  const handleCreate = async () => {
    if (!token) return toast.error("Thiếu quyền xác thực");
    if (!formData.name || !formData.categoryId || !formData.list_price) {
      return toast.error("Vui lòng điền các trường bắt buộc (*)");
    }
    
    try {
      const category = categories.find(c => c.id === Number(formData.categoryId));
      const body: Partial<Books> = {
        name: formData.name,
        categories: category,
        list_price: Number(formData.list_price),
        original_price: Number(formData.original_price || formData.list_price),
        stock_quantity: Number(formData.stock_quantity || 0),
        description: formData.description,
        rating_average: 0, 
        quantity_sold: { value: 0, text: 'Đã bán 0' } 
      };
      
      const { data: newProduct } = await createProduct(body, token);
      setProducts([newProduct, ...products]);
      setTotal(prev => prev + 1);
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success("Đã thêm sản phẩm mới!");

    } catch (e: any) {
      toast.error(e.message || "Thêm sản phẩm thất bại");
    }
  };

  const handleEdit = (product: Books) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      categoryId: String(product.categories?.id || ''),
      list_price: String(product.list_price),
      original_price: String(product.original_price),
      stock_quantity: String(product.stock_quantity ?? ''),
      description: product.description || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedProduct || !token) return;
    
    try {
      const category = categories.find(c => c.id === Number(formData.categoryId));
      const body: Partial<Books> = {
        name: formData.name,
        categories: category,
        list_price: Number(formData.list_price),
        original_price: Number(formData.original_price || formData.list_price),
        stock_quantity: Number(formData.stock_quantity || 0),
        description: formData.description
      };
      
      const { data: updatedProduct } = await updateProduct(selectedProduct.id, body, token);
      setProducts(products.map(p => p.id === selectedProduct.id ? updatedProduct : p));
      setIsEditDialogOpen(false);
      resetForm();
      setSelectedProduct(null);
      toast.success("Đã cập nhật sản phẩm!");

    } catch (e: any) {
      toast.error(e.message || "Cập nhật thất bại");
    }
  };

  const onDelete = async (productId: string) => {
    if (!token) return toast.error("Thiếu quyền xác thực.");
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    try {
      await deleteProduct(productId, token);
      setProducts(products.filter(p => p.id !== productId));
      setTotal(prev => prev - 1);
      toast.success("Đã xóa sản phẩm.");
    } catch (e: any) {
      toast.error(e.message || "Xóa thất bại");
    }
  };

  if (loading) {
    return <div>Đang tải dữ liệu...</div>; // Bạn có thể thay thế bằng skeleton loading
  }

  // === JSX ===
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý sản phẩm</h1>
          <p className="text-muted-foreground">Quản lý danh sách sách và sản phẩm trong cửa hàng</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90"><Plus className="h-4 w-4 mr-2" />Thêm sản phẩm</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Thêm sản phẩm mới</DialogTitle>
              <DialogDescription>Điền thông tin chi tiết để thêm sản phẩm vào cửa hàng</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="name">Tên sản phẩm *</Label><Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Nhập tên sản phẩm" /></div>
                <div className="space-y-2"><Label htmlFor="category">Danh mục *</Label><Select value={formData.categoryId} onValueChange={(value) => setFormData({...formData, categoryId: value})}><SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger><SelectContent>{categories.map(cat => (<SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>))}</SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label htmlFor="price">Giá bán *</Label><Input id="price" value={formData.list_price} onChange={(e) => setFormData({...formData, list_price: e.target.value})} placeholder="299000" type="number" /></div>
                <div className="space-y-2"><Label htmlFor="originalPrice">Giá gốc</Label><Input id="originalPrice" value={formData.original_price} onChange={(e) => setFormData({...formData, original_price: e.target.value})} placeholder="399000" type="number" /></div>
                <div className="space-y-2"><Label htmlFor="stock">Số lượng</Label><Input id="stock" type="number" value={formData.stock_quantity} onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})} placeholder="100" /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="description">Mô tả</Label><Textarea id="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Mô tả chi tiết về sản phẩm..." rows={3} /></div>
            </div>
            <div className="flex justify-end space-x-2"><Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Hủy</Button><Button onClick={handleCreate} className="bg-gradient-primary text-primary-foreground hover:opacity-90">Thêm sản phẩm</Button></div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1"><div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Tìm kiếm sản phẩm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" /></div></div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                {/* SỬA LỖI HIỂN THỊ Ở ĐÂY */}
                {selectedCategory === 'all' 
                  ? 'Tất cả danh mục' 
                  : categories.find(c => String(c.id) === selectedCategory)?.name || 'Tất cả danh mục'}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map(cat => (<SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><CardTitle>Danh sách sản phẩm</CardTitle><CardDescription>Hiển thị {products.length} trên tổng số {total} sản phẩm</CardDescription></div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Sản phẩm</TableHead>
                <TableHead></TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort('list_price')}><div className="flex items-center space-x-1"><span>Giá</span>{sortField === 'list_price' && (sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />)}</div></TableHead>
                <TableHead>Kho</TableHead>
                <TableHead>Đã bán</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
                      <img src={product.images?.[0]?.thumbnail_url} alt={product.name} className="w-full h-full object-contain rounded-sm"/>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground line-clamp-2 text-sm">{product.name}</div>
                    <div className="text-xs text-muted-foreground">⭐ {product.rating_average} • ID: {product.id}</div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{product.categories?.name}</Badge></TableCell>
                  <TableCell>
                    <div className="font-semibold text-foreground">{formatCurrency(product.list_price)}</div>
                    {product.original_price !== product.list_price && (
                      <div className="text-xs text-muted-foreground line-through">{formatCurrency(product.original_price)}</div>
                    )}
                  </TableCell>
                  <TableCell>{product.stock_quantity ?? 'N/A'}</TableCell>
                  <TableCell>{product.quantity_sold?.value ?? 'N/A'}</TableCell>
                  <TableCell>{StatusBadge({ stock: product.stock_quantity ?? -1 })}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Eye className="h-4 w-4 mr-2" />Xem chi tiết</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(product)}><Edit2 className="h-4 w-4 mr-2" />Chỉnh sửa</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(product.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10"><Trash2 className="h-4 w-4 mr-2" />Xóa</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa sản phẩm</DialogTitle>
            <DialogDescription>Cập nhật thông tin chi tiết cho sản phẩm</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="edit-name">Tên sản phẩm *</Label><Input id="edit-name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
                <div className="space-y-2"><Label htmlFor="edit-category">Danh mục *</Label><Select value={formData.categoryId} onValueChange={(value) => setFormData({...formData, categoryId: value})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{categories.map(cat => (<SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>))}</SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label htmlFor="edit-price">Giá bán *</Label><Input id="edit-price" value={formData.list_price} onChange={(e) => setFormData({...formData, list_price: e.target.value})} type="number" /></div>
                <div className="space-y-2"><Label htmlFor="edit-originalPrice">Giá gốc</Label><Input id="edit-originalPrice" value={formData.original_price} onChange={(e) => setFormData({...formData, original_price: e.target.value})} type="number" /></div>
                <div className="space-y-2"><Label htmlFor="edit-stock">Số lượng</Label><Input id="edit-stock" type="number" value={formData.stock_quantity} onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})} /></div>
              </div>
          </div>
          <div className="flex justify-end space-x-2"><Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Hủy</Button><Button onClick={handleUpdate} className="bg-gradient-primary text-primary-foreground hover:opacity-90">Cập nhật</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}