import { createBrowserRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import HomePage from "../pages/HomePage";
import StudentLoginPage from "../pages/StudentLoginPage";
import StaffLoginPage from "../pages/StaffLoginPage";
import StudentDashboard from "../pages/StudentDashboard";
import StaffDashboard from "../pages/StaffDashboard";
import HostelDues from "../pages/HostelDues";

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
    path: "/dashboard/:department",
    element: (
      <AuthProvider>
        <StaffDashboard />
      </AuthProvider>
    ),
  },
  {
    path: "/hostel-dues",
    element: (
      <AuthProvider>
        <HostelDues />
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
