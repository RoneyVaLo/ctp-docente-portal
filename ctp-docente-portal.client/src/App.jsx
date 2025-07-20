import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Calificaciones from "./pages/Evaluations";
import Reportes from "./pages/Reports";
import Notificaciones from "./pages/Notifications";
import Estudiantes from "./pages/Students";
import Configuracion from "./pages/Configuration";
import AttendancePage from "./pages/Attendance/AttendancePage";

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
          element: <Calificaciones />,
        },
        {
          path: "asistencia",
         element: <AttendancePage />
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

  return <RouterProvider router={router} />;
}

export default App;
