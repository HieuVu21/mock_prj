// src/pages/admin/Products.tsx

import { useEffect, useState, useMemo, type ChangeEvent } from "react";
// Import thêm useLocation
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { 
  Plus, Search, Filter, MoreHorizontal, Edit2, Trash2, SortAsc, SortDesc, Image as ImageIcon 
} from 'lucide-react';

// Import các component UI
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

// Import logic API, Auth và Interfaces
import { createProduct, deleteProduct, getProducts, getCategories, updateProduct, type Query } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Books, Category, Author, Image } from "@/interface/book.interface";

// Component Form Fields để tái sử dụng
const ProductFormFields = ({ formData, setFormData, allCategories, handleImageChange }: {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  allCategories: Category[];
  handleImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2"><Label>Tên sản phẩm *</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
      <div className="space-y-2"><Label>Tên tác giả</Label><Input value={formData.authorName} onChange={(e) => setFormData({...formData, authorName: e.target.value})} /></div>
    </div>
    <div className="space-y-2"><Label>Danh mục *</Label><Select value={formData.categoryId} onValueChange={(value) => setFormData({...formData, categoryId: value})}><SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger><SelectContent>{allCategories.map((cat) => (<SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>))}</SelectContent></Select></div>
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2"><Label>Giá bán *</Label><Input value={formData.list_price} onChange={(e) => setFormData({...formData, list_price: e.target.value})} type="number" /></div>
      <div className="space-y-2"><Label>Giá gốc</Label><Input value={formData.original_price} onChange={(e) => setFormData({...formData, original_price: e.target.value})} type="number" /></div>
    </div>
    <div className="space-y-2"><Label>Mô tả ngắn</Label><Textarea value={formData.short_description} onChange={(e) => setFormData({...formData, short_description: e.target.value})} rows={3} /></div>
    <div className="space-y-2"><Label>Mô tả chi tiết</Label><Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={6} /></div>
    <div className="space-y-2">
      <Label>Hình ảnh sản phẩm</Label>
      <div className="flex items-center gap-4">
        <div className="w-24 h-24 border rounded-md flex items-center justify-center bg-muted flex-shrink-0">
          {formData.imageUrl ? <img src={formData.imageUrl} alt="Preview" className="h-full w-full object-contain"/> : <ImageIcon className="h-8 w-8 text-muted-foreground"/>}
        </div>
        <div className="w-full space-y-2">
          <Input placeholder="Hoặc dán link ảnh vào đây" value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} />
          <Input type="file" accept="image/*" onChange={handleImageChange} />
        </div>
      </div>
    </div>
  </div>
);

const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

export default function ProductManagement() {
  const [products, setProducts] = useState<Books[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]); 
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Books | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    authorName: '',
    categoryId: '',
    list_price: '',
    original_price: '',
    description: '',
    short_description: '',
    imageUrl: ''
  });

  const navigate = useNavigate();
  const location = useLocation(); // Khai báo hook useLocation
  const { token } = useAuth();
  
  // useEffect này chỉ chạy một lần để lấy danh sách ĐẦY ĐỦ các danh mục
  useEffect(() => {
    const fetchInitialCategories = async () => {
      try {
        const [managedCatsRes, allProductsRes] = await Promise.all([
          getCategories(),
          getProducts({ _limit: 1000 })
        ]);
        const managedCategories = managedCatsRes.data || [];
        const allProducts = allProductsRes.data || [];
        const categoryMap = new Map<string | number, Category>();
        allProducts.forEach(product => {
          if (product.categories?.id && !categoryMap.has(product.categories.id)) {
            categoryMap.set(product.categories.id, product.categories);
          }
        });
        managedCategories.forEach(cat => {
          if (!categoryMap.has(cat.id)) {
            categoryMap.set(cat.id, cat);
          }
        });
        const finalCategories = Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name));
        setAllCategories(finalCategories);
      } catch (error) { toast.error("Tải danh sách danh mục thất bại."); }
    };
    void fetchInitialCategories();
  }, []);

  // useEffect này chạy mỗi khi bộ lọc thay đổi để lấy danh sách SẢN PHẨM
  useEffect(() => {
    setLoading(true);
    const params: Query = {
      _sort: sortField,
      _order: sortDirection,
      name_like: searchTerm || undefined,
    };
    if (selectedCategory !== 'all') {
      params['categories.id'] = selectedCategory;
    }

    getProducts(params)
      .then(({ data, headers }) => {
        setProducts(data || []);
        setTotal(Number(headers.get("X-Total-Count") || data?.length || 0));
      })
      .catch(() => toast.error("Lọc sản phẩm thất bại."))
      .finally(() => setLoading(false));
  }, [searchTerm, sortField, sortDirection, selectedCategory]);
  
  // useEffect MỚI: XỬ LÝ TÍN HIỆU TỪ DASHBOARD
  useEffect(() => {
    if (location.state?.openCreateModal) {
      setIsCreateDialogOpen(true);
      // Xóa state đi sau khi đã mở dialog để tránh bị mở lại khi re-render
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  const handleSort = (field: string) => {
    if (sortField === field) setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDirection('asc'); }
  };

  const resetForm = () => {
    setFormData({ name: '', authorName: '', categoryId: '', list_price: '', original_price: '', description: '', short_description: '', imageUrl: '' });
  };

  const createBodyFromForm = () => {
    const category = allCategories.find(c => String(c.id) === formData.categoryId);
    const author: Author = { id: selectedProduct?.authors?.[0]?.id || Date.now(), name: formData.authorName, slug: formData.authorName.toLowerCase().replace(/\s+/g, '-') };
    const images: Image[] = formData.imageUrl ? [{ base_url: formData.imageUrl, thumbnail_url: formData.imageUrl } as Image] : [];
    
    return {
      name: formData.name, authors: [author], categories: category,
      list_price: Number(formData.list_price),
      original_price: Number(formData.original_price || formData.list_price),
      description: formData.description, short_description: formData.short_description,
      images: images,
    };
  };

  const handleCreate = async () => {
    if (!token) return toast.error("Thiếu quyền xác thực");
    if (!formData.name || !formData.categoryId || !formData.list_price) return toast.error("Vui lòng điền các trường bắt buộc (*)");
    try {
      const body: Partial<Books> = { ...createBodyFromForm(), rating_average: 0, quantity_sold: { value: 0, text: 'Đã bán 0' } };
      const { data: newProduct } = await createProduct(body, token);
      setProducts([newProduct, ...products]);
      setTotal(prev => prev + 1);
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success("Đã thêm sản phẩm mới!");
    } catch (e: any) { toast.error(e.message || "Thêm sản phẩm thất bại"); }
  };

  const handleEdit = (product: Books) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      authorName: product.authors?.[0]?.name || '',
      categoryId: String(product.categories?.id || ''),
      list_price: String(product.list_price),
      original_price: String(product.original_price),
      description: product.description || '',
      short_description: product.short_description || '',
      imageUrl: product.images?.[0]?.thumbnail_url || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedProduct || !token) return;
    try {
      const body = createBodyFromForm();
      const { data: updatedProduct } = await updateProduct(selectedProduct.id, body, token);
      setProducts(products.map(p => p.id === selectedProduct.id ? updatedProduct : p));
      setIsEditDialogOpen(false);
      resetForm();
      setSelectedProduct(null);
      toast.success("Đã cập nhật sản phẩm!");
    } catch (e: any) { toast.error(e.message || "Cập nhật thất bại"); }
  };

  const onDelete = async (productId: string) => {
    if (!token) return toast.error("Thiếu quyền xác thực.");
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    try {
      await deleteProduct(productId, token);
      setProducts(products.filter(p => p.id !== productId));
      setTotal(prev => prev - 1);
      toast.success("Đã xóa sản phẩm.");
    } catch (e: any) { toast.error(e.message || "Xóa thất bại"); }
  };
  
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { setFormData(prev => ({ ...prev, imageUrl: reader.result as string })); };
    reader.readAsDataURL(file);
    toast.success("Đã tải ảnh lên, sẵn sàng để lưu.");
  };

  if (loading && allCategories.length === 0) return <div>Đang tải dữ liệu...</div>;
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-foreground">Quản lý sản phẩm</h1><p className="text-muted-foreground">Quản lý danh sách sách và sản phẩm trong cửa hàng</p></div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild><Button className="bg-gradient-primary text-primary-foreground hover:opacity-90"><Plus className="h-4 w-4 mr-2" />Thêm sản phẩm</Button></DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader><DialogTitle>Thêm sản phẩm mới</DialogTitle></DialogHeader>
            <ProductFormFields formData={formData} setFormData={setFormData} allCategories={allCategories} handleImageChange={handleImageChange} />
            <div className="flex justify-end gap-2 pt-4 border-t"><Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Hủy</Button><Button onClick={handleCreate} className="bg-gradient-primary text-primary-foreground hover:opacity-90">Thêm</Button></div>
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
                {selectedCategory === 'all' 
                  ? 'Tất cả danh mục' 
                  : allCategories.find(c => String(c.id) === selectedCategory)?.name || 'Tất cả danh mục'}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {allCategories.map(cat => (<SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><CardTitle>Danh sách sản phẩm</CardTitle><CardDescription>Hiển thị {products.length} trên tổng số {total} sản phẩm</CardDescription></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead className="w-[80px]">Sản phẩm</TableHead><TableHead></TableHead><TableHead>Danh mục</TableHead><TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort('list_price')}><div className="flex items-center space-x-1"><span>Giá</span>{sortField === 'list_price' && (sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />)}</div></TableHead><TableHead>Đã bán</TableHead><TableHead className="w-[70px]"></TableHead></TableRow></TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell><div className="w-12 h-16 rounded-md bg-muted flex items-center justify-center p-1"><img src={product.images?.[0]?.thumbnail_url} alt={product.name} className="w-full h-full object-contain"/></div></TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground line-clamp-2 text-sm">{product.name}</div>
                    <div className="text-xs text-muted-foreground">{product.authors?.[0]?.name || 'N/A'}</div>
                    <div className="text-xs text-muted-foreground">⭐ {product.rating_average} • ID: {product.id}</div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{product.categories?.name}</Badge></TableCell>
                  <TableCell>
                    <div className="font-semibold">{formatCurrency(product.list_price)}</div>
                    {product.original_price !== product.list_price && (<div className="text-xs line-through text-muted-foreground">{formatCurrency(product.original_price)}</div>)}
                  </TableCell>
                  <TableCell><p className="font-medium text-foreground">{product.quantity_sold?.value ?? 'N/A'}</p></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
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
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Chỉnh sửa sản phẩm: {selectedProduct?.name}</DialogTitle></DialogHeader>
          <ProductFormFields formData={formData} setFormData={setFormData} allCategories={allCategories} handleImageChange={handleImageChange} />
          <div className="flex justify-end gap-2 pt-4 border-t"><Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Hủy</Button><Button onClick={handleUpdate} className="bg-gradient-primary text-primary-foreground hover:opacity-90">Cập nhật</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}