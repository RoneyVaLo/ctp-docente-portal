import React from "react";
import Button from "../components/ui/Button";
import { LogIn } from "lucide-react";
import { NavLink } from "react-router-dom";

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-4">Login</h1>
        <p className="text-center text-gray-600">
          Iniciar sesión en EduGestión
        </p>
        <div className="mt-6 w-full p-2 flex justify-center">
          <NavLink to="/dashboard" className="bg-blue-900 text-white rounded px-4 py-2 hover:bg-blue-800 transition-colors">
            Iniciar Sesión
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Login;
