import { useEffect, useState } from "react";
import Button from "../components/ui/Button";
import {
  AlertTriangle,
  Award,
  BarChartIcon,
  BookOpen,
  Calendar,
  Download,
  FileText,
  GraduationCap,
  LineChartIcon,
  PieChartIcon,
  Search,
  SquareKanban,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Label } from "../components/ui/Label";
import Input from "../components/ui/Input";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "../components/ui/Badge";
import { useTheme } from "../context/ThemeContext";
import Loader1 from "../components/loaders/Loader1";
import axios from "axios";
import FilterSelect from "../components/evaluations/FilterSelect";
import toast from "react-hot-toast";
import { useDownloadPdf } from "../hooks/useDownloadPdf";

// Datos de ejemplo
// const statusData = [
//   { name: "Excelente", value: 35, color: "#22c55e" },
//   { name: "Bueno", value: 40, color: "#3b82f6" },
//   { name: "Regular", value: 20, color: "#f59e0b" },
//   { name: "Necesita apoyo", value: 5, color: "#ef4444" },
// ];

const Reports = () => {
  const { darkMode } = useTheme();
  const { downloadPdf } = useDownloadPdf();

  const [loading, setLoading] = useState(false);

  const [gradesData, setGradesData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [groupReportData, setGroupReportData] = useState([]);
  const [stats, setStats] = useState(null);

  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(
    sessionStorage.getItem("periodReports") || ""
  );
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(
    sessionStorage.getItem("groupReports") || ""
  );

  const axisColor = darkMode ? "#ffffff" : "#000000";
  const gridColor = darkMode ? "#ffffff" : "#000000";

  useEffect(() => {
    const fetchPeriodsData = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem("token");
        const response = await axios.get("api/academicperiods", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setPeriods(response.data);

        if (selectedPeriod !== "") {
          applyFilters();
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPeriodsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchSectionsData = async () => {
      if (selectedPeriod !== "") {
        try {
          setLoading(true);
          setSections([]);

          if (
            !sessionStorage.getItem("groupReports") ||
            selectedPeriod !== sessionStorage.getItem("periodReports")
          ) {
            setSelectedSection("");
            sessionStorage.removeItem("groupReports");
          }
          const token = sessionStorage.getItem("token");
          const response = await axios.get(
            `api/section/period/${selectedPeriod}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          setSections(response.data);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchSectionsData();
  }, [selectedPeriod]);

  useEffect(() => {
    if (
      selectedPeriod !== sessionStorage.getItem("periodStudents") ||
      selectedSection !== sessionStorage.getItem("groupStudents")
    ) {
      setGradesData([]);
      setAttendanceData([]);
      setGroupReportData([]);
      setStats(null);
    }
  }, [selectedPeriod, selectedSection]);

  const resetFilters = async () => {
    setLoading(true);
    setSelectedPeriod("");
    setSelectedSection("");
    setGradesData([]);
    setAttendanceData([]);
    setGroupReportData([]);
    setStats(null);
    sessionStorage.removeItem("periodReports");
    sessionStorage.removeItem("groupReports");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const applyFilters = async () => {
    try {
      if (selectedPeriod !== "") {
        if (selectedSection !== "") {
          setLoading(true);

          const reportFilter = {
            academicPeriodId: parseInt(selectedPeriod),
            sectionId: parseInt(selectedSection),
          };

          const token = sessionStorage.getItem("token");
          const [grades, attendance, groupReport, generalStats] =
            await Promise.all([
              axios.post("api/report/grades", reportFilter, {
                headers: { Authorization: `Bearer ${token}` },
              }),
              axios.post("api/report/attendance", reportFilter, {
                headers: { Authorization: `Bearer ${token}` },
              }),
              axios.post("api/report/group-report", reportFilter, {
                headers: { Authorization: `Bearer ${token}` },
              }),
              axios.post("api/report/general-stats", reportFilter, {
                headers: { Authorization: `Bearer ${token}` },
              }),
            ]);

          sessionStorage.setItem("periodReports", selectedPeriod);
          sessionStorage.setItem("groupReports", selectedSection);

          setGradesData(grades.data);
          setAttendanceData(attendance.data);
          setGroupReportData(groupReport.data);
          setStats(generalStats.data);
        } else {
          toast.error("Debe seleccionar una Sección.");
        }
      } else {
        toast.error("Debe seleccionar un Periodo Académico.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const downloadGeneralReport = async () => {
    try {
      if (
        sessionStorage.getItem("periodReports") &&
        sessionStorage.getItem("groupReports")
      ) {
        setLoading(true);
        const reportFilter = {
          academicPeriodId: parseInt(selectedPeriod),
          sectionId: parseInt(selectedSection),
        };
        const section = [...sections].filter(
          (sec) => sec.id === parseInt(selectedSection)
        );

        await downloadPdf(
          "/api/pdfreport/rendimiento-general",
          reportFilter,
          `RendimientoGeneral_${section[0].name}.pdf`
        );
      } else {
        toast.error(
          "Seleccione un Periodo Académico, una Sección y Aplique los Filtros."
        );
      }
    } catch (error) {
      console.log(error);
      console.log(error?.response?.data?.Message);
    } finally {
      setLoading(false);
    }
  };

  const downloadAttendanceReport = async () => {
    try {
      if (
        sessionStorage.getItem("periodReports") &&
        sessionStorage.getItem("groupReports")
      ) {
        setLoading(true);
        const reportFilter = {
          academicPeriodId: parseInt(selectedPeriod),
          sectionId: parseInt(selectedSection),
        };
        const section = [...sections].filter(
          (sec) => sec.id === parseInt(selectedSection)
        );

        await downloadPdf(
          "/api/pdfreport/asistencia-por-mes",
          reportFilter,
          `ReporteGeneralAsistencia_${section[0].name}.pdf`
        );
      } else {
        toast.error(
          "Seleccione un Periodo Académico, una Sección y Aplique los Filtros."
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader1 />;

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-surface-dark dark:text-surface inline-flex gap-2">
              <SquareKanban className="w-10  h-10 rotate-180" />
              <span>Reportes Académicos</span>
            </h1>
            <p className="text-surface-dark dark:text-surface mt-1">
              Análisis completo del rendimiento académico y asistencia
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={downloadGeneralReport}>
              <FileText className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>

        {/* Filtros globales */}
        <Card className="relative z-10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Filtros de Control
            </CardTitle>
            <CardDescription>
              Configura los parámetros para generar reportes específicos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FilterSelect
                label="Periodo Académico"
                value={selectedPeriod}
                onChange={setSelectedPeriod}
                options={periods}
                placeholder="Seleccionar periodo"
              />

              <FilterSelect
                label="Sección"
                value={selectedSection}
                onChange={setSelectedSection}
                options={sections}
                placeholder="Seleccionar sección"
              />
            </div>

            <div className="flex gap-2 mt-4">
              <Button onClick={applyFilters}>Aplicar Filtros</Button>
              <Button variant="outline" onClick={resetFilters}>
                Restablecer Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas generales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent>
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-medium text-surface-dark dark:text-surface">
                    Promedio General
                  </p>
                  <p className="text-2xl font-bold text-surface-dark dark:text-surface">
                    {stats?.generalAverage
                      ? Math.round(Number(stats?.generalAverage))
                      : 0}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-xs text-surface-dark dark:text-surface mt-2">
                Rendimiento global en el periodo actual
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-medium text-surface-dark dark:text-surface">
                    Asistencia Promedio
                  </p>
                  <p className="text-2xl font-bold text-surface-dark dark:text-surface">
                    {stats?.averageAttendance
                      ? Math.round(Number(stats?.averageAttendance))
                      : 0}
                    %
                  </p>
                </div>
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-xs text-surface-dark dark:text-surface mt-2">
                Nivel de compromiso y constancia
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-medium text-surface-dark dark:text-surface">
                    Estudiantes Destacados
                  </p>
                  <p className="text-2xl font-bold text-surface-dark dark:text-surface">
                    {stats?.topStudentsCount || 0}
                  </p>
                </div>
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
              <p className="text-xs text-surface-dark dark:text-surface mt-2">
                ≥90 puntos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-medium text-surface-dark dark:text-surface">
                    Estudiantes en Riesgo
                  </p>
                  <p className="text-2xl font-bold text-surface-dark dark:text-surface">
                    {stats?.atRiskStudentsCount || 0}
                  </p>
                </div>
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <p className="text-xs text-surface-dark dark:text-surface mt-2">
                &lt;70 puntos o baja asistencia
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos interactivos */}
        <div className="grid grid-cols-1 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="inline-flex gap-2 items-center">
                <BarChartIcon className="w-8 h-8" />
                <span>Promedio de Calificaciones por Materia</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {gradesData.length > 0 ? (
                <div className="w-full" style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={gradesData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={gridColor}
                        className="opacity-30"
                      />
                      <XAxis
                        dataKey="subject"
                        tick={{ fill: axisColor, fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fill: axisColor, fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: darkMode ? "#0f172a" : "#f8fafc",
                          border: `1px solid ${
                            darkMode ? "#f8fafc" : "#0f172a"
                          }`,
                          borderRadius: "6px",
                          color: darkMode ? "#ffffff" : "#000000",
                        }}
                        formatter={(value) => [
                          Number.isInteger(value) ? value : value.toFixed(2),
                          "Promedio",
                        ]}
                      />
                      <Bar
                        dataKey="average"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="w-full h-[300px] flex items-center justify-center text-2xl text-center font-bold">
                  No hay Datos que Mostrar
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="inline-flex gap-2 items-center justify-center">
              <LineChartIcon className="w-6 h-6" />
              <span>Evolución de la Asistencia</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attendanceData.length > 0 ? (
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={attendanceData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="opacity-30"
                      stroke={gridColor}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: axisColor, fontSize: 12 }}
                    />
                    <YAxis
                      tick={{ fill: axisColor, fontSize: 12 }}
                      domain={[80, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                      formatter={(value) => [
                        `${
                          Number.isInteger(value) ? value : value.toFixed(2)
                        }%`,
                        "Asistencia",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="attendance"
                      stroke="#22c55e"
                      strokeWidth={3}
                      dot={{ fill: "#22c55e", strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, stroke: "#22c55e", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="w-full h-[300px] flex items-center justify-center text-2xl text-center font-bold">
                No hay Datos que Mostrar
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabla consolidada */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle>Reporte Consolidado por Grupo y Materia</CardTitle>
              <CardDescription>
                Análisis detallado del rendimiento por grupo académico
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadGeneralReport}
              >
                <FileText className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto w-48 sm:w-56 lg:w-full mx-auto lg:mx-0">
              {/* TODO: Refactorizar, usar el componente Table */}
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-center p-3 font-medium">Sección</th>
                    <th className="text-center p-3 font-medium">Materia</th>
                    <th className="text-center p-3 font-medium">Promedio</th>
                    <th className="text-center p-3 font-medium">
                      Asistencia Promedio
                    </th>
                    <th className="text-center p-3 font-medium">
                      Estudiantes en Riesgo
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {groupReportData.length > 0 ? (
                    groupReportData.map((row, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="p-3 text-center">{row.section}</td>
                        <td className="p-3 text-center">{row.subject}</td>
                        <td className="p-3 font-medium text-center">
                          {Math.round(row.average)}
                        </td>
                        <td className="p-3 text-center">
                          {Number.isInteger(row.attendancePercentage)
                            ? Math.round(row.attendancePercentage)
                            : Number(row.attendancePercentage).toFixed(2)}
                          %
                        </td>
                        <td className="p-3 text-center">
                          <Badge
                            variant={
                              row.studentsAtRisk > 2
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {row.studentsAtRisk}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="w-full text-center">
                      <td colSpan={5}>
                        <div className="pt-4 w-full flex items-center justify-center text-lg text-center font-bold">
                          No hay Datos que Mostrar
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Exportaciones globales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Exportaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="outline" onClick={downloadGeneralReport}>
                <FileText className="w-4 h-4 mr-2" />
                Exportar Todo
              </Button>
              <Button variant="outline" onClick={downloadAttendanceReport}>
                <Calendar className="w-4 h-4 mr-2" />
                Solo Asistencia
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
