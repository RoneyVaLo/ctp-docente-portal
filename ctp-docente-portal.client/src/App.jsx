import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Calificaciones from "./pages/Evaluations";
import Asistencia from "./pages/Attendance";
import Reportes from "./pages/Reports";
import Notificaciones from "./pages/Notifications";
import Estudiantes from "./pages/Students";
import Configuracion from "./pages/Configuration";
import EvaluationItemForm from "./pages/EvaluationItemForm";
import GradeEvaluationItem from "./pages/GradeEvaluationItem";
import { EvaluationProvider } from "./context/EvaluationContext";
import { Toaster } from "react-hot-toast";

function App() {
  const router = createBrowserRouter([
    {
      path: "/login",
      element: <Login />,
      errorElement: <div>Not Found 404</div>,
    },
    {
      path: "/",
      element: <Layout />,
      errorElement: <div>Not Found 404</div>,
      children: [
        {
          path: "/",
          element: <Dashboard />,
        },
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
          element: <Asistencia />,
        },
        {
          path: "reportes",
          element: <Reportes />,
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
          path: "configuracion",
          element: <Configuracion />,
        },
      ],
    },
  ]);

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
