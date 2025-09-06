import axios from "axios";
import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = sessionStorage.getItem("token");
      const userId = sessionStorage.getItem("userId");
      // const username = localStorage.getItem("username");

      if (token && userId) {
        try {
          // Obtener datos del usuario actual
          const response = await axios.get(`/api/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const { data } = response;

          setUser(data);
          setRoles(data.roles);
        } catch (error) {
          const originalRequest = error.config;
          let { StatusCode, Message } = error.response.data;
          if (StatusCode === 401) {
            // Token expirado o no autorizado (excepto login)
            if (!originalRequest.url.includes("/api/auth/login")) {
              Message =
                "Tu sesión ha expirado. Por favor inicia sesión nuevamente.";
              logout();
            }
          }
          toast.error(Message);
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("userId");
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await axios.post("/api/auth/login", credentials);

      const { token, user } = response.data;

      sessionStorage.setItem("token", token);
      sessionStorage.setItem("userId", user.id);

      setUser(user);
      setRoles(user.roles);

      return response.data;
    } catch (error) {
      throw error.response?.data;
    }
  };

  const logout = async () => {
    setLoading(true);
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("selectedPeriod");
    sessionStorage.removeItem("selectedSubject");
    sessionStorage.removeItem("selectedGroup");
    setUser(null);
    setRoles([]);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, roles, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
