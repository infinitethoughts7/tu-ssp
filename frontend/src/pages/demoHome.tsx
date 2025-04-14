import React, { useState } from "react";

const DemoHome = () => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">DemoHome</h1>
      <div className="w-full max-w-2xl h-96 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100">
        {!imageError ? (
          <img
            src="/src/assets/images/backgroundImage.png"
            alt="Background"
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error("Error loading image. Path:", e.currentTarget.src);
              setImageError(true);
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Image not found
          </div>
        )}
      </div>
      <p className="mt-4 text-gray-600">
        Welcome to the Student Service Portal
      </p>
    </div>
  );
};

export default DemoHome;
