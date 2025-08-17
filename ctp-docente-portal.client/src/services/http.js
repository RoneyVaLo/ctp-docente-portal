import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL ?? "https://localhost:5001";
console.log("[http] baseURL =", baseURL);

const api = axios.create({
  baseURL,
  // Si NO usas cookies/sesión, déjalo en false. Si usas cookies, póngalo en true y permite credenciales en CORS.
  withCredentials: false,
});

api.interceptors.response.use(
  (resp) => resp,
  (error) => {
    // Mensaje de error útil para mostrar en pantalla y ver en consola
    const { response } = error;
    if (response) {
      const msg = `[${response.status}] ${response.statusText} ${JSON.stringify(response.data)}`;
      console.error("[http] Error:", msg);
      return Promise.reject(new Error(msg));
    }
    console.error("[http] Network error:", error.message);
    return Promise.reject(new Error(error.message));
  }
);

export default api;
