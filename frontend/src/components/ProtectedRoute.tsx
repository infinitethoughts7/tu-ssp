import React from "react";
import { useAuth } from "../context/useAuth";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredEmail?: string;
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredEmail = "principal@tu.in",
  fallbackPath = "/staff-login",
}) => {
  const { user, accessToken } = useAuth();

  // Check if user is authenticated
  if (!accessToken || !user) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Check if user has the required email (for principal access)
  if (requiredEmail && user.email !== requiredEmail) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
