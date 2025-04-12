import { useNavigate } from "react-router-dom";
import { UserRound, Building, GraduationCap, Users } from "lucide-react";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* 🎓 Background image */}
      <div className="absolute inset-0 -z-10">
        <img
          src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2000&auto=format&fit=crop"
          alt="Graduation Celebration"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>
      </div>

      {/* 🔝 Content positioned near top */}
      <div className="relative z-10 w-full max-w-md mx-auto px-4 pt-12 flex flex-col items-center">
        {/* University Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-white/20 backdrop-blur-md p-4 rounded-full border border-white/30 shadow-lg">
            <GraduationCap size={42} className="text-white" />
          </div>
        </div>

        {/* Title - One line only */}
        <h1 className="text-4xl sm:text-5xl font-bold text-white text-center whitespace-nowrap">
          Telangana University
        </h1>
        <p className="text-2xl text-white/90 text-center mb-10">
          Student Service Portal
        </p>

        {/* 🧊 Glass Card */}
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/20 w-full">
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/30 backdrop-blur-md p-4 rounded-full shadow-md">
              <Users size={36} className="text-gray-800" />
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-2xl font-bold text-center text-white mb-10 leading-snug">
            Welcome to
            <br />
            the Student Portal
          </h2>

          {/* Buttons */}
          <div className="flex flex-col space-y-5">
            <button
              onClick={() => navigate("/student-login")}
              className="bg-gray-800/90 hover:bg-gray-700 text-white py-3 px-6 rounded-lg shadow-md flex items-center transition duration-200"
            >
              <UserRound size={20} className="text-white mr-3" />
              <span className="text-lg">Student Login</span>
            </button>

            <button
              onClick={() => navigate("/staff-login")}
              className="bg-gray-800/90 hover:bg-gray-700 text-white py-3 px-6 rounded-lg shadow-md flex items-center transition duration-200"
            >
              <Building size={20} className="text-white mr-3" />
              <span className="text-lg">Staff Login</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 