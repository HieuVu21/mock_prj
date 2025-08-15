const authInterceptor = {
  onAuthError: () => {}, // Hàm rỗng mặc định
};

// Hàm để AuthProvider có thể đăng ký hàm logout của nó
export const registerAuthInterceptor = (onAuthError: () => void) => {
  authInterceptor.onAuthError = onAuthError;
};

// Hàm để api.ts có thể gọi khi gặp lỗi
export const triggerAuthError = () => {
  authInterceptor.onAuthError();
};