import { type Books } from "../interface/book.interface";
import { type Category, type CartItem, type Cart } from "../interface/book.interface";

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string | number;
  userId: string;
  items: Array<{
    book: Books;
    quantity: number;
  }>;
  totalPrice: number;
  status: OrderStatus;
  shippingAddress: string;
  paymentMethod: string;
  createdAt: string;
  [key: string]: any;
}

export interface CreateOrderResponse extends Omit<Order, 'id' | 'createdAt'> {
  id: string;
  createdAt: string;
}
import { triggerAuthError } from "../lib/auth-interceptor";
import { type User } from "../interface/user.interface";

// Define the API response type
interface ApiResponse<T = any> {
  data: T;
  headers: Headers;
  status: number;
  statusText: string;
  ok: boolean;
}

// Helper function to create an ApiResponse from a Response
async function createApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const headers = response.headers;
  const status = response.status;
  const statusText = response.statusText;
  const ok = response.ok;

  try {
    const data = await response.json();
    return { data, headers, status, statusText, ok } as ApiResponse<T>;
  } catch (error) {
    // If we can't parse JSON, return null data
    return { data: null, headers, status, statusText, ok } as unknown as ApiResponse<T>;
  }
}

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
  const validEntries = Object.entries(q).filter(
    ([, value]) => value != null && value !== ""
  );

  if (validEntries.length === 0) return "";

  // Chỉ tạo query string từ các entry hợp lệ
  const params = new URLSearchParams(
    Object.fromEntries(validEntries.map(([k, v]) => [k, String(v)]))
  );
  return `?${params.toString()}`;
};

async function api<T>(
  path: string,
  init?: RequestInit,
  token?: string,
  retries = 3,
  delay = 1000
): Promise<ApiResponse<T>> {
  // Lấy token từ tham số truyền vào hoặc từ localStorage để đảm bảo các request kèm Authorization
  const effectiveToken =
    token ??
    (typeof window !== "undefined"
      ? localStorage.getItem("token") ?? undefined
      : undefined);

  const makeRequest = async (): Promise<ApiResponse<T>> => {
    let response: Response;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      response = await fetch(API_URL + path, {
        ...init,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...(init?.headers || {}),
          ...(effectiveToken ? { Authorization: `Bearer ${effectiveToken}` } : {}),
        },
      });

      clearTimeout(timeoutId);

      const apiResponse = await createApiResponse<T>(response);

      if (!response.ok) {
        const error = new Error(
          (apiResponse.data as any)?.message || response.statusText || "Request failed"
        );
        (error as any).status = response.status;
        (error as any).response = apiResponse.data;
        throw error;
      }

      return apiResponse;
    } catch (error: any) {
      console.error("API call failed:", error);

      // Handle connection reset specifically
      if (
        error.name === "AbortError" ||
        error.message?.includes("network") ||
        error.message?.includes("reset")
      ) {
        // For POST/PUT/PATCH/DELETE requests, if we get here after a connection reset,
        // it's possible the request was successful but the connection was reset
        if (
          init?.method &&
          ["POST", "PUT", "PATCH", "DELETE"].includes(init.method.toUpperCase())
        ) {
          console.warn(
            "Connection was reset, but the request might have been successful"
          );
          // Create a success response with the expected type
          // Use type assertion to handle the generic type T
          return {
            data: { id: "success", status: "created" } as unknown as T,
            headers: new Headers(),
            status: 200,
            statusText: 'OK',
            ok: true
          };
        }
      }

      throw error;
    }
  };

  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      // If we get here, the request was successful
      const res = await makeRequest();
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      // Use the same response handling as in makeRequest
      return res;
    } catch (error) {
      lastError = error;
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  // If we get here, all retries failed
  console.error(`API call failed after ${retries} attempts:`, lastError);
  
  // Handle 401 Unauthorized error
  if (lastError.message && lastError.message.includes('401')) {
    triggerAuthError();
    throw new Error("Phiên đăng nhập đã hết hạn. Đang đăng xuất...");
  }
  
  throw lastError;
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
      const parsed = JSON.parse(rawAuth) as {
        token?: string;
        user?: Partial<User> & { id?: string | number };
      };
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
      const decoded = JSON.parse(atob(payload)) as {
        sub?: string | number;
        userId?: string | number;
        id?: string | number;
        email?: string;
      };
      userId = decoded.sub ?? decoded.userId ?? decoded.id ?? userId;
      email = email ?? decoded.email;
    } catch {
      // ignore
    }
  }

  if (userId != null) {
    try {
      const res = await api<any>(`/users/${userId}`);
      // Map backend fields to frontend User interface
      const userData = {
        ...res.data,
        fullName: res.data.fullname,
        // Ensure other fields are properly mapped if needed
      };
      return { data: userData, headers: res.headers };
    } catch (error) {
      // If user not found by ID, try to find by email
      console.log('User not found by ID, trying to find by email...');
    }
  }

  if (email) {
    const res = await api<any[]>(`/users?email=${encodeURIComponent(email)}`);
    if (Array.isArray(res.data) && res.data.length > 0) {
      // Map backend fields to frontend User interface for each user
      const users = res.data.map(user => ({
        ...user,
        fullName: user.fullname,
        // Ensure other fields are properly mapped if needed
      }));
      return { data: users[0], headers: res.headers };
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
  // Create a new object without the fullName field if it exists
  const { fullName, ...rest } = body;
  const requestBody = {
    ...rest,
    fullname: fullName // Use the correct field name for the backend
  };

  return api<User>(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(requestBody),
  });
}

export async function deleteUser(id: string | number) {
  return api<void>(`/users/${id}`, { method: "DELETE" });
}

// Orders
interface GetOrdersQuery {
  status?: string;
  isAdmin?: boolean;
  userId?: string | null;
}

export async function getOrders(query: GetOrdersQuery = {}): Promise<ApiResponse<Order[]>> {
  console.log('🔍 getOrders called with query:', JSON.stringify(query, null, 2));
  
  // For admin access, we don't need to check userId
  if (query.isAdmin) {
    console.log('👑 Admin access - fetching all orders');
  } else if (!query.userId) {
    // For non-admin, userId is required
    console.error('❌ User ID is required for non-admin users');
    throw new Error('User ID is required');
  }

  // Build query parameters
  const queryParams = new URLSearchParams();
  
  // Add status filter if provided
  if (query.status) {
    queryParams.append('status', query.status);
    console.log('🔎 Added status filter:', query.status);
  }
  
  // Add user ID filter for non-admin users
  if (!query.isAdmin && query.userId) {
    const userIdStr = String(query.userId);
    queryParams.append('userId', userIdStr);
    console.log('👤 Filtering orders by userId:', userIdStr);
  }
  
  const url = `/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  console.log('🌐 Making request to:', url);
  
  try {
    const response = await api<Order[]>(url);
    console.log('✅ Orders API response:', {
      status: response.status,
      dataLength: response.data?.length || 0,
      firstOrder: response.data?.[0] ? {
        id: response.data[0].id,
        status: response.data[0].status,
        itemCount: response.data[0].items?.length || 0
      } : 'No orders'
    });
    return response;
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    throw error;
  }
}

export async function getOrder(id: string | number) {
  return api<Order>(`/orders/${id}`);
}

export async function createOrder(body: Omit<Order, 'userId' | 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<CreateOrderResponse>> {
  try {
    // Get user ID from localStorage
    const authData = JSON.parse(localStorage.getItem('auth') || '{}');
    const userId = authData.user?.id;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    // Create order ID and ensure it's a string
    const orderId = body.id ? String(body.id) : Date.now().toString();
    const now = new Date().toISOString();
    
    // Create complete order data with all required fields
    const orderData: Order = {
      ...body,
      userId: String(userId), // Ensure userId is a string
      id: orderId,
      status: 'pending',
      totalPrice: body.totalPrice || 0,
      paymentMethod: body.paymentMethod || 'cod',
      shippingAddress: body.shippingAddress || '',
      items: body.items || [],
      createdAt: now,
      updatedAt: now
    };

    console.log('Creating order with data:', JSON.stringify(orderData, null, 2));
    
    const response = await api<CreateOrderResponse>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });

    // If the response data is null but the request was successful, construct a minimal response
    if (!response.data) {
      const minimalResponse: CreateOrderResponse = {
        id: orderId,
        userId: String(userId),
        status: 'pending',
        totalPrice: orderData.totalPrice,
        paymentMethod: orderData.paymentMethod,
        shippingAddress: orderData.shippingAddress,
        items: orderData.items,
        createdAt: now,
        updatedAt: now
      };
      
      return {
        data: minimalResponse,
        headers: new Headers(),
        status: 200,
        statusText: 'OK',
        ok: true
      };
    }

    return response;
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error(`Không thể tạo đơn hàng: ${(error as Error).message}`);
  }
}
export async function updateOrderStatus(
  id: string | number,
  status: Order["status"],
  retryCount = 0
) {
  const MAX_RETRIES = 2;
  const url = `/orders/${id}`;
  const body = JSON.stringify({ status });
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  console.log('=== UPDATE ORDER STATUS REQUEST ===');
  console.log('URL:', url);
  console.log('Method: PATCH');
  console.log('Body:', { status });
  console.log('Token exists:', !!token);
  console.log('Retry attempt:', retryCount);
  
  if (!token) {
    const error = new Error('No authentication token found');
    console.error('❌ Authentication error:', error.message);
    throw error;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    let response;
    try {
      response = await fetch(API_URL + url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Connection': 'keep-alive',
          'Keep-Alive': 'timeout=10, max=1000'
        },
        body,
        signal: controller.signal,
        credentials: 'same-origin',
        mode: 'cors',
        cache: 'no-cache',
        redirect: 'follow',
        referrerPolicy: 'no-referrer'
      });
    } catch (err) {
      // Only log non-connection reset errors
      if (!(err.name === 'TypeError' && err.message.includes('Failed to fetch'))) {
        console.error('Fetch error details:', {
          name: err.name,
          message: err.message,
          code: err.code,
          type: err.type
        });
      }
      
      // If we got a network error but the request might have succeeded,
      // verify by making a GET request after a short delay
      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        console.log('Verifying if update was applied...');
        // Add a small delay to ensure the server has time to process the update
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
          const verifyResponse = await fetch(API_URL + url, {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            signal: controller.signal
          });
          
          if (verifyResponse.ok) {
            const order = await verifyResponse.json();
            if (order.status === status) {
              console.log('✅ Update was applied successfully despite network error');
              return {
                data: { success: true, fromCache: false },
                status: 200,
                statusText: 'OK',
                ok: true
              };
            }
          }
        } catch (verifyErr) {
          console.error('Error verifying update:', verifyErr);
        }
      }
      
      throw err;
    }

    clearTimeout(timeoutId);

    console.log('=== UPDATE ORDER STATUS RESPONSE ===');
    console.log('Status:', response.status, response.statusText);
    
    // Handle 200 OK with connection reset
    if (response.status === 200 && !response.ok) {
      console.warn('Received 200 OK but response is not ok, might be connection reset');
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying... Attempt ${retryCount + 1} of ${MAX_RETRIES}`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return updateOrderStatus(id, status, retryCount + 1);
      }
    }
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error details');
      console.error('❌ Server error response:', errorText);
      throw new Error(`Server responded with status ${response.status}: ${errorText}`);
    }

    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.warn('Failed to parse JSON response, but request might have succeeded');
      data = { success: true };
    }
    
    console.log('✅ Order status updated successfully:', data);
    
    return {
      data,
      headers: response.headers,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    };
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    
    // Handle network errors with retry
    if ((error.name === 'TypeError' && error.message.includes('Failed to fetch')) ||
        (error.name === 'AbortError') ||
        (error.type === 'system' && error.message.includes('network'))) {
      
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying after network error... Attempt ${retryCount + 1} of ${MAX_RETRIES}`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return updateOrderStatus(id, status, retryCount + 1);
      }
      
      throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.');
    }
    
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        ...(error as any).code && { code: (error as any).code },
        ...(error as any).type && { type: (error as any).type },
      });
    }
    
    throw new Error(`Không thể cập nhật trạng thái đơn hàng: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
  }
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
