import { useEffect, useState } from "react";
import Button from "../components/ui/Button";
import { Download, FileText, Filter, Search, Sheet } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/Table";
import { Badge } from "../components/ui/Badge";
import { NavLink } from "react-router-dom";
import FilterSelect from "../components/evaluations/FilterSelect";
import Loader1 from "../components/loaders/Loader1";
import axios from "axios";
import toast from "react-hot-toast";
import { useDownloadPdf } from "../hooks/useDownloadPdf";
import DropdownMenu from "../components/ui/DropdownMenu";
import { useDownloadCsv } from "../hooks/useDownloadCsv";

const Students = () => {
  const { downloadPdf } = useDownloadPdf();
  const { downloadCsv } = useDownloadCsv();

  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(
    sessionStorage.getItem("periodStudents") || ""
  );
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(
    sessionStorage.getItem("groupStudents") || ""
  );

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(
    sessionStorage.getItem("subjectStudents") || ""
  );

  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPeriods = async () => {
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
        toast.error(error?.response?.data?.Message);
      } finally {
        setLoading(false);
      }
    };

    fetchPeriods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchSectionsData = async () => {
      if (selectedPeriod !== "") {
        try {
          setLoading(true);
          setSections([]);
          if (
            !sessionStorage.getItem("groupStudents") ||
            selectedPeriod !== sessionStorage.getItem("periodStudents")
          ) {
            setSelectedSection("");
            sessionStorage.removeItem("groupStudents");
            setSelectedSubject("");
            sessionStorage.removeItem("subjectStudents");
            setFilteredStudents([]);
          }
          setSubjects([]);
          const token = sessionStorage.getItem("token");
          const response = await axios.get(
            `api/section/period/${selectedPeriod}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const sortedSections = response.data.sort((a, b) => a.id - b.id);
          setSections(sortedSections);
        } catch (error) {
          toast.error(error?.response?.data?.Message);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchSectionsData();
  }, [selectedPeriod]);

  useEffect(() => {
    const fetchSubjectsData = async () => {
      if (selectedSection !== "") {
        try {
          setLoading(true);

          if (
            !sessionStorage.getItem("subjectStudents") ||
            selectedPeriod !== sessionStorage.getItem("periodStudents") ||
            selectedSection !== sessionStorage.getItem("groupStudents")
          ) {
            setSelectedSubject("");
            sessionStorage.removeItem("subjectStudents");
            setFilteredStudents([]);
          }
          const token = sessionStorage.getItem("token");
          const response = await axios.get(
            `api/subject/period/${selectedPeriod}/section/${selectedSection}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          setSubjects(response.data);
        } catch (error) {
          toast.error(error?.response?.data?.Message);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchSubjectsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSection]);

  useEffect(() => {
    if (
      selectedPeriod !== sessionStorage.getItem("periodStudents") ||
      selectedSection !== sessionStorage.getItem("groupStudents") ||
      selectedSubject !== sessionStorage.getItem("subjectStudents")
    ) {
      setFilteredStudents([]);
    }
  }, [selectedPeriod, selectedSection, selectedSubject]);

  const resetFilters = async () => {
    setLoading(true);
    setSelectedPeriod("");
    setSelectedSection("");
    setSelectedSubject("");
    sessionStorage.removeItem("periodStudents");
    sessionStorage.removeItem("groupStudents");
    sessionStorage.removeItem("subjectStudents");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const applyFilters = async () => {
    try {
      if (selectedPeriod !== "") {
        if (selectedSection !== "") {
          if (selectedSubject !== "") {
            setLoading(true);
            const reportFilter = {
              academicPeriodId: parseInt(selectedPeriod),
              sectionId: parseInt(selectedSection),
              subjectId: parseInt(selectedSubject),
            };

            const token = sessionStorage.getItem("token");
            const response = await axios.post("api/students", reportFilter, {
              headers: { Authorization: `Bearer ${token}` },
            });

            sessionStorage.setItem("periodStudents", selectedPeriod);
            sessionStorage.setItem("groupStudents", selectedSection);
            sessionStorage.setItem("subjectStudents", selectedSubject);

            setFilteredStudents(response.data);
          } else {
            toast.error("Debe seleccionar una Materia.");
          }
        } else {
          toast.error("Debe seleccionar una Sección.");
        }
      } else {
        toast.error("Debe seleccionar un Periodo Académico.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.Message);
    } finally {
      setLoading(false);
    }
  };

  // Estadísticas
  const totalStudents = filteredStudents.length || 0;

  const averageAttendance =
    filteredStudents.reduce((sum, est) => sum + est.attendance, 0) /
      filteredStudents.length || 0;

  const averageGrades =
    filteredStudents.reduce((sum, est) => sum + est.average, 0) /
      filteredStudents.length || 0;

  const excellentStudents =
    filteredStudents.filter((est) => est.status?.name === "Excelente").length ||
    0;

  const studentsNeedSupport =
    filteredStudents.filter((est) => est.status?.name === "Necesita apoyo")
      .length || 0;

  const studentsBySubjectReport = async () => {
    try {
      if (
        sessionStorage.getItem("periodStudents") &&
        sessionStorage.getItem("groupStudents") &&
        sessionStorage.getItem("subjectStudents")
      ) {
        setLoading(true);
        const reportFilter = {
          academicPeriodId: parseInt(selectedPeriod),
          sectionId: parseInt(selectedSection),
          subjectId: parseInt(selectedSubject),
        };
        const section = [...sections].filter(
          (sec) => sec.id === parseInt(selectedSection)
        );

        await downloadPdf(
          "/api/pdfreport/estudiantes-por-materia",
          reportFilter,
          `EstudiantesPorMateria_${section[0].name}.pdf`
        );
      } else {
        toast.error(
          "Seleccione un Periodo Académico, Sección, Materia y Aplique los filtros."
        );
      }
    } catch (error) {
      toast.error(error?.response?.data?.Message);
    } finally {
      setLoading(false);
    }
  };

  const studentsCsvReport = async () => {
    try {
      if (
        sessionStorage.getItem("periodStudents") &&
        sessionStorage.getItem("groupStudents") &&
        sessionStorage.getItem("subjectStudents")
      ) {
        setLoading(true);
        const reportFilter = {
          academicPeriodId: parseInt(selectedPeriod),
          sectionId: parseInt(selectedSection),
          subjectId: parseInt(selectedSubject),
        };
        const section = [...sections].filter(
          (sec) => sec.id === parseInt(selectedSection)
        );

        await downloadCsv(
          "/api/csvreport/students",
          reportFilter,
          `${section[0].name}.csv`
        );
      } else {
        toast.error(
          "Seleccione un Periodo Académico, Sección, Materia y Aplique los filtros."
        );
      }
    } catch (error) {
      toast.error(error?.response?.data?.Message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader1 />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Estudiantes</h1>
      </div>

      <div className="space-y-6">
        <Card className="relative z-10">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Filtre la lista de estudiantes</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
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

              <FilterSelect
                label="Materia"
                value={selectedSubject}
                onChange={setSelectedSubject}
                options={subjects}
                placeholder="Seleccionar materia"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-between mt-4">
              <Button variant="outline" size="sm" onClick={applyFilters}>
                <Filter className="mr-2 h-4 w-4" />
                Aplicar filtros
              </Button>
              <Button onClick={resetFilters}>
                <Filter className="mr-2 h-4 w-4" />
                Restablecer Filtros
              </Button>

              <DropdownMenu>
                <DropdownMenu.Trigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Descargar Datos
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  <DropdownMenu.Item
                    onClick={studentsBySubjectReport}
                    className="font-bold"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Exportar PDF
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator />
                  <DropdownMenu.Item
                    onClick={studentsCsvReport}
                    className="font-bold"
                  >
                    <Sheet className="mr-2 h-4 w-4" />
                    Exportar CSV
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total de estudiantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                Estudiantes activos en el sistema
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Asistencia promedio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(averageAttendance)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Promedio general de asistencia
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Calificación promedio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(averageGrades)}
              </div>
              <p className="text-xs text-muted-foreground">
                Promedio general de calificaciones
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-center">
                Rendimiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between flex-col">
                <div>
                  <div className="text-xl font-bold text-green-600">
                    {excellentStudents}
                  </div>
                  <p className="text-xs text-muted-foreground">Excelente</p>
                </div>
                <div>
                  <div className="text-xl font-bold text-red-600">
                    {studentsNeedSupport}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Necesitan apoyo
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="space-y-2">
            <CardTitle>Lista de estudiantes</CardTitle>
            <CardDescription>
              Mostrando {filteredStudents.length} estudiantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto w-48 sm:w-56 lg:w-full mx-auto lg:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Identificación</TableHead>
                    {/* <TableHead>Grupo</TableHead> */}
                    <TableHead>Promedio</TableHead>
                    <TableHead className="text-center">Asistencia</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.name}
                        </TableCell>
                        <TableCell className="text-center">
                          {student.identification}
                        </TableCell>
                        {/* <TableCell>{student.group.name}</TableCell> */}
                        <TableCell className="text-center">
                          <span
                            className={`font-bold ${
                              student.average >= 90
                                ? "text-green-600 dark:text-green-400"
                                : student.average >= 80
                                ? "text-blue-600 dark:text-blue-400"
                                : student.average >= 70
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {Math.round(student.average) || 0}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  student.attendance >= 90
                                    ? "bg-green-500"
                                    : student.attendance >= 80
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                                }`}
                                style={{ width: `${student.attendance}%` }}
                              ></div>
                            </div>
                            <span className="text-xs">
                              {student.attendance}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              student?.status?.name === "Excelente"
                                ? "bg-green-300 dark:bg-green-500 text-green-800 text-center"
                                : student?.status?.name === "Bueno"
                                ? "bg-blue-300 dark:bg-blue-500 text-blue-800 text-center"
                                : student?.status?.name === "Regular"
                                ? "bg-amber-300 dark:bg-amber-500 text-amber-800 text-center"
                                : "bg-red-300 dark:bg-red-500 text-red-800 text-center"
                            }
                          >
                            {student?.status?.name || "-"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <NavLink to={`/estudiantes/${student.id}`}>
                            <Button size="sm" variant="outline">
                              Detalles
                            </Button>
                          </NavLink>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell className="w-full" colSpan={6}>
                        <div className="pt-4 w-full flex items-center justify-center text-lg text-center font-bold">
                          No hay Datos que Mostrar
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Students;
