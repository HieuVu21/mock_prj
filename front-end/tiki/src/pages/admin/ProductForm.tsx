// src/pages/admin/ProductForm.tsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';

// Import UI components
import { Button } from '@/component/ui/button';
import { Input } from '@/component/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/component/ui/card';
import { Label } from '@/component/ui/label';
import { Textarea } from '@/component/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/component/ui/select';

// Import API, Auth và Interfaces
import { createProduct, getCategories, getProduct, updateProduct } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Books, Category } from "@/interface/book.interface";

// Interface cho dữ liệu form
type ProductFormData = Pick<Books, 'name' | 'list_price' | 'original_price' | 'description' | 'short_description' | 'stock_quantity'>;

export default function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const { token } = useAuth();
  const navigate = useNavigate();

  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<ProductFormData>();

  useEffect(() => {
    document.title = isEdit ? "Sửa sản phẩm | Admin" : "Thêm sản phẩm mới | Admin";
    // Lấy danh sách danh mục
    getCategories().then(({ data }) => setCategories(data || []));
  }, [isEdit]);
  
  // Lấy dữ liệu sản phẩm khi ở chế độ sửa
  useEffect(() => {
    if (isEdit && id) {
      getProduct(id).then(({ data: product }) => {
        if (!product) {
          toast.error("Không tìm thấy sản phẩm!");
          navigate('/admin/products');
          return;
        }
        
        // Điền dữ liệu vào form
        setValue("name", product.name);
        setValue("list_price", product.list_price);
        setValue("original_price", product.original_price);
        setValue("description", product.description);
        setValue("short_description", product.short_description || "");
        setValue("stock_quantity", product.stock_quantity || 0);

        setSelectedCategoryId(String(product.categories?.id || ''));
        setImagePreview(product.images?.[0]?.thumbnail_url || null);
      });
    }
  }, [id, isEdit, setValue, navigate]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => { /* giữ nguyên hàm của bạn */ };

  const onSubmit: SubmitHandler<ProductFormData> = async (formData) => {
    if (!token) return toast.error("Thiếu quyền xác thực.");
    if (!selectedCategoryId) return toast.error("Vui lòng chọn danh mục.");

    try {
      const category = categories.find(c => String(c.id) === selectedCategoryId);
      const body: Partial<Books> = {
        ...formData,
        list_price: Number(formData.list_price),
        original_price: Number(formData.original_price),
        stock_quantity: Number(formData.stock_quantity || 0),
        categories: category,
        images: imagePreview ? [{ base_url: imagePreview, thumbnail_url: imagePreview } as any] : [],
      };

      if (isEdit && id) {
        await updateProduct(id, body, token);
      } else {
        await createProduct(body, token);
      }
      toast.success(isEdit ? "Cập nhật thành công!" : "Tạo sản phẩm thành công!");
      navigate("/admin/products");
    } catch (e: any) {
      toast.error(e.message || "Thao tác thất bại.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
       {/* Nút quay lại */}
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Quay lại danh sách
      </Button>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột chính */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle>Thông tin chung</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label htmlFor="name">Tên sách</Label><Input id="name" {...register("name", { required: true })} placeholder="Ví dụ: Lập trình di động..." /></div>
                <div className="space-y-2"><Label htmlFor="description">Mô tả</Label><Textarea id="description" {...register("description")} placeholder="Mô tả chi tiết về sản phẩm..." rows={8} /></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Hình ảnh</CardTitle></CardHeader>
              <CardContent>
                <div className="w-full border-2 border-dashed border-border rounded-lg p-6 text-center">
                  {imagePreview ? (
                     <img src={imagePreview} alt="Xem trước" className="max-h-48 mx-auto mb-4 rounded"/>
                  ) : (
                     <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                  )}
                  <Input id="picture" type="file" className="mt-4" onChange={handleImageChange} accept="image/*" />
                  <p className="text-xs text-muted-foreground mt-2">PNG, JPG, GIF up to 10MB</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cột phụ */}
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Giá sản phẩm</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label htmlFor="list_price">Giá niêm yết</Label><Input id="list_price" {...register("list_price", { required: true })} type="number" placeholder="599000"/></div>
                <div className="space-y-2"><Label htmlFor="original_price">Giá gốc</Label><Input id="original_price" {...register("original_price")} type="number" placeholder="699000"/></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Tổ chức</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label htmlFor="category">Danh mục</Label>
                  <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                    <SelectTrigger id="category"><SelectValue placeholder="-- Chọn danh mục --" /></SelectTrigger>
                    <SelectContent>{categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                 <div className="space-y-2"><Label htmlFor="stock_quantity">Tồn kho</Label><Input id="stock_quantity" {...register("stock_quantity")} type="number" placeholder="100"/></div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Nút lưu */}
        <div className="flex justify-end gap-2 mt-6">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>Hủy</Button>
          <Button type="submit" className="bg-gradient-primary text-primary-foreground hover:opacity-90" disabled={isSubmitting}>
             {isSubmitting ? 'Đang lưu...' : 'Lưu lại'}
          </Button>
        </div>
      </form>
    </div>
  );
}