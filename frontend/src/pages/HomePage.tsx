import { useNavigate } from "react-router-dom";
import { User2, Building2, UsersRound } from "lucide-react";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full relative">
      {/* 📸 Background Image */}
      <div className="absolute inset-0 -z-10">
        <img
          src="/src/components/ui/assets/tuadmin.jpg"
          alt="Graduation Background"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      </div>

      {/* 🏛️ Top Content */}
      <div className="flex flex-col items-center justify-center px-4 pt-24 sm:pt-32 text-center text-white">
        <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm border border-white/30 mb-4">
          <img
            src="/src/components/ui/assets/Telangana_University_logo.png"
            alt="Telangana University Logo"
            className="h-16 w-auto"
          />
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold drop-shadow-md">
          Telangana University
        </h1>
        <p className="text-lg sm:text-2xl text-white/90 mb-10 mt-2 drop-shadow-sm">
          Student Service Portal
        </p>

        {/* 🧊 Glass Card */}
        <div className="bg-white/10 border border-white/30 rounded-2xl p-8 w-full max-w-md backdrop-blur-lg shadow-lg">
          <div className="flex justify-center mb-6">
            <UsersRound size={40} strokeWidth={2.5} className="text-white" />
          </div>

          {/* <h2 className="text-xl sm:text-2xl font-semibold text-white mb-8">
            Welcome to the Self Service Portal
          </h2> */}

          <div className="space-y-4">
            <button
              onClick={() => navigate("/student-login")}
              className="flex items-center justify-center space-x-3 bg-white/90 hover:bg-white text-gray-900 font-semibold py-3 rounded-xl w-full transition"
            >
              <User2 size={22} strokeWidth={2.5} />
              <span>Student Login</span>
            </button>

            <button
              onClick={() => navigate("/staff-login")}
              className="flex items-center justify-center space-x-3 bg-white/90 hover:bg-white text-gray-900 font-semibold py-3 rounded-xl w-full transition"
            >
              <Building2 size={22} strokeWidth={2.5} />
              <span>Staff Login</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
