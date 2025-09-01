// src/App.jsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Calificaciones from "./pages/Evaluations";
import Reportes from "./pages/Reports";
import Notificaciones from "./pages/Notifications";
import Estudiantes from "./pages/Students";
import Configuracion from "./pages/Configuration";
import EvaluationItemForm from "./pages/EvaluationItemForm";
import GradeEvaluationItem from "./pages/GradeEvaluationItem";
import { EvaluationProvider } from "./context/EvaluationContext";
import { Toaster } from "react-hot-toast";
import NotFound from "./pages/NotFound";
import { useAuth } from "./context/AuthContext";
import Loader1 from "./components/loaders/Loader1";
import PublicRoute from "./routes/PublicRoute";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";
import AccessDenied from "./pages/AccessDenied";
import AttendancePage from "./pages/Attendance/AttendancePage";

function App() {
  const { loading } = useAuth();

  const router = createBrowserRouter([
    {
      path: "/login",
      element: <PublicRoute />,
      errorElement: <NotFound />,
      children: [
        {
          path: "/login",
          element: <Login />,
        },
      ],
    },
    {
      path: "/",
      element: <ProtectedRoute />,
      errorElement: <NotFound />,
      children: [
        {
          path: "/",
          element: <Layout />,
          errorElement: <NotFound />,
          children: [
            {
              path: "/",
              element: <Dashboard />,
            },
            {
              element: <RoleRoute listRoles={["Docente"]} />,
              children: [
                {
                  path: "calificaciones",
                  element: (
                    <EvaluationProvider>
                      <Calificaciones />
                    </EvaluationProvider>
                  ),
                },
                {
                  path: "item/nuevo",
                  element: (
                    <EvaluationProvider>
                      <EvaluationItemForm />
                    </EvaluationProvider>
                  ),
                },
                {
                  path: "item/:itemId/editar",
                  element: (
                    <EvaluationProvider>
                      <EvaluationItemForm />
                    </EvaluationProvider>
                  ),
                },
                {
                  path: "item/:itemId/calificar/:studentId?",
                  element: (
                    <EvaluationProvider>
                      <GradeEvaluationItem />
                    </EvaluationProvider>
                  ),
                },
                {
                  path: "asistencia",
                  element: <AttendancePage />,
                },
              ],
            },
            {
              path: "reportes",
              element: <Reportes />,
            },
            {
              element: <RoleRoute listRoles={["Administrativo"]} />,
              children: [
                {
                  path: "configuracion",
                  element: <Configuracion />,
                },
              ],
            },
            {
              path: "notificaciones",
              element: <Notificaciones />,
            },
            {
              path: "estudiantes",
              element: <Estudiantes />,
            },
          ],
        },
      ],
    },
    {
      path: "/acceso-denegado",
      element: <AccessDenied />,
    },
  ]);

  if (loading) return <Loader1 />;

  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        toastOptions={{
          style: {
            textAlign: "center",
          },
        }}
      />
    </>
  );
}

export default App;
