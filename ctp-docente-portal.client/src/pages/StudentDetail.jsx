import { NavLink, useParams } from "react-router-dom";
import Button from "../components/ui/Button";
import {
  ArrowLeft,
  Calendar,
  CirclePlus,
  Download,
  Mail,
  Phone,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/Table";
import TabsContent from "../components/evaluations/TabsContent";
import { useEffect, useState } from "react";
import TabsTrigger from "../components/evaluations/TabsTrigger ";
import TabsList from "../components/evaluations/TabsList";
import Tooltip from "../components/Tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/Dialog";
import Avatar from "../components/ui/Avatar";
import axios from "axios";
import Loader1 from "../components/loaders/Loader1";
import { useDownloadPdf } from "../hooks/useDownloadPdf";

const StudentDetail = () => {
  const params = useParams();
  const id = params.id;

  const { downloadPdf } = useDownloadPdf();

  const [activeTab, setActiveTab] = useState("calificaciones");
  const [activeTabSubject, setActiveTabSubject] = useState("");
  const [student, setStudent] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTabChange = (tabValue) => {
    setActiveTab(tabValue);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const reportFilter = {
          academicPeriodId: parseInt(sessionStorage.getItem("periodStudents")),
          sectionId: parseInt(sessionStorage.getItem("groupStudents")),
        };
        const token = sessionStorage.getItem("token");
        const response = await axios.post(
          `/api/students/student/${id}`,
          reportFilter,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // console.log(response.data);
        setStudent(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calculateAverages = (grades) => {
    if (grades) {
      const averages = {};

      Object.entries(grades).forEach(([subject, evaluations]) => {
        const total = evaluations.reduce((sum, item) => sum + item.score, 0);
        const average = evaluations.length > 0 ? total / evaluations.length : 0;
        averages[subject] = average;
      });

      return averages;
    }
  };

  const calculateGeneralAverage = (averages) => {
    if (averages) {
      const values = Object.values(averages);
      const total = values.reduce((sum, val) => sum + val, 0);
      return values.length > 0 ? total / values.length : 0;
    }
  };

  const averages = calculateAverages(student.grades);
  const generalAverage = calculateGeneralAverage(averages);

  const getAverage = (evaluations) => {
    const average =
      evaluations.reduce((acc, curr) => acc + curr.score, 0) /
      evaluations.length;
    return average;
  };

  // Función para obtener color según la nota
  const getColorScore = (score) => {
    if (Number(score) >= 90) return "text-green-600";
    if (Number(score) >= 80) return "text-blue-600";
    if (Number(score) >= 70) return "text-amber-600";
    return "text-red-600";
  };

  // Función para obtener el estado general del estudiante
  const getStudentStatus = () => {
    if (generalAverage >= 85 && student.attendance.percentage >= 90) {
      return {
        text: "Excelente",
        color: "bg-green-100 text-green-800",
        description: "Rendimiento sobresaliente",
      };
    } else if (generalAverage >= 75 && student.attendance.percentage >= 85) {
      return {
        text: "Bueno",
        color: "bg-blue-100 text-blue-800",
        description: "Buen rendimiento general",
      };
    } else if (generalAverage >= 70 && student.attendance.percentage >= 80) {
      return {
        text: "Regular",
        color: "bg-amber-100 text-amber-800",
        description: "Rendimiento aceptable",
      };
    } else {
      return {
        text: "Necesita apoyo",
        color: "bg-red-100 text-red-800",
        description: "Requiere atención especial",
      };
    }
  };

  const studentStatus = getStudentStatus();

  // Obtener iniciales para el avatar
  const getInitials = (name) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }
  };

  const subjects = student.grades && Object.entries(student.grades);

  const studentPerformanceReport = async () => {
    try {
      setLoading(true);

      const reportFilter = {
        academicPeriodId: parseInt(sessionStorage.getItem("periodStudents")),
        sectionId: parseInt(sessionStorage.getItem("groupStudents")),
        // subjectId: parseInt(selectedSubject),
      };

      await downloadPdf(
        `/api/pdfreport/rendimiento-estudiante/${id}`,
        reportFilter,
        `${student.fullName.replace(" ", "_")}.pdf`
      );
    } catch (error) {
      console.log(error);
      console.log(error?.response?.data?.Message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader1 />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <NavLink to={-1}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </NavLink>
        <h1 className="text-3xl font-bold tracking-tight">
          Perfil de estudiante
        </h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 my-2">
                  <Avatar.Fallback className="bg-background-dark/80 dark:bg-background/80 text-white dark:text-black text-2xl">
                    {getInitials(student.fullName)}
                  </Avatar.Fallback>
                </Avatar>
                <h2 className="text-xl font-bold">{student.fullName}</h2>
                <p className="">{student.group}</p>
                <Badge className={`mt-2 ${studentStatus.color}`}>
                  {studentStatus.text}
                </Badge>
                <p className="text-sm  mt-1">{studentStatus.description}</p>

                <div className="w-full mt-6 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 " />
                    <span className="">Fecha de nacimiento:</span>
                    <span className="ml-auto">{student.birthDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="rounded-full">
                      {student.age}
                    </Badge>
                    <span>Edad</span>
                    <Badge variant="outline" className="ml-auto rounded-full">
                      {student.gender}
                    </Badge>
                  </div>
                  <div className="w-full mt-6 pt-6 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      <Button
                        className="w-full"
                        onClick={studentPerformanceReport}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Descargar PDF
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Contactos</CardTitle>
              <CardDescription>
                Información de padres o encargados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {student.parents?.map((parent, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="font-medium mb-2">
                      {parent.fullName}{" "}
                      <span className="">({parent.relationship})</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-[10%]">
                          <Phone className="h-4 w-4 " />
                        </div>
                        <span className="w-[90%]">{parent.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        <div className="w-[20%]">
                          <Mail className="h-4 w-4" />
                        </div>
                        <span
                          className={`w-[90%] ${
                            parent.email.includes("@") && "lowercase"
                          }`}
                        >
                          {parent.email || "No Indica"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:w-2/3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Promedio general
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-3xl font-bold ${getColorScore(
                    student.generalAverage
                  )}`}
                >
                  {Math.round(student.generalAverage) || 0}
                </div>
                <p className="text-xs ">Promedio de todas las asignaturas</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Asistencia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {student?.attendance?.percentage}%
                </div>
                <p className="text-xs ">
                  {student?.attendance?.present} de{" "}
                  {student?.attendance?.present + student?.attendance?.absent}{" "}
                  días
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Ausencias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {student?.attendance?.absent}
                </div>
                <p className="text-xs ">
                  {student?.attendance?.justified} justificadas,{" "}
                  {student?.attendance?.absent - student?.attendance?.justified}{" "}
                  sin justificar
                </p>
              </CardContent>
            </Card>
          </div>

          <TabsList className="grid w-full grid-cols-2">
            {[
              {
                value: "calificaciones",
                label: "Calificaciones",
              },
              {
                value: "asistencia",
                label: "Asistencia",
              },
            ].map(({ value, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                isActive={activeTab === value}
                onClick={handleTabChange}
              >
                <span className="hidden sm:inline">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent
            value="calificaciones"
            className="space-y-6"
            activeTab={activeTab}
          >
            <Card>
              <CardHeader>
                <CardTitle>Resumen de calificaciones</CardTitle>
                <CardDescription>Promedio por asignatura</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subjects?.map(([subject, evaluations]) => (
                    <div key={subject} className="space-y-2">
                      {/* Encabezado con nombre de la subject */}
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                          <span className="capitalize">
                            {subject.replace("_", " ")}
                          </span>

                          <div className="relative group inline-block">
                            <button
                              className="hover:text-green-600 hover:dark:text-green-400"
                              onClick={() => {
                                setIsDialogOpen(true);
                                setActiveTabSubject(subject);
                              }}
                            >
                              <CirclePlus className="h-4 w-4" />
                            </button>
                            <Tooltip
                              message="Ver Detalles"
                              possition={"bottom-full"}
                            />
                          </div>
                        </div>

                        <span
                          className={`font-medium ${getColorScore(
                            Math.round(evaluations[0].average)
                          )}`}
                        >
                          {Math.round(evaluations[0].average)}
                        </span>
                      </div>

                      {/* Barra de progreso */}
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            getAverage(evaluations) >= 90
                              ? "bg-green-500"
                              : getAverage(evaluations) >= 80
                              ? "bg-blue-500"
                              : getAverage(evaluations) >= 70
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${getAverage(evaluations)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild></DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Detalle de calificaciones</DialogTitle>
                  <DialogDescription>
                    Todas las evaluaciones por asignatura
                  </DialogDescription>
                </DialogHeader>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Evaluación</TableHead>
                      <TableHead className="text-center">Fecha</TableHead>
                      <TableHead className="text-right">Calificación</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeTabSubject !== "" &&
                      student?.grades[activeTabSubject]?.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {item.evaluation}
                          </TableCell>
                          <TableCell className="text-center">
                            {item.date}
                          </TableCell>
                          <TableCell
                            className={`text-right font-bold ${getColorScore(
                              item.score
                            )}`}
                          >
                            {item.score}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="asistencia" activeTab={activeTab}>
            <Card>
              <CardHeader>
                <CardTitle>Registro de asistencia</CardTitle>
                <CardDescription>
                  Historial de asistencia reciente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto w-48 sm:w-56 lg:w-full mx-auto lg:mx-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Materia</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Observaciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {student?.attendance?.details.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.date}</TableCell>
                          <TableCell>{item.subject}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                item.status === "Presente"
                                  ? "bg-green-200 dark:bg-green-600 text-green-800"
                                  : "bg-red-200 dark:bg-red-600 text-red-800"
                              }
                            >
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.observations || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;
