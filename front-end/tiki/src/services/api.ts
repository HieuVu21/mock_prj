import { type Books, type Category } from "@/interface/book.interface";
import { triggerAuthError } from "@/lib/auth-interceptor";
import { User } from "@/interface/user.interface"; 
import { Order } from "@/interface/order.interface";

export const API_URL = "http://localhost:3000"; // Change if needed

export type Query = {
  _page?: number;
  _limit?: number;
  _sort?: string;
  _order?: "asc" | "desc";
  q?: string;
  [key: string]: any;
};

const buildQuery = (q?: Query) =>
  q ? `?${new URLSearchParams(Object.fromEntries(Object.entries(q).map(([k, v]) => [k, String(v)])))}` : "";

async function api<T>(path: string, init?: RequestInit, token?: string): Promise<{ data: T; headers: Headers }>{
  const res = await fetch(API_URL + path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    // Nếu gặp lỗi 401 (Unauthorized - Thường là lỗi token)
    if (res.status === 401) {
      // Gọi hàm trigger để thực thi logout
      triggerAuthError();
      // Ném ra một lỗi cụ thể hơn cho người dùng
      throw new Error("Phiên đăng nhập đã hết hạn. Đang đăng xuất...");
    }

    const text = await res.text();
    // API của bạn trả về lỗi dưới dạng JSON string, ví dụ: ""jwt expired""
    // Chúng ta cần parse nó
    try {
      const parsedError = JSON.parse(text);
      throw new Error(parsedError || `API error ${res.status}`);
    } catch {
      throw new Error(text || `API error ${res.status}`);
    }
  }
  const contentType = res.headers.get("content-type");
  const data = contentType && contentType.includes("application/json") ? await res.json() : (undefined as unknown as T);
  return { data, headers: res.headers };
}

// Products
export async function getProducts(query?: Query) {
  return api<Books[]>(`/books${buildQuery(query)}`);
}
export async function getProduct(id: string | number) {
  return api<Books>(`/books/${id}`);
}
export async function createProduct(body: Partial<Books>, token: string) {
  return api<Books>(`/books`, { method: "POST", body: JSON.stringify(body) }, token);
}
export async function updateProduct(id: string | number, body: Partial<Books>, token: string) {
  return api<Books>(`/books/${id}`, { method: "PUT", body: JSON.stringify(body) }, token);
}
export async function deleteProduct(id: string | number, token: string) {
  return api<void>(`/books/${id}`, { method: "DELETE" }, token);
}

// Categories
export async function getCategories(query?: Query) {
  return api<Category[]>(`/categories${buildQuery(query)}`);
}
export async function createCategory(body: { name: string }, token: string) {
  return api<Category>(`/categories`, { method: "POST", body: JSON.stringify(body) }, token);
}
export async function updateCategory(id: string | number, body: { name: string }, token: string) {
  return api<Category>(`/categories/${id}`, { method: "PUT", body: JSON.stringify(body) }, token);
}
export async function deleteCategory(id: string | number, token: string) {
  return api<void>(`/categories/${id}`, { method: "DELETE" }, token);
}

// Users
export async function getUsers(token: string) {
  return api<User[]>(`/users`, undefined, token);
}
export async function createUser(body: Partial<User>, token: string) {
  // json-server không yêu cầu token để tạo user, nhưng ta vẫn truyền để đồng bộ
  // API thực tế sẽ cần endpoint /register hoặc tương tự
  return api<User>(`/users`, { method: "POST", body: JSON.stringify(body) }, token);
}

export async function updateUser(id: string | number, body: Partial<User>, token: string) {
  return api<User>(`/users/${id}`, { method: "PATCH", body: JSON.stringify(body) }, token);
}

export async function deleteUser(id: string | number, token: string) {
  return api<void>(`/users/${id}`, { method: "DELETE" }, token);
}

// Orders
export async function getOrders(query?: Query) {
  return api<Order[]>(`/orders${buildQuery(query)}`);
}
export async function updateOrderStatus(id: string | number, status: Order['status'], token: string) {
  // Chỉ cập nhật trường status
  return api<Order>(`/orders/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }, token);
}