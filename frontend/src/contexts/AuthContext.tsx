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
      const endpoint =
        credentials.userType === "staff"
          ? "/auth/staff/login/"
          : "/auth/student/login/";

      const response = await api.post(endpoint, credentials);

      const { access, refresh, department } = response.data;

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
            navigate("/staff-login");
        }
      } else {
        navigate("/dashboard");
      }

      setUser(response.data);
      return response.data;
    } catch (error) {
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
