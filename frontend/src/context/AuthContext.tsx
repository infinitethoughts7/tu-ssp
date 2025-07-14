import { useState, useEffect, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { AuthProviderProps, User } from "./auth.types";
import { AuthContext } from "./auth.context";
import api from "../services/api";

interface ErrorResponse {
  error: string;
}

interface LoginCredentials {
  email: string;
  password: string;
  userType: "staff" | "student";
}

export function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate();
  // Determine user type from URL or localStorage
  const path = window.location.pathname;
  const isStaff =
    path.includes("staff") || localStorage.getItem("userType") === "staff";
  const [user, setUser] = useState<User | null>(() => {
    if (isStaff) {
      const storedUser = localStorage.getItem("staffUserData");
      return storedUser ? JSON.parse(storedUser) : null;
    } else {
      const storedUser = localStorage.getItem("studentUserData");
      return storedUser ? JSON.parse(storedUser) : null;
    }
  });
  const [accessToken, setAccessToken] = useState<string | null>(
    (isStaff
      ? localStorage.getItem("staffAccessToken")
      : localStorage.getItem("studentAccessToken")) ||
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
    localStorage.removeItem("userType");
    localStorage.removeItem("department");
    localStorage.removeItem("staffAccessToken");
    localStorage.removeItem("studentAccessToken");
    localStorage.removeItem("staffUserData");
    localStorage.removeItem("studentUserData");
    delete axios.defaults.headers.common["Authorization"];
    navigate(userType === "staff" ? "/staff-login" : "/student-login");
  }, [navigate]);

  // Add useEffect to fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (accessToken) {
        try {
          const profileEndpoint = isStaff ? "/staff/profile/" : "/profile/";

          const response = await api.get(profileEndpoint);

          // Handle nested profile data structure
          const profileData = isStaff ? response.data : response.data.profile;

          setUser(profileData);
          if (isStaff) {
            localStorage.setItem("staffUserData", JSON.stringify(profileData));
          } else {
            localStorage.setItem(
              "studentUserData",
              JSON.stringify(profileData)
            );
          }
        } catch (error) {
          if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
              logout();
            }
          }
        }
      }
    };

    fetchProfile();
  }, [accessToken, isStaff, logout]); // Added logout back to dependencies

  const refreshAccessToken = useCallback(async () => {
    try {
      const response = await api.post("/auth/refresh/", {
        refresh: refreshToken,
      });
      const newAccessToken = response.data.access;

      // Store token based on user type
      const userType = localStorage.getItem("userType") || "student";
      if (userType === "staff") {
        localStorage.setItem("staffAccessToken", newAccessToken);
      } else {
        localStorage.setItem("studentAccessToken", newAccessToken);
      }

      setAccessToken(newAccessToken);
      // Update axios default headers
      api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
      return newAccessToken;
    } catch (error) {
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
            const newToken = await refreshAccessToken();
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
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
  }, [refreshToken, refreshAccessToken]); // Removed logout from dependencies

  // Auto-refresh access token on mount if only refreshToken is present
  useEffect(() => {
    const tryRefresh = async () => {
      const refreshToken = localStorage.getItem("refreshToken");
      const staffToken = localStorage.getItem("staffAccessToken");
      const studentToken = localStorage.getItem("studentAccessToken");
      if (!staffToken && !studentToken && refreshToken) {
        try {
          const res = await api.post("/auth/refresh/", {
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
    username?: string; // Changed from roll_number to username
    password: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const endpoint = credentials.email
        ? "/auth/staff/login/"
        : "/auth/student/login/";

      const response = await api.post(endpoint, credentials);

      if (!response.data.access || !response.data.refresh) {
        throw new Error("Invalid response from server");
      }

      const { access, refresh, department } = response.data;

      // Store tokens and set authorization header
      if (credentials.email) {
        localStorage.setItem("staffAccessToken", access);
        localStorage.setItem("refreshToken", refresh);
        localStorage.setItem("userType", "staff");
        localStorage.setItem("department", department);
        // Clear student data on staff login
        localStorage.removeItem("studentAccessToken");
        localStorage.removeItem("studentUserData");
        // Set the Authorization header for future requests
        api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
        setAccessToken(access);
        setRefreshToken(refresh);
      } else {
        localStorage.setItem("studentAccessToken", access);
        localStorage.setItem("refreshToken", refresh);
        localStorage.setItem("userType", "student");
        // Clear staff data on student login
        localStorage.removeItem("staffAccessToken");
        localStorage.removeItem("staffUserData");
        // Set the Authorization header for future requests
        api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
        setAccessToken(access);
        setRefreshToken(refresh);
      }

      // Fetch user profile with the correct endpoint
      const profileEndpoint = credentials.email
        ? "/staff/profile/"
        : "/profile/";

      const profileResponse = await api.get(profileEndpoint, {
        headers: {
          Authorization: `Bearer ${access}`,
        },
      });

      // Handle nested profile data structure
      const userData = credentials.email
        ? profileResponse.data
        : profileResponse.data.profile;

      setUser(userData);
      if (credentials.email) {
        localStorage.setItem("staffUserData", JSON.stringify(userData));
      } else {
        localStorage.setItem("studentUserData", JSON.stringify(userData));
      }

      // Handle navigation based on department and email
      if (credentials.email) {
        // Special case for principal
        if (credentials.email === "principal@tu.in") {
          navigate("/total-dues-dashboard");
        } else {
          switch (department) {
            case "librarian":
              navigate("/library-records");
              break;
            case "sports_incharge":
              navigate("/sports-records");
              break;
            case "lab_incharge":
              navigate("/others-dues");
              break;
            case "hostel_superintendent":
              navigate("/hostel-dues");
              break;
            case "accounts":
            case "accountant":
              navigate("/accounts-dues", { replace: true });
              break;
            default:
              navigate("/staff-login");
          }
        }
      } else {
        navigate("/student-dashboard");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          logout();
        }
      }
      setError("Login failed. Please check your credentials.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      let response;
      if (isStaff) {
        response = await api.get("/staff/profile/");
        setUser(response.data);
      } else {
        response = await api.get("/profile/");
        // Handle nested profile data structure for students
        setUser(response.data.profile);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          logout();
        }
      }
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
