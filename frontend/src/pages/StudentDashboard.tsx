import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const StudentDashboard = () => {
  const { user, logout, accessToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!accessToken) {
      navigate("/student-login");
    }
  }, [accessToken, navigate]);

  if (!accessToken) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">
              Student Dashboard
            </h1>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-lg font-medium text-gray-800 mb-2">
              Welcome, {user?.name}
            </h2>
            <p className="text-gray-600">Roll Number: {user?.roll_number}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
