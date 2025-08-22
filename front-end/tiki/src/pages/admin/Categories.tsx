// src/pages/admin/Categories.tsx

import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { 
  Plus, Search, MoreHorizontal, Edit2, Trash2, FolderOpen, Calendar 
} from 'lucide-react';

// Import các component UI của bạn
import { Button } from '@/component/ui/button';
import { Input } from '@/component/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/component/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/component/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/component/ui/dialog';
import { Label } from '@/component/ui/label';
import { Textarea } from '@/component/ui/textarea';

// Import API, Auth và Interfaces
import { createCategory, deleteCategory, getCategories, getProducts, updateCategory } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Books, Category } from "@/interface/book.interface";

// Mở rộng interface Category để chứa thêm thông tin tính toán
interface DisplayCategory extends Category {
  productCount: number;
}

export default function CategoryManagement() {
  const [displayCategories, setDisplayCategories] = useState<DisplayCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DisplayCategory | null>(null);
  const { token } = useAuth();
  
  const [formData, setFormData] = useState({ name: '' });

  const syncAndProcessData = async () => {
    setLoading(true);
    try {
      const [managedCatsRes, productsRes] = await Promise.all([
        getCategories(),
        getProducts({ _limit: 1000 })
      ]);
      
      const managedCategories: Category[] = managedCatsRes.data || [];
      const products: Books[] = productsRes.data || [];

      const productCounts = new Map<string | number, number>();
      products.forEach(product => {
        if (product.categories?.id) {
          const count = productCounts.get(product.categories.id) || 0;
          productCounts.set(product.categories.id, count + 1);
        }
      });
      
      const categoryMap = new Map<string | number, Category>();
      products.forEach(p => {
        if (p.categories && p.categories.id) {
            categoryMap.set(p.categories.id, p.categories);
        }
      });
      
      managedCategories.forEach(cat => {
        if (!categoryMap.has(cat.id)) {
          categoryMap.set(cat.id, cat);
        }
      });

      const finalDisplayCategories = Array.from(categoryMap.values())
        .map(cat => ({
          ...cat,
          productCount: productCounts.get(cat.id) || 0
        }));
      
      setDisplayCategories(finalDisplayCategories);

    } catch (error) {
      toast.error("Đồng bộ dữ liệu danh mục thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Quản lý Danh mục | Admin";
    void syncAndProcessData();
  }, []);
  
  const resetForm = () => setFormData({ name: '' });

  const handleCreate = async () => {
    if (!token) return toast.error("Thiếu quyền xác thực");
    if (!formData.name.trim()) return toast.error("Vui lòng nhập tên danh mục");
    try {
      await createCategory({ name: formData.name }, token);
      toast.success("Đã thêm danh mục mới");
      setIsCreateDialogOpen(false);
      resetForm();
      await syncAndProcessData();
    } catch (e: any) {
      toast.error(e.message || "Thêm thất bại");
    }
  };

  const handleEdit = (category: DisplayCategory) => {
    setSelectedCategory(category);
    setFormData({ name: category.name });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedCategory || !token) return;
    try {
      await updateCategory(selectedCategory.id, { name: formData.name }, token);
      toast.success("Đã cập nhật danh mục");
      setIsEditDialogOpen(false);
      resetForm();
      await syncAndProcessData();
    } catch (e: any) {
      toast.error(e.message || "Cập nhật thất bại");
    }
  };

  const handleDelete = async (categoryId: string | number, categoryName: string) => {
    if (!token) return toast.error("Thiếu quyền xác thực");
    const category = displayCategories.find(c => c.id === categoryId);
    if (category && category.productCount > 0) {
      return toast.error(`Không thể xóa "${categoryName}" vì đang có ${category.productCount} sản phẩm.`);
    }
    if (!window.confirm(`Bạn có chắc muốn xóa danh mục "${categoryName}"?`)) return;

    try {
      await deleteCategory(categoryId, token);
      toast.success("Đã xóa danh mục");
      await syncAndProcessData();
    } catch (e: any) {
      toast.error(e.message || "Xóa thất bại.");
    }
  };

  const filteredCategories = useMemo(() => 
    displayCategories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [displayCategories, searchTerm]);

  if (loading) return <div>Đang tải...</div>;
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý danh mục</h1>
          <p className="text-muted-foreground">Quản lý các danh mục sản phẩm trong cửa hàng</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild><Button className="bg-gradient-primary text-primary-foreground hover:opacity-90"><Plus className="h-4 w-4 mr-2" />Thêm danh mục</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Thêm danh mục mới</DialogTitle><DialogDescription>Tạo danh mục sản phẩm mới cho cửa hàng</DialogDescription></DialogHeader>
            <div className="grid gap-4 py-4"><div className="space-y-2"><Label htmlFor="name">Tên danh mục *</Label><Input id="name" value={formData.name} onChange={(e) => setFormData({ name: e.target.value })} placeholder="Ví dụ: Lập trình" /></div></div>
            <div className="flex justify-end space-x-2"><Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Hủy</Button><Button onClick={handleCreate} className="bg-gradient-primary text-primary-foreground hover:opacity-90">Thêm danh mục</Button></div>
          </DialogContent>
        </Dialog>
      </div>

      <Card><CardContent className="p-6"><div className="relative max-w-md"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Tìm kiếm danh mục..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" /></div></CardContent></Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCategories.map((category) => (
          <Card key={category.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gradient-primary/10"><FolderOpen className="h-5 w-5 text-primary" /></div>
                  <div><CardTitle className="text-lg">{category.name}</CardTitle><p className="text-sm text-muted-foreground">{category.productCount} sản phẩm</p></div>
                </div>
                <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(category)}><Edit2 className="h-4 w-4 mr-2" />Chỉnh sửa</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(category.id, category.name)} className="text-destructive focus:text-destructive focus:bg-destructive/10" disabled={category.productCount > 0}><Trash2 className="h-4 w-4 mr-2" />Xóa</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-1"><span className="font-semibold">ID:</span><span>{category.id}</span></div>
                {category.createdAt && <div className="flex items-center space-x-1"><Calendar className="h-3 w-3" /><span>{new Date(category.createdAt).toLocaleDateString('vi-VN')}</span></div>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* === SỬA LỖI Ở ĐÂY === */}
      {/* Thay thế comment bằng component Card thông báo */}
      {filteredCategories.length === 0 && (
        <Card>
            <CardContent className="py-12 text-center">
                <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                    Không tìm thấy danh mục
                </h3>
                <p className="text-muted-foreground mb-4">
                    {searchTerm 
                        ? 'Không có danh mục nào khớp với từ khóa tìm kiếm' 
                        : 'Chưa có danh mục nào trong hệ thống.'
                    }
                </p>
            </CardContent>
        </Card>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Chỉnh sửa danh mục</DialogTitle><DialogDescription>Cập nhật thông tin danh mục</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4"><div className="space-y-2"><Label htmlFor="edit-name">Tên danh mục *</Label><Input id="edit-name" value={formData.name} onChange={(e) => setFormData({ name: e.target.value })} /></div></div>
          <div className="flex justify-end space-x-2"><Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Hủy</Button><Button onClick={handleUpdate} className="bg-gradient-primary text-primary-foreground hover:opacity-90">Cập nhật</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}