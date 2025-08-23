// src/pages/admin/Users.tsx
import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Mail, MoreHorizontal, Edit2, Search, Shield, ShieldCheck, Trash2, Plus, User as UserIcon } from 'lucide-react';

// Import UI components
import { Button } from '@/component/ui/button';
import { Input } from '@/component/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/component/ui/card';
import { Badge } from '@/component/ui/badge';
    import { Avatar, AvatarFallback } from '@/component/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/component/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/component/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/component/ui/dialog';
import { Label } from '@/component/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/component/ui/select';

// Import API, Auth và Interfaces
import { getUsers, updateUser, createUser, deleteUser } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import type { User } from "@/interface/user.interface";

type UserRole = 'admin' | 'customer' | 'user';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | 'admin' | 'customer'>('all');
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const { token, user: currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    role: 'customer' as UserRole,
    phone: '',
    address: '',
    gender: '',
    nationality: ''
  });
  
  const loadUsers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await getUsers();
      const usersData = Array.isArray(response) ? response : response?.data || [];
      // Map the response to ensure consistent field names
      const normalizedUsers = usersData.map(user => ({
        ...user,
        fullName: user.fullName || user.fullname || user.name || ''
      }));
      setUsers(normalizedUsers);
    } catch {
      toast.error("Tải danh sách người dùng thất bại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Quản lý Người dùng | Admin Panel";
    void loadUsers();
  }, [token]);

  const getRoleBadge = (role?: UserRole) => {
    switch (role) {
      case 'admin': return <Badge className="bg-gradient-primary text-primary-foreground"><ShieldCheck className="h-3 w-3 mr-1" />Quản trị</Badge>;
      case 'user':
      case 'customer':
      default: return <Badge variant="outline"><Shield className="h-3 w-3 mr-1" />Khách hàng</Badge>;
    }
  };

  const getInitials = (fullName?: string, email?: string) => {
    if (fullName) return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    if (email) return email.substring(0, 2).toUpperCase();
    return <UserIcon className="h-5 w-5" />;
  };

  const filteredUsers = useMemo(() => 
    users.filter(user => {
      const userRole = user.role === 'admin' ? 'admin' : 'customer';
      const matchesSearch = (user.fullName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                            user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = selectedRole === 'all' || userRole === selectedRole;
      return matchesSearch && matchesRole;
    }), [users, searchTerm, selectedRole]);
  
  const resetForm = () => {
    setFormData({
      email: '',
      fullName: '',
      password: '',
      role: 'customer',
      phone: '',
      address: '',
      gender: '',
      nationality: ''
    });
    setSelectedUser(null);
  };

  // === SỬA LẠI HÀM HANDLECREATE ĐỂ THÊM `createdAt` ===
  const handleCreate = async () => {
    if (!token) return toast.error("Thiếu quyền xác thực");
    if (!formData.email || !formData.password || !formData.fullName) {
      return toast.error("Vui lòng điền đầy đủ thông tin.");
    }
    try {
      const body: Partial<User> = { 
        ...formData,
        fullName: formData.fullName,
        name: formData.fullName, // Keep both for backward compatibility
        createdAt: new Date().toISOString()
      };
      await createUser(body);
      toast.success("Đã tạo người dùng mới!");
      setIsCreateDialogOpen(false);
      resetForm();
      await loadUsers();
    } catch(e: any) {
      toast.error(e.message || "Tạo người dùng thất bại.");
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      fullName: user.fullName || user.fullname || user.name || '',
      password: '',
      role: user.role || 'customer',
      phone: user.phone || '',
      address: user.address || '',
      gender: user.gender || '',
      nationality: user.nationality || ''
    });
    setIsEditDialogOpen(true);
  };
  
  const handleUpdate = async () => {
    if (!selectedUser || !token) return;
    try {
      const body: Partial<User> = {
        name: formData.fullName,
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role,
        phone: formData.phone,
        address: formData.address,
        gender: formData.gender,
        nationality: formData.nationality
      };
      if (formData.password) {
        body.password = formData.password;
      }
      
      await updateUser(selectedUser.id, body);
      toast.success("Đã cập nhật thông tin người dùng.");
      setIsEditDialogOpen(false);
      resetForm();
      await loadUsers();
    } catch (e: any) {
      toast.error(e.message || "Cập nhật thất bại.");
    }
  };

  const handleDelete = async (userToDelete: User) => {
    if (!token) return toast.error("Thiếu quyền xác thực");
    if (currentUser?.id === userToDelete.id) return toast.error("Bạn không thể tự xóa tài khoản của mình.");
    if (!window.confirm(`Bạn có chắc muốn xóa người dùng "${userToDelete.email}"?`)) return;
    try {
      await deleteUser(userToDelete.id);
      toast.success("Đã xóa người dùng.");
      await loadUsers();
    } catch(e: any) {
      toast.error(e.message || "Xóa thất bại.");
    }
  };

  if (loading) return <div>Đang tải...</div>;
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div><h1 className="text-2xl font-bold">Quản lý người dùng</h1><p className="text-muted-foreground">Quản lý tài khoản người dùng và phân quyền</p></div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild><Button className="bg-gradient-primary text-primary-foreground hover:opacity-90"><Plus className="h-4 w-4 mr-2" />Thêm người dùng</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Thêm người dùng mới</DialogTitle><DialogDescription>Tạo tài khoản mới trong hệ thống.</DialogDescription></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2"><Label htmlFor="fullName">Họ tên *</Label><Input id="fullName" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} /></div>
              <div className="space-y-2"><Label htmlFor="email">Email *</Label><Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /></div>
              <div className="space-y-2"><Label htmlFor="password">Mật khẩu *</Label><Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} /></div>
              <div className="space-y-2"><Label htmlFor="role">Vai trò</Label><Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value as UserRole})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="customer">Khách hàng</SelectItem><SelectItem value="admin">Quản trị viên</SelectItem></SelectContent></Select></div>
            </div>
            <div className="flex justify-end space-x-2"><Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Hủy</Button><Button onClick={handleCreate} className="bg-gradient-primary text-primary-foreground hover:opacity-90">Tạo người dùng</Button></div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Tìm kiếm theo tên hoặc email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" /></div></div>
            <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as any)}><SelectTrigger className="w-[180px]"><SelectValue placeholder="Tất cả vai trò" /></SelectTrigger><SelectContent><SelectItem value="all">Tất cả vai trò</SelectItem><SelectItem value="admin">Quản trị</SelectItem><SelectItem value="customer">Khách hàng</SelectItem></SelectContent></Select>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><CardTitle>Danh sách người dùng</CardTitle><CardDescription>Hiển thị {filteredUsers.length} trên tổng số {users.length}</CardDescription></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Người dùng</TableHead><TableHead>Vai trò</TableHead><TableHead>Ngày tạo</TableHead><TableHead className="w-[70px]"></TableHead></TableRow></TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10"><AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm">{getInitials(user.fullName, user.email)}</AvatarFallback></Avatar>
                      <div>
                        <p className="font-medium text-foreground">{user.fullName || '(Chưa có tên)'}</p>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground"><Mail className="h-3 w-3" /><span>{user.email}</span></div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell><p className="text-sm text-muted-foreground">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</p></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(user)}><Edit2 className="h-4 w-4 mr-2" />Chỉnh sửa</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(user)} className="text-destructive focus:text-destructive focus:bg-destructive/10"><Trash2 className="h-4 w-4 mr-2" />Xóa người dùng</DropdownMenuItem>
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
        <DialogContent>
          <DialogHeader><DialogTitle>Chỉnh sửa người dùng</DialogTitle><DialogDescription>Cập nhật thông tin cho {selectedUser?.email}</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label htmlFor="edit-fullName">Họ tên</Label><Input id="edit-fullName" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} /></div>
            <div className="space-y-2"><Label htmlFor="edit-email">Email</Label><Input id="edit-email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /></div>
            <div className="space-y-2"><Label htmlFor="edit-password">Mật khẩu mới (để trống nếu không đổi)</Label><Input id="edit-password" type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} /></div>
            <div className="space-y-2"><Label htmlFor="edit-role">Vai trò</Label><Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="customer">Khách hàng</SelectItem><SelectItem value="admin">Quản trị viên</SelectItem></SelectContent></Select></div>
          </div>
          <div className="flex justify-end space-x-2"><Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Hủy</Button><Button onClick={handleUpdate} className="bg-gradient-primary text-primary-foreground hover:opacity-90">Cập nhật</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}