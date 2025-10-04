import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicRoute = () => {
  const { user } = useAuth();

  return !user ? <Outlet /> : <Navigate to="/" replace />;
};

export default PublicRoute;
