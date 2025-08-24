import { useAuth } from "../context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

const RoleRoute = ({ listRoles }) => {
  const { roles } = useAuth();

  const hasRole = roles?.some((r) => listRoles.includes(r));

  if (!hasRole) {
    return <Navigate to="/acceso-denegado" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
