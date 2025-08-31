import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/Card";
import {
  Bell,
  Check,
  GraduationCap,
  User,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import Button from "../ui/Button";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";

const AdminDashboard = ({ adminStats }) => {
  const navigate = useNavigate();

  const { administrativeSummary, topSectionAbsences, gradeDistribution } =
    adminStats;

  const {
    totalActiveStudents,
    totalPresentToday,
    totalPossibleToday,
    totalAbsentToday,
    totalControlsToday,
    totalTeachersWithSections,
  } = administrativeSummary;

  const { darkMode } = useTheme();

  const axisColor = darkMode ? "#ffffff" : "#000000";
  const gridColor = darkMode ? "#ffffff" : "#000000";

  const calculateAttendancePercentage = () => {
    return Number((totalPresentToday * 100) / totalPossibleToday) || 0;
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Estudiantes Activos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold">{totalActiveStudents || 0}</div>
            <p className="text-xs text-muted-foreground">
              En el presente curso lectivo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Asistencia Hoy
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {calculateAttendancePercentage()}%
            </div>
            <p className="text-xs text-muted-foreground">
              {totalPresentToday} de {totalPossibleToday} estudiantes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ausencias Hoy</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {totalAbsentToday}
            </div>
            <p className="text-xs text-muted-foreground">
              De {totalControlsToday} controles de asistencia registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Docentes Activos
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold">
              {totalTeachersWithSections}
            </div>
            <p className="text-xs text-muted-foreground">
              Con asignaciones activas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Secciones con Mayor Ausentismo</CardTitle>
            <CardDescription>
              Ranking de secciones con más ausencias hoy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topSectionAbsences?.length > 0 ? (
                topSectionAbsences.map((section, index) => (
                  <div
                    key={section.section}
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:scale-105 transition-transform"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium">
                          Sección {section.section} - {section.subject}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {section.absent} ausentes de {section.total}{" "}
                          estudiantes
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-red-600">
                        {section.percentage}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        ausentismo
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-gray-800 dark:text-gray-300 font-bold my-10">
                    No hay datos que mostrar...
                  </p>
                  <Check className="w-16 h-16 text-green-500" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución de Calificaciones</CardTitle>
            <CardDescription>Rendimiento académico general</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={gradeDistribution}
                margin={{ top: 20, right: 20, left: -12, bottom: -10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="range"
                  tick={{ fill: axisColor, fontSize: 12 }}
                  tickFormatter={(range) => {
                    const match = range.match(/\((.*?)\)/);
                    return match ? match[1] : range; // Solo lo que está dentro de paréntesis
                  }}
                />
                <YAxis tick={{ fill: axisColor, fontSize: 14 }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white/80 backdrop-blur-lg border border-gray-300 text-black rounded-md p-2 shadow-md">
                          <p className="text-sm font-semibold text-center">
                            {label}
                          </p>
                          <p className="text-base font-bold text-center">
                            {payload[0].value}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count">
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Accesos Rápidos Administrativos</CardTitle>
          <CardDescription>Gestión y reportes del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button
              className="h-20 flex-col gap-2"
              variant="outline"
              onClick={() => navigate("reportes")}
            >
              <Users className="h-6 w-6" />
              Generar Reporte Grupal
            </Button>
            <Button
              className="h-20 flex-col gap-2"
              variant="outline"
              onClick={() => navigate("estudiantes")}
            >
              <User className="h-6 w-6" />
              Reporte Individual
            </Button>
            <Button
              className="h-20 flex-col gap-2"
              variant="outline"
              onClick={() => navigate("notificaciones")}
            >
              <Bell className="h-6 w-6" />
              Enviar Notificaciones
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
