import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building, Mail, Lock } from "lucide-react";
import { useAuth } from "../context/useAuth";

const StaffLoginPage = () => {
  const navigate = useNavigate();
  const { login, error: authError, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); 

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
     await login({ email: email.toLowerCase().trim(), password }); // 🔥 dynamic redirection based on department
    } catch {
      if (authError) {
        setError(authError);
      } else {
        setError("An error occurred. Please try again.");
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gray-100 p-3 rounded-full">
              <Building size={32} className="text-gray-800" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-gray-800">Staff Login</h1>
          <p className="text-gray-600 mt-2">
            Welcome back! Please login to your account
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded mb-6 text-center text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-500" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-800 focus:border-gray-800"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-500" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-800 focus:border-gray-800"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors duration-200
                     ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <button
          onClick={() => navigate("/")}
          className="mt-6 w-full text-center text-sm text-gray-600 hover:text-gray-800"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default StaffLoginPage;
