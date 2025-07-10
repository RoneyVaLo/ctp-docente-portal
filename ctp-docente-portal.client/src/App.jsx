import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Calificaciones from "./pages/Evaluations";
import Asistencia from "./pages/Attendance";
import Reportes from "./pages/Reports";
import Notificaciones from "./pages/Notifications";
import Estudiantes from "./pages/Students";
import Configuracion from "./pages/Configuration";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route
              path="dashboard/calificaciones"
              element={<Calificaciones />}
            />
            <Route path="dashboard/asistencia" element={<Asistencia />} />
            <Route path="dashboard/reportes" element={<Reportes />} />
            <Route
              path="dashboard/notificaciones"
              element={<Notificaciones />}
            />
            <Route path="dashboard/estudiantes" element={<Estudiantes />} />
            <Route path="dashboard/configuracion" element={<Configuracion />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
