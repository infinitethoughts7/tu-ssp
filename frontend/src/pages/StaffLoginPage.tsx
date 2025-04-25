import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Loader2, Eye, EyeOff, BookOpen } from "lucide-react";
import { useAuth } from "../context/useAuth";

const StaffLoginPage = () => {
  const navigate = useNavigate();
  const { login, error: authError, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      await login({ email: email.toLowerCase().trim(), password });
    } catch {
      if (!authError) {
        setError("An error occurred. Please try again.");
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <svg
          className="w-full h-full opacity-5"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="smallGrid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="black"
                strokeWidth="0.5"
              />
            </pattern>
            <pattern
              id="grid"
              width="80"
              height="80"
              patternUnits="userSpaceOnUse"
            >
              <rect width="80" height="80" fill="url(#smallGrid)" />
              <path
                d="M 80 0 L 0 0 0 80"
                fill="none"
                stroke="black"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <g className="buildings animate-float">
            <rect
              x="10%"
              y="40%"
              width="5%"
              height="30%"
              fill="black"
              opacity="0.1"
            />
            <rect
              x="20%"
              y="30%"
              width="4%"
              height="40%"
              fill="black"
              opacity="0.07"
            />
            <rect
              x="30%"
              y="35%"
              width="6%"
              height="35%"
              fill="black"
              opacity="0.1"
            />
            <rect
              x="40%"
              y="25%"
              width="3%"
              height="45%"
              fill="black"
              opacity="0.07"
            />
            <rect
              x="50%"
              y="35%"
              width="5%"
              height="35%"
              fill="black"
              opacity="0.1"
            />
            <rect
              x="60%"
              y="20%"
              width="4%"
              height="50%"
              fill="black"
              opacity="0.07"
            />
            <rect
              x="70%"
              y="30%"
              width="7%"
              height="40%"
              fill="black"
              opacity="0.1"
            />
            <rect
              x="85%"
              y="25%"
              width="4%"
              height="45%"
              fill="black"
              opacity="0.07"
            />
          </g>
        </svg>
        <style>
          {`
            @keyframes float {
              0% {
                transform: translateY(0);
              }
              50% {
                transform: translateY(-10px);
              }
              100% {
                transform: translateY(0);
              }
            }
            .animate-float {
              animation: float 15s ease-in-out infinite;
            }
          `}
        </style>
      </div>

      {/* Login Form */}
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md border border-gray-200 z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gray-100 p-4 rounded-full">
              <BookOpen size={32} className="text-black" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-black">Staff Login</h1>
          <p className="text-gray-700 mt-2">
            Welcome back! Please login to access the staff portal
          </p>
        </div>

        {error && (
          <div className="bg-gray-100 text-gray-900 p-3 rounded-md mb-6 text-center text-sm border border-gray-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-900 mb-1"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-500" />
              </div>
              <input
                id="email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                placeholder="Enter your email"
                autoComplete="username email"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-900 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-500" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-black focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff size={18} aria-label="Hide password" />
                ) : (
                  <Eye size={18} aria-label="Show password" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 bg-black text-white rounded-md hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black
                     ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Signing in...
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <button
          onClick={() => navigate("/")}
          className="mt-6 w-full text-center text-sm text-gray-600 hover:text-black"
          disabled={isLoading}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default StaffLoginPage;
