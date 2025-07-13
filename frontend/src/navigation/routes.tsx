import { createBrowserRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import HomePage from "../pages/HomePage";
import StudentLoginPage from "../pages/StudentLoginPage";
import StaffLoginPage from "../pages/StaffLoginPage";

import LegacyAccounts from "../pages/LegacyAccounts";
import HostelDues from "../pages/HostelDues";
import TotalDuesDashboard from "../pages/TotalDuesDashboard";
import LibraryRecords from "../pages/LibraryRecords";
import SportsRecords from "../pages/SportsRecords";
import StudentDashboard from "../pages/StudentDashboard";

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
    path: "/accounts-dues",
    element: (
      <AuthProvider>
        <ProtectedRoute fallbackPath="/staff-login" requiredEmail={undefined}>
          <LegacyAccounts />
        </ProtectedRoute>
      </AuthProvider>
    ),
  },
  {
    path: "/dashboard/accounts",
    element: (
      <AuthProvider>
        <ProtectedRoute fallbackPath="/staff-login" requiredEmail={undefined}>
          <LegacyAccounts />
        </ProtectedRoute>
      </AuthProvider>
    ),
  },
  {
    path: "/legacy-accounts",
    element: (
      <AuthProvider>
        <ProtectedRoute fallbackPath="/staff-login" requiredEmail={undefined}>
          <LegacyAccounts />
        </ProtectedRoute>
      </AuthProvider>
    ),
  },
  {
    path: "/hostel-dues",
    element: (
      <AuthProvider>
        <ProtectedRoute fallbackPath="/staff-login" requiredEmail={undefined}>
          <HostelDues />
        </ProtectedRoute>
      </AuthProvider>
    ),
  },

  {
    path: "/library-records",
    element: (
      <AuthProvider>
        <ProtectedRoute fallbackPath="/staff-login" requiredEmail={undefined}>
          <LibraryRecords />
        </ProtectedRoute>
      </AuthProvider>
    ),
  },
  {
    path: "/sports-records",
    element: (
      <AuthProvider>
        <ProtectedRoute fallbackPath="/staff-login" requiredEmail={undefined}>
          <SportsRecords />
        </ProtectedRoute>
      </AuthProvider>
    ),
  },
  {
    path: "/total-dues-dashboard",
    element: (
      <AuthProvider>
        <ProtectedRoute requiredEmail="principal@tu.in">
          <TotalDuesDashboard />
        </ProtectedRoute>
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
    path: "*",
    element: (
      <AuthProvider>
        <HomePage />
      </AuthProvider>
    ),
  },
]);

export { router };
