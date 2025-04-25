import { useState, useEffect, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { AuthProviderProps, User } from "./auth.types";
import { AuthContext } from "./auth.context";
import { API_BASE_URL } from "../services/api";

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
    localStorage.getItem("accessToken")
  );
  const [refreshToken, setRefreshToken] = useState<string | null>(
    localStorage.getItem("refreshToken")
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshAccessToken = useCallback(async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
        refresh: refreshToken,
      });
      const newAccessToken = response.data.access;
      setAccessToken(newAccessToken);
      localStorage.setItem("accessToken", newAccessToken);
    } catch {
      throw new Error("Failed to refresh token");
    }
  }, [refreshToken]);

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

    delete axios.defaults.headers.common["Authorization"];
    navigate(userType === "staff" ? "/staff-login" : "/student-login");
  }, [navigate]);

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
            await refreshAccessToken();
            originalRequest.headers[
              "Authorization"
            ] = `Bearer ${localStorage.getItem("accessToken")}`;
            return axios(originalRequest);
          } catch (refreshError) {
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
      console.log("API Endpoint:", `${API_BASE_URL}${endpoint}`);

      const response = await axios.post(
        `${API_BASE_URL}${endpoint}`,
        credentials
      );

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
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);
      localStorage.setItem("department", department || "");
      localStorage.setItem("userType", credentials.email ? "staff" : "student");

      // Set the Authorization header for future requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${access}`;

      // Fetch user profile
      const profileResponse = await axios.get(`${API_BASE_URL}/profile/`);
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
