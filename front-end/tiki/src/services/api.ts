import {
  type Books,
  type Category,
  type CartItem,
  type Cart,
} from "../interface/book.interface";
import { triggerAuthError } from "../lib/auth-interceptor";
import { type User } from "../interface/user.interface";
import { type Order } from "../interface/order.interface";

export const API_URL = "http://localhost:3000"; // Change if needed

export type Query = {
  _page?: number;
  _limit?: number;
  _sort?: string;
  _order?: "asc" | "desc";
  q?: string;
  [key: string]: any;
};

const buildQuery = (q?: Query) => {
  if (!q) return "";
  
  // Lọc ra các entry có giá trị hợp lệ (không phải null, undefined, hoặc chuỗi rỗng)
  const validEntries = Object.entries(q).filter(([, value]) => value != null && value !== '');
  
  if (validEntries.length === 0) return "";

  // Chỉ tạo query string từ các entry hợp lệ
  const params = new URLSearchParams(Object.fromEntries(validEntries.map(([k, v]) => [k, String(v)])));
  return `?${params.toString()}`;
};
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
  const data =
    contentType && contentType.includes("application/json")
      ? await res.json()
      : (undefined as unknown as T);
  return { data, headers: res.headers };
}

// Products
export async function getProducts(query?: Query) {
  return api<Books[]>(`/books${buildQuery(query)}`);
}
export async function getProduct(id: string | number) {
  return api<Books>(`/books/${id}`);
}
export async function createProduct(body: Partial<Books>) {
  return api<Books>(`/books`, { method: "POST", body: JSON.stringify(body) });
}
export async function updateProduct(id: string | number, body: Partial<Books>) {
  return api<Books>(`/books/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}
export async function deleteProduct(id: string | number) {
  return api<void>(`/books/${id}`, { method: "DELETE" });
}

// Categories
export async function getCategories(query?: Query) {
  return api<Category[]>(`/categories${buildQuery(query)}`);
}
export async function createCategory(body: { name: string }) {
  return api<Category>(`/categories`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
export async function updateCategory(id: number, body: { name: string }) {
  return api<Category>(`/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}
export async function deleteCategory(id: number) {
  return api<void>(`/categories/${id}`, { method: "DELETE" });
}

// Users
export async function getUsers() {
  return api<User[]>(`/users`);
}

export async function getCurrentUser() {
  // Try to get user id/email from cached auth or token payload
  let userId: string | number | undefined;
  let email: string | undefined;

  const rawAuth = localStorage.getItem("auth");
  if (rawAuth) {
    try {
      const parsed = JSON.parse(rawAuth) as { token?: string; user?: Partial<User> & { id?: string | number } };
      if (parsed?.user?.id != null) userId = parsed.user.id;
      if (parsed?.user?.email) email = parsed.user.email;
    } catch {
      // ignore
    }
  }

  const token = localStorage.getItem("token");
  if (!userId && token) {
    try {
      const [, payload] = token.split(".");
      const decoded = JSON.parse(atob(payload)) as { sub?: string | number; userId?: string | number; id?: string | number; email?: string };
      userId = decoded.sub ?? decoded.userId ?? decoded.id ?? userId;
      email = email ?? decoded.email;
    } catch {
      // ignore
    }
  }

  if (userId != null) {
    return api<User>(`/users/${userId}`);
  }

  if (email) {
    const res = await api<User[]>(`/users?email=${encodeURIComponent(email)}`);
    if (Array.isArray(res.data) && res.data.length > 0) {
      return { data: res.data[0], headers: res.headers };
    }
  }

  throw new Error("Không tìm thấy người dùng hiện tại");
}

export async function createUser(body: Partial<User>) {
  // json-server không yêu cầu token để tạo user, nhưng ta vẫn truyền để đồng bộ
  // API thực tế sẽ cần endpoint /register hoặc tương tự
  return api<User>(`/users`, { method: "POST", body: JSON.stringify(body) });
}

export async function updateUser(id: string | number, body: Partial<User>) {
  return api<User>(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteUser(id: string | number) {
  return api<void>(`/users/${id}`, { method: "DELETE" });
}

// Orders
export async function getOrders(query?: Query) {
  return api<Order[]>(`/orders${buildQuery(query)}`);
}
export async function updateOrderStatus(
  id: string | number,
  status: Order["status"]
) {
  // Chỉ cập nhật trường status
  return api<Order>(`/orders/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// Cart
export async function getCart() {
  return api<Cart>("/cart");
}

export async function addToCart(item: { bookId: string; quantity: number }) {
  return api<CartItem>("/cart/items", {
    method: "POST",
    body: JSON.stringify(item),
  });
}

export async function updateCartItem(id: string, quantity: number) {
  return api<CartItem>(`/cart/items/${id}`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  });
}

export async function deleteCartItem(id: string) {
  return api<void>(`/cart/items/${id}`, { method: "DELETE" });
}
