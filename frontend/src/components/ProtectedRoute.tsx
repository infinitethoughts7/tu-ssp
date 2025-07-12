import React from "react";
import { useAuth } from "../context/useAuth";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredEmail?: string | undefined;
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredEmail,
  fallbackPath = "/staff-login",
}) => {
  const { user, accessToken } = useAuth();

  // Check if user is authenticated
  if (!accessToken || !user) {
    console.log(
      "ProtectedRoute: No access token or user, redirecting to",
      fallbackPath
    );
    return <Navigate to={fallbackPath} replace />;
  }

  // Check if user has the required email (for principal access)
  // Only check if requiredEmail is provided and not undefined
  if (requiredEmail && user.email !== requiredEmail) {
    console.log("ProtectedRoute: Email mismatch, redirecting to", fallbackPath);
    console.log("Required email:", requiredEmail, "User email:", user.email);
    return <Navigate to={fallbackPath} replace />;
  }

  console.log("ProtectedRoute: Access granted for user:", user);
  return <>{children}</>;
};

export default ProtectedRoute;
