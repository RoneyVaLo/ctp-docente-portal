import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Alert, AlertDescription } from "../components/ui/Alert";
import { Label } from "../components/ui/Label";
import Input from "../components/ui/Input";
import DarkModeToggle from "../components/DarkModeToggle";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loginRequest, setLoginRequest] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState([]);
  const [showPassword, setShowPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEnterKeyEvent = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  const validateEmail = (value) => {
    if (!value) return "El correo es obligatorio";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "El correo no es válido";
    }

    return null;
  };

  const validatePassword = (value) => {
    if (!value) return "La contraseña es obligatoria";

    // TODO: Ajustar al estandar usado en el sistema de Matricula
    // Reglas: mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número y un símbolo
    // const passwordRegex =
    //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]{8,}$/;

    // if (!passwordRegex.test(value)) {
    //   return "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo";
    // }

    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginRequest((prev) => ({
      ...prev,
      [name]: value,
    }));

    let message = "";

    if (name === "email") {
      message = validateEmail(value) || "";
    } else if (name === "password") {
      message = validatePassword(value) || "";
    }

    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      [name]: message,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const emailError = validateEmail(loginRequest.email);
      const passwordError = validatePassword(loginRequest.password);
      if (emailError || passwordError) {
        setError(emailError || passwordError);
        return;
      }
      await login(loginRequest);
      navigate("/");
    } catch (error) {
      setError(error?.Message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center p-4 bg-background dark:bg-background-dark bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] text-foreground dark:text-foreground-dark">
      {/* <section className="relative min-h-screen flex items-center justify-center p-4 bg-background dark:bg-background-dark text-foreground dark:text-foreground-dark bg-gradient-to-br from-surface to-background dark:from-surface-dark dark:to-background-dark"> */}
      <header className="absolute w-full h-16 shadow-md bg-gray-50 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 dark:text-white flex items-center justify-end px-4 top-0 z-50">
        <DarkModeToggle />
      </header>
      <Card className="w-full max-w-md z-0">
        <CardHeader className="space-y-1 text-center">
          <article className="flex justify-center mb-2">
            <img
              src="/ctp.avif"
              alt="Logo del CTP de Los Chiles"
              className="max-h-10 max-w-10"
            />
          </article>
          <CardTitle className="text-2xl font-bold">
            Administración Docente
          </CardTitle>
          <CardDescription>
            Ingrese sus credenciales institucionales para acceder al sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <section className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Correo electronico"
                  className="pl-10"
                  value={loginRequest.email}
                  onChange={handleChange}
                  onKeyDown={handleEnterKeyEvent}
                />
                {fieldErrors.email && (
                  <p className="text-red-600 dark:text-red-400 text-sm transition-colors">
                    {fieldErrors.email}
                  </p>
                )}
              </div>
            </section>
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  className="pl-10"
                  value={loginRequest.password}
                  onChange={handleChange}
                  onKeyDown={handleEnterKeyEvent}
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setShowPassword(!showPassword);
                  }}
                  className="w-5 h-fit absolute right-3 top-2"
                >
                  {showPassword ? (
                    <EyeOff className="text-gray-600" />
                  ) : (
                    <Eye className="text-gray-600" />
                  )}
                </button>
                {fieldErrors.password && (
                  <p className="text-red-600 dark:text-red-400 text-sm transition-colors">
                    {fieldErrors.password}
                  </p>
                )}
              </div>
            </section>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Verificando..." : "Iniciar sesión"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500 dark:text-gray-300">
            Para soporte técnico, contacte al departamento de TI
          </p>
        </CardFooter>
      </Card>
    </section>
  );
};

export default Login;
