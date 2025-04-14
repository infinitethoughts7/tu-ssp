import { createBrowserRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import HomePage from "../pages/HomePage";
import StudentLoginPage from "../pages/StudentLoginPage";
import StaffLoginPage from "../pages/StaffLoginPage";
import StudentDashboard from "../pages/StudentDashboard";
import StaffDashboard from "../pages/StaffDashboard";
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthProvider>
        <HomePage />
      </AuthProvider>
    ),
  },
  {
    path: "/student-login",
    element: (
      <AuthProvider>
        <StudentLoginPage />
      </AuthProvider>
    ),
  },
  {
    path: "/staff-login",
    element: (
      <AuthProvider>
        <StaffLoginPage />
      </AuthProvider>
    ),
  },
  {
    path: "/student-dashboard",
    element: (
      <AuthProvider>
        <StudentDashboard />
      </AuthProvider>
    ),
  },
  {
    path: "/staff-dashboard",
    element: (
      <AuthProvider>
        <StaffDashboard />
      </AuthProvider>
    ),
  },
  {
    path: "*",
    element: (
      <AuthProvider>
        <HomePage />
      </AuthProvider>
    ),
  },
]);

export { router };
