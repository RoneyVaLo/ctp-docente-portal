import { useState } from "react";
import Button from "../components/ui/Button";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { BookOpen, Eye, EyeClosed, Lock, User } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/Alert";
import { Label } from "../components/ui/Label";
import Input from "../components/ui/Input";
import DarkModeToggle from "../components/DarkModeToggle";

const Login = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulación de login - en producción, esto se conectaría con la DB institucional
    try {
      // Aquí iría la lógica real de autenticación contra la DB institucional
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (username === "docente" && password === "password") {
        navigate("/");
      } else {
        setError("Credenciales incorrectas. Intente nuevamente.");
      }
    } catch (err) {
      console.log(err);
      setError("Error al conectar con el servidor. Intente más tarde.");
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
          <div className="flex justify-center mb-2">
            <img
              src="/ctp.avif"
              alt="Logo del CTP de Los Chiles"
              className="max-h-10 max-w-10"
            />
          </div>
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
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  id="username"
                  placeholder="Nombre de usuario"
                  className="pl-10"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setShowPassword(!showPassword);
                  }}
                  className="w-5 h-fit absolute right-3 top-2"
                >
                  {showPassword ? (
                    <Eye className="text-gray-600" />
                  ) : (
                    <EyeClosed className="text-gray-600" />
                  )}
                </button>
              </div>
            </div>
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
