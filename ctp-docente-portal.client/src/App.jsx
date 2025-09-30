import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/Layout";
import { EvaluationProvider } from "./context/EvaluationContext";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthContext";
import Loader1 from "./components/loaders/Loader1";
import PublicRoute from "./routes/PublicRoute";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";

function App() {
  const Login = lazy(() => import("./pages/Login"));
  const Dashboard = lazy(() => import("./pages/Dashboard"));
  const Calificaciones = lazy(() => import("./pages/Evaluations"));
  const Reportes = lazy(() => import("./pages/Reports"));
  const Notificaciones = lazy(() => import("./pages/Notifications"));
  const Estudiantes = lazy(() => import("./pages/Students"));
  const EstudiantesDetalle = lazy(() => import("./pages/StudentDetail"));
  const Configuracion = lazy(() => import("./pages/Configuration"));
  const EvaluationItemForm = lazy(() => import("./pages/EvaluationItemForm"));
  const GradeEvaluationItem = lazy(() => import("./pages/GradeEvaluationItem"));
  const AccessDenied = lazy(() => import("./pages/AccessDenied"));
  const NotFound = lazy(() => import("./pages/NotFound"));
  const AttendancePage = lazy(() =>
    import("./pages/Attendance/AttendancePage")
  );

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
            {
              path: "estudiantes/:id",
              element: <EstudiantesDetalle />,
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
      <Suspense fallback={<Loader1 />}>
        <RouterProvider router={router} />
        <Toaster
          toastOptions={{
            style: {
              textAlign: "center",
            },
          }}
        />
      </Suspense>
    </>
  );
}

export default App;
