import React, { useState, createContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

interface LoginCredentials {
  email: string;
  password: string;
  userType: "staff" | "student";
}

interface AuthContextType {
  user: any;
  login: (credentials: LoginCredentials) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  const login = async (credentials: LoginCredentials) => {
    try {
      console.log("Attempting login with credentials:", credentials);
      const endpoint =
        credentials.userType === "staff"
          ? "/auth/staff/login/"
          : "/auth/student/login/";
      console.log("API Endpoint:", endpoint);

      const response = await api.post(endpoint, credentials);
      console.log("Full Login Response:", response);
      console.log("Response Data:", response.data);

      const { access, refresh, department } = response.data;
      console.log("Extracted data:", { department });

      // Store tokens
      localStorage.setItem(
        credentials.userType === "staff"
          ? "staffAccessToken"
          : "studentAccessToken",
        access
      );
      localStorage.setItem("refreshToken", refresh);
      localStorage.setItem("userType", credentials.userType);
      localStorage.setItem("department", department);

      // Handle department-specific routing
      if (credentials.userType === "staff") {
        switch (department) {
          case "librarian":
          case "sports_incharge":
          case "lab_incharge":
            navigate("/others-dues");
            break;
          case "hostel_superintendent":
            navigate("/hostel-dues");
            break;
          case "accounts":
            navigate("/accounts-dues");
            break;
          default:
            console.warn(`Unknown department: ${department}`);
            navigate("/staff-login");
        }
      } else {
        navigate("/dashboard");
      }

      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("staffAccessToken");
    localStorage.removeItem("studentAccessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userType");
    localStorage.removeItem("department");
    setUser(null);
    navigate("/staff-login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
