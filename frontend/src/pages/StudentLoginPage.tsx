import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/useAuth";

const StudentLoginPage = () => {
  const navigate = useNavigate();
  const { login, error: authError, isLoading } = useAuth();
  const [rollNumber, setRollNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      await login({ roll_number: rollNumber, password });
      navigate("/student-dashboard");
    } catch {
      if (authError) {
        setError(authError);
      } else {
        setError("An error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="flex h-screen w-full">
      {/* Left Side - Login Form (Dark) */}
      <div className="w-full md:w-1/2 bg-gray-900 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-white mb-1">Login</h2>
          <p className="text-gray-400 mb-8">Enter your account details</p>

          {error && (
            <div className="bg-red-500/10 text-red-500 p-3 rounded-md mb-6 text-center text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username/Roll Number input */}
            <div className="space-y-1">
              <label className="text-sm text-gray-400">Username</label>
              <input
                type="text"
                pattern="[0-9]*"
                inputMode="numeric"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="w-full bg-transparent text-white border-b border-gray-700 pb-2 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Enter your roll number"
                required
              />
            </div>

            {/* Password input */}
            <div className="space-y-1">
              <label className="text-sm text-gray-400">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-white border-b border-gray-700 pb-2 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 bottom-2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="text-right">
              <a
                href="#"
                className="text-sm text-gray-400 hover:text-purple-400"
              >
                Forgot Password?
              </a>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-md transition-colors"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Sign up link */}
          <div className="flex justify-between items-center mt-8">
            <span className="text-gray-400 text-sm">
              Don't have an account?
            </span>
            <a
              href="#"
              className="text-sm text-gray-200 bg-gray-800 py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
            >
              Sign up
            </a>
          </div>

          {/* Back to home */}
          <button
            onClick={() => navigate("/")}
            className="mt-6 w-full text-center text-sm text-gray-500 hover:text-gray-300"
          >
            Back to Home
          </button>
        </div>
      </div>
 
      {/* Right Side - Purple background with illustration */}
      <div className="hidden md:block md:w-1/2 bg-purple-600 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Background shapes */}
        <div className="absolute top-20 left-20 w-48 h-48 rounded-full bg-purple-500 opacity-50"></div>
        <div className="absolute bottom-20 right-20 w-36 h-36 rounded-full bg-purple-500 opacity-50"></div>
        <div className="absolute w-60 h-60 top-16 right-16 rounded-full bg-purple-500 opacity-10"></div>

        <div className="relative h-full w-full flex flex-col items-center justify-center">
          <div className="text-left mb-4 max-w-lg">
            <h1 className="text-5xl font-bold text-white mb-2">Welcome to</h1>
            <h2 className="text-4xl font-bold text-white/90 mb-2">
              student portal
            </h2>
            <p className="text-lg text-white/80">
              Login to access your account
            </p>
          </div>

          {/* Vector Illustration */}
          <div className="w-full max-w-md mt-8">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 600 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Document with magnifying glass */}
              <rect
                x="150"
                y="50"
                width="240"
                height="320"
                rx="10"
                fill="white"
              />
              {/* Document lines */}
              <rect
                x="180"
                y="100"
                width="180"
                height="12"
                rx="6"
                fill="#E0E0E0"
              />
              <rect
                x="180"
                y="130"
                width="180"
                height="12"
                rx="6"
                fill="#E0E0E0"
              />
              <rect
                x="180"
                y="160"
                width="180"
                height="12"
                rx="6"
                fill="#E0E0E0"
              />
              <rect
                x="180"
                y="190"
                width="180"
                height="12"
                rx="6"
                fill="#E0E0E0"
              />
              <rect
                x="180"
                y="220"
                width="180"
                height="12"
                rx="6"
                fill="#E0E0E0"
              />
              <rect
                x="180"
                y="250"
                width="180"
                height="12"
                rx="6"
                fill="#E0E0E0"
              />
              <rect
                x="180"
                y="280"
                width="180"
                height="12"
                rx="6"
                fill="#E0E0E0"
              />
              <rect
                x="180"
                y="310"
                width="180"
                height="12"
                rx="6"
                fill="#E0E0E0"
              />
              {/* Magnifying glass */}
              <circle
                cx="130"
                cy="140"
                r="60"
                stroke="white"
                strokeWidth="10"
              />
              <line
                x1="75"
                y1="200"
                x2="110"
                y2="170"
                stroke="white"
                strokeWidth="10"
                strokeLinecap="round"
              />
              {/* Person 1 - Standing with phone */}
              <circle cx="80" cy="280" r="20" fill="white" /> {/* Head */}
              <rect
                x="70"
                y="300"
                width="20"
                height="60"
                rx="10"
                fill="white"
              />{" "}
              {/* Body */}
              <rect
                x="50"
                y="310"
                width="10"
                height="40"
                rx="5"
                fill="white"
                transform="rotate(-20 50 310)"
              />{" "}
              {/* Left arm */}
              <rect
                x="110"
                y="310"
                width="10"
                height="25"
                rx="5"
                fill="white"
                transform="rotate(30 110 310)"
              />{" "}
              {/* Right arm */}
              <rect
                x="65"
                y="360"
                width="10"
                height="40"
                rx="5"
                fill="white"
              />{" "}
              {/* Left leg */}
              <rect
                x="85"
                y="360"
                width="10"
                height="40"
                rx="5"
                fill="white"
              />{" "}
              {/* Right leg */}
              <rect
                x="105"
                y="325"
                width="15"
                height="25"
                rx="2"
                fill="white"
              />{" "}
              {/* Phone */}
              {/* Person 2 - Sitting on document */}
              <circle cx="450" cy="150" r="20" fill="white" /> {/* Head */}
              <rect
                x="440"
                y="170"
                width="20"
                height="50"
                rx="10"
                fill="white"
              />{" "}
              {/* Body */}
              <rect
                x="400"
                y="180"
                width="10"
                height="40"
                rx="5"
                fill="white"
                transform="rotate(-45 400 180)"
              />{" "}
              {/* Left arm */}
              <rect
                x="455"
                y="175"
                width="10"
                height="40"
                rx="5"
                fill="white"
                transform="rotate(25 455 175)"
              />{" "}
              {/* Right arm */}
              <rect
                x="425"
                y="220"
                width="10"
                height="40"
                rx="5"
                fill="white"
                transform="rotate(90 425 220)"
              />{" "}
              {/* Left leg */}
              <rect
                x="425"
                y="240"
                width="10"
                height="40"
                rx="5"
                fill="white"
                transform="rotate(45 425 240)"
              />{" "}
              {/* Right leg */}
              <rect
                x="490"
                y="170"
                width="30"
                height="20"
                rx="2"
                fill="white"
              />{" "}
              {/* Laptop */}
              {/* Decorative elements */}
              <path
                d="M520,350 Q530,300 560,340 Q580,360 550,380 Z"
                fill="white"
                opacity="0.5"
              />
              <path
                d="M50,100 Q70,50 90,80 Q110,100 80,120 Z"
                fill="white"
                opacity="0.5"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLoginPage;
