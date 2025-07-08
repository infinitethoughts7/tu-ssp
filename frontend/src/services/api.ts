import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  timeout: 10000, // 10 second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => { 
    // Always prefer staffAccessToken if it exists
    const staffToken = localStorage.getItem("staffAccessToken");
    const studentToken = localStorage.getItem("studentAccessToken");
    if (staffToken) {
      config.headers.Authorization = `Bearer ${staffToken}`;
    } else if (studentToken) {
      config.headers.Authorization = `Bearer ${studentToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Try to refresh the token
        const response = await axios.post(
          `${
            import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api"
          }/auth/refresh/`,
          { refresh: refreshToken }
        );

        const { access } = response.data;
        const userType = localStorage.getItem("userType") || "student";

        // Store the new token
        localStorage.setItem(
          userType === "staff" ? "staffAccessToken" : "studentAccessToken",
          access
        );

        // Update the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${access}`;

        // Retry the original request
        return axios(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear auth data and redirect to login
        localStorage.removeItem("staffAccessToken");
        localStorage.removeItem("studentAccessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userType");
        window.location.href = "/staff-login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
