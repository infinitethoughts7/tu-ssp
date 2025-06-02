import { useState, useEffect, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { AuthProviderProps, User } from "./auth.types";
import { AuthContext } from "./auth.context";
import api from "../services/api";

interface ErrorResponse {
  error: string;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("userData");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("staffAccessToken") ||
      localStorage.getItem("studentAccessToken") ||
      localStorage.getItem("accessToken")
  );
  const [refreshToken, setRefreshToken] = useState<string | null>(
    localStorage.getItem("refreshToken")
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logout = useCallback(() => {
    const userType = localStorage.getItem("userType") || "student";

    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setError(null);

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("userType");
    localStorage.removeItem("department");
    localStorage.removeItem("staffAccessToken");
    localStorage.removeItem("studentAccessToken");

    delete axios.defaults.headers.common["Authorization"];
    navigate(userType === "staff" ? "/staff-login" : "/student-login");
  }, [navigate]);

  const refreshAccessToken = useCallback(async () => {
    try {
      console.log("Attempting to refresh token...");
      const response = await api.post("/auth/token/refresh/", {
        refresh: refreshToken,
      });
      const newAccessToken = response.data.access;
      console.log("Token refresh successful");
      setAccessToken(newAccessToken);
      localStorage.setItem("accessToken", newAccessToken);
      // Update axios default headers
      api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
      return newAccessToken;
    } catch (error) {
      console.error("Token refresh failed:", error);
      // Clear all auth data on refresh failure
      logout();
      throw new Error("Failed to refresh token. Please log in again.");
    }
  }, [refreshToken, logout]);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          refreshToken
        ) {
          originalRequest._retry = true;
          try {
            console.log("401 error detected, attempting token refresh...");
            const newToken = await refreshAccessToken();
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            console.error("Token refresh failed in interceptor:", refreshError);
            logout();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [refreshToken, refreshAccessToken, logout]);

  // Auto-refresh access token on mount if only refreshToken is present
  useEffect(() => {
    const tryRefresh = async () => {
      const refreshToken = localStorage.getItem("refreshToken");
      const staffToken = localStorage.getItem("staffAccessToken");
      const studentToken = localStorage.getItem("studentAccessToken");
      if (!staffToken && !studentToken && refreshToken) {
        try {
          const res = await api.post("/auth/token/refresh/", {
            refresh: refreshToken,
          });
          if (localStorage.getItem("userType") === "staff") {
            localStorage.setItem("staffAccessToken", res.data.access);
            setAccessToken(res.data.access);
          } else {
            localStorage.setItem("studentAccessToken", res.data.access);
            setAccessToken(res.data.access);
          }
          api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${res.data.access}`;
        } catch (err) {
          // Refresh failed, log out
          logout();
        }
      }
    };
    tryRefresh();
  }, []);

  const login = async (credentials: {
    email?: string;
    roll_number?: string;
    password: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const endpoint = credentials.email
        ? "/auth/staff/login/"
        : "/auth/student/login/";

      console.log("Attempting login with credentials:", {
        ...credentials,
        password: "***",
      });
      console.log("API Endpoint:", endpoint);

      const response = await api.post(endpoint, credentials);

      console.log("Full Login Response:", response);
      console.log("Response Data:", response.data);

      if (!response.data.access || !response.data.refresh) {
        console.error("Missing tokens in response:", response.data);
        throw new Error("Invalid response from server");
      }

      const { access, refresh, department, redirect_to } = response.data;

      console.log("Extracted data:", { department, redirect_to });

      setAccessToken(access);
      setRefreshToken(refresh);
      if (credentials.email) {
        localStorage.setItem("staffAccessToken", access);
      } else {
        localStorage.setItem("studentAccessToken", access);
      }
      localStorage.setItem("refreshToken", refresh);
      localStorage.setItem("department", department || "");
      localStorage.setItem("userType", credentials.email ? "staff" : "student");

      // Set the Authorization header for future requests
      api.defaults.headers.common["Authorization"] = `Bearer ${access}`;

      // Fetch user profile
      const profileResponse = await api.get("/profile/");
      const userData = profileResponse.data.profile;
      setUser(userData);
      localStorage.setItem("userData", JSON.stringify(userData));

      // Handle navigation
      if (credentials.email) {
        // For staff login, use redirect_to if provided, otherwise use department
        if (redirect_to) {
          // Remove trailing slash if present
          const cleanPath = redirect_to.replace(/\/$/, "");
          console.log("Navigating to clean path:", cleanPath);
          navigate(cleanPath);
        } else if (department) {
          navigate(`/dashboard/${department}`);
        } else {
          navigate("/staff-dashboard");
        }
      } else {
        navigate("/student-dashboard");
      }
    } catch (error) {
      console.error("Login Error Details:", error);
      if (axios.isAxiosError(error)) {
        console.error("Axios Error Response:", error.response?.data);
        console.error("Axios Error Status:", error.response?.status);
      }
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage =
        axiosError.response?.data?.error ||
        "Login failed. Please check your credentials.";
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        isLoading,
        error,
        login,
        logout,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
