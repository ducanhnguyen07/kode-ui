import axios from "axios";
import { store } from "@/app/store";
import { logout } from "@/features/auth/authSlice";

const apiClient = axios.create({
  baseURL: "http://localhost:9998/api", // Base URL của Backend
  headers: {
    "Content-Type": "application/json",
  },
});

// 1. Request Interceptor: Tự động đính Token
apiClient.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 2. Response Interceptor: Xử lý khi Token hết hạn (401)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Nếu Backend trả về 401 Unauthorized -> Token hết hạn hoặc không hợp lệ
      store.dispatch(logout()); // Logout khỏi Redux
      window.location.href = "/login"; // Redirect về trang login
    }
    return Promise.reject(error);
  },
);

export default apiClient;
