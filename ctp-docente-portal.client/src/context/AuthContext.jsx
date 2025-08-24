// src/context/AuthContext.jsx
import { createContext, useContext } from "react";

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.error("Error creating auth context");
  }
  return context;
};
