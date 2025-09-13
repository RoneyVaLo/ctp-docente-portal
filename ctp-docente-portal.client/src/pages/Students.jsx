import { useEffect, useState } from "react";
import Button from "../components/ui/Button";
import { Download, Filter, Search } from "lucide-react";
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

const states = [
  { id: 0, name: "Todos" },
  { id: 1, name: "Excelente" },
  { id: 2, name: "Bueno" },
  { id: 3, name: "Regular" },
  { id: 4, name: "Necesita apoyo" },
];

const Students = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sectionStudents, setSectionStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem("token");
        const response = await axios.get("api/section", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGroups(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const getStateByAverage = (average) => {
    if (average >= 90) return { id: 1, name: "Excelente" };
    if (average >= 80) return { id: 2, name: "Bueno" };
    if (average >= 70) return { id: 3, name: "Regular" };
    return { id: 4, name: "Necesita apoyo" };
  };

  const applyFilters = async () => {
    let result = [];

    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`/api/students/${selectedGroup}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const studentsWithState = response.data.map((student) => ({
        ...student,
        status: getStateByAverage(student.average),
      }));

      setSectionStudents(studentsWithState);
      result = studentsWithState;

      // Filtrar por estado
      if (selectedStatus !== "" && selectedStatus !== "0") {
        result = sectionStudents.filter(
          (est) => Number(est.status.id) === Number(selectedStatus)
        );
      }

      setFilteredStudents(result);
    } catch (error) {
      console.error(error);
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
              <FilterSelect
                label="Grupo"
                value={selectedGroup}
                onChange={setSelectedGroup}
                options={groups}
                placeholder="Seleccione un Grupo"
              />

              <FilterSelect
                label="Estado"
                value={selectedStatus}
                onChange={setSelectedStatus}
                options={states}
                placeholder="Seleccione un Estado"
              />
            </div>

            <div className="flex justify-between mt-4">
              <Button variant="outline" size="sm" onClick={applyFilters}>
                <Filter className="mr-2 h-4 w-4" />
                Aplicar filtros
              </Button>
              {/* <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Exportar lista
              </Button> */}
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Identificación</TableHead>
                  <TableHead>Grupo</TableHead>
                  <TableHead>Promedio</TableHead>
                  <TableHead>Asistencia</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      {student.name}
                    </TableCell>
                    <TableCell>{student.identification}</TableCell>
                    <TableCell>{student.group.name}</TableCell>
                    <TableCell className="text-center">
                      <span
                        className={
                          student.average >= 90
                            ? "text-green-600 dark:text-green-400"
                            : student.average >= 80
                            ? "text-blue-600 dark:text-blue-400"
                            : student.average >= 70
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-red-600 dark:text-red-400"
                        }
                      >
                        {student.average}
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
                        <span className="text-xs">{student.attendance}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          student.status.name === "Excelente"
                            ? "bg-green-300 dark:bg-green-500 text-green-800 text-center"
                            : student.status.name === "Bueno"
                            ? "bg-blue-300 dark:bg-blue-500 text-blue-800 text-center"
                            : student.status.name === "Regular"
                            ? "bg-amber-300 dark:bg-amber-500 text-amber-800 text-center"
                            : "bg-red-300 dark:bg-red-500 text-red-800 text-center"
                        }
                      >
                        {student.status.name}
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
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Students;
