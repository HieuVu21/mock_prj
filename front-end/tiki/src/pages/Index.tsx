import { Link } from "react-router-dom";
import { useEffect } from "react";

const Index = () => {
  useEffect(() => { document.title = "BookStore Mock Project"; }, []);
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">BookStore Mock Project</h1>
        <p className="text-lg opacity-70">Trang demo quản trị và dashboard cho hệ thống bán sách.</p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/login" className="btn btn-primary">Đăng nhập Admin</Link>
          <Link to="/admin" className="btn">Vào Dashboard</Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
