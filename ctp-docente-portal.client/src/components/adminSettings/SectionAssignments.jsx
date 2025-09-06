import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/Card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/Dialog";
import Button from "../ui/Button";
import { Edit, Plus, Trash2 } from "lucide-react";
import { Label } from "../ui/Label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/Table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/Select";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Loader1 from "../loaders/Loader1";
import axios from "axios";

const subSections = [
  { id: 0, name: "Ambas" },
  { id: 1, name: "A" },
  { id: 2, name: "B" },
];

const SectionAssignments = () => {
  const [loading, setLoading] = useState();
  const [sectionAssignments, setSectionAssignments] = useState([]);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 8,
    totalCount: 0,
  });
  const [academicPeriods, setAcademicPeriods] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [staff, setStaff] = useState([]);

  const [sections, setSections] = useState([]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [askDelete, setAskDelete] = useState(false);
  const [assignmentId, setAssignmentId] = useState(0);

  const [assignmentForm, setAssignmentForm] = useState({
    teacher: { id: 0, name: "" },
    subject: { id: 0, name: "" },
    section: { id: 0, name: "" },
    subSection: { id: -1, name: "" },
    period: { id: 0, name: "" },
  });

  const [errors, setErrors] = useState({
    teacher: "",
    subject: "",
    section: "",
    subSection: "",
    period: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const [subjects, staff, academicPeriods, sections] = await Promise.all([
          axios.get("api/subject", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("api/staff", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("api/academicperiods", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("api/section", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setSubjects(subjects.data);
        setStaff(staff.data);
        setAcademicPeriods(academicPeriods.data);
        setSections(sections.data);
      } catch (error) {
        console.log(error);
        toast.error(error?.response?.data?.Message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          `api/sectionassignments?pageNumber=${pagination.pageNumber}&pageSize=${pagination.pageSize}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setSectionAssignments(data.items);
        setPagination((prev) => ({
          ...prev,
          totalCount: data.totalCount,
          pageNumber: data.pageNumber,
          pageSize: data.pageSize,
        }));
      } catch (error) {
        toast.error(error?.response?.data?.Message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [pagination.pageNumber, pagination.pageSize]);

  const validateForm = () => {
    const newErrors = {
      teacher: "",
      subject: "",
      section: "",
      subSection: "",
      period: "",
    };

    let isValid = true;

    // Validar teacher
    if (
      assignmentForm.teacher.id === 0 ||
      !assignmentForm.teacher.name.trim()
    ) {
      newErrors.teacher = "Debe seleccionar un profesor válido";
      isValid = false;
    }

    // Validar subject
    if (
      assignmentForm.subject.id === 0 ||
      !assignmentForm.subject.name.trim()
    ) {
      newErrors.subject = "Debe seleccionar una materia válida";
      isValid = false;
    }

    // Validar section
    if (
      assignmentForm.section.id === 0 ||
      !assignmentForm.section.name.trim()
    ) {
      newErrors.section = "Debe seleccionar una sección válida";
      isValid = false;
    }

    // Validar subSection (opcional - depende de tus requisitos)
    if (
      assignmentForm.subSection.id === -1 ||
      !assignmentForm.subSection.name.trim()
    ) {
      newErrors.subSection = "Debe seleccionar una subsección válida";
      isValid = false;
    }

    // Validar period
    if (assignmentForm.period.id === 0 || !assignmentForm.period.name.trim()) {
      newErrors.period = "Debe seleccionar un período válido";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const totalPages = Math.ceil(pagination.totalCount / pagination.pageSize);

  const deleteAssignment = async () => {
    try {
      if (assignmentId > 0) {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.delete(
          `api/sectionassignments/${assignmentId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.status === 204) {
          const updatedAssignments = [...sectionAssignments].filter(
            (sa) => sa.id !== assignmentId
          );

          setSectionAssignments(updatedAssignments);
          toast.success("Asignación eliminada exitosamente.");
        }
      }
    } catch (error) {
      toast.error(error?.response?.data?.Message);
    } finally {
      setLoading(false);
    }
  };

  const finishSave = async (message) => {
    toast.success(message);
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setAssignmentForm({
      teacher: { id: 0, name: "" },
      subject: { id: 0, name: "" },
      section: { id: 0, name: "" },
      subSection: { id: -1, name: "" },
      period: { id: 0, name: "" },
    });
    setErrors({
      teacher: "",
      subject: "",
      section: "",
      subSection: "",
      period: "",
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      if (validateForm()) {
        const token = localStorage.getItem("token");
        if (assignmentForm.id) {
          const response = await axios.put(
            `api/sectionassignments/${assignmentForm.id}`,
            assignmentForm,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (response.status === 200) {
            setSectionAssignments(
              sectionAssignments.map((assignment) =>
                assignment.id === assignmentForm.id
                  ? { ...assignmentForm }
                  : assignment
              )
            );
            finishSave("Asignación actualizada exitosamente.");
          }
        } else {
          const response = await axios.post(
            "api/sectionassignments",
            assignmentForm,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (response.status === 200) {
            assignmentForm.id = response.data.id;
            setSectionAssignments([...sectionAssignments, assignmentForm]);
            finishSave("Asignación creada exitosamente.");
          }
        }
      }
    } catch (error) {
      toast.error(error?.response?.data?.Message);
    } finally {
      setLoading(false);
    }
  };

  const getElementSelected = (elements, value) => {
    const elementSelected = elements.find((element) => element.name === value);
    return elementSelected;
  };

  if (loading) return <Loader1 />;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Asignaciones de Grupos a Docentes</CardTitle>
            <CardDescription>
              Administra qué docente imparte qué materia en cada sección
            </CardDescription>
          </div>
          <Dialog
            open={isDialogOpen}
            onOpenChange={() => {
              setIsDialogOpen(!isDialogOpen);
              resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Asignación
              </Button>
            </DialogTrigger>
            <DialogContent className="top-1/3 overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? "Editar Asignación" : "Crear Nueva Asignación"}
                </DialogTitle>
                <DialogDescription>
                  Asigna un docente a una materia y sección específica
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="teacher-select">Docente</Label>
                  <Select
                    value={assignmentForm.teacher.name}
                    onValueChange={(value) => {
                      const teacherSelected = getElementSelected(staff, value);
                      setAssignmentForm({
                        ...assignmentForm,
                        teacher: teacherSelected,
                      });
                      setErrors((prev) => ({
                        ...prev,
                        teacher: "",
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar docente" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...staff]
                        .filter((st) => st.roles.includes("Docente"))
                        .map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.name}>
                            {teacher.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {errors.teacher && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.teacher}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="subject-select">Materia</Label>
                  <Select
                    value={assignmentForm.subject.name}
                    onValueChange={(value) => {
                      const subjectSelected = getElementSelected(
                        subjects,
                        value
                      );
                      setAssignmentForm({
                        ...assignmentForm,
                        subject: subjectSelected,
                      });
                      setErrors((prev) => ({
                        ...prev,
                        subject: "",
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar materia" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.name}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.subject && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.subject}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="section-select">Sección</Label>
                  <Select
                    value={assignmentForm.section.name}
                    onValueChange={(value) => {
                      const sectionSelected = getElementSelected(
                        sections,
                        value
                      );
                      setAssignmentForm({
                        ...assignmentForm,
                        section: sectionSelected,
                      });
                      setErrors((prev) => ({
                        ...prev,
                        section: "",
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar sección" />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.map((section) => (
                        <SelectItem key={section.id} value={section.name}>
                          {section.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.section && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.section}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="subsection-select">Sub Sección</Label>
                  <Select
                    value={assignmentForm.subSection.name}
                    onValueChange={(value) => {
                      const subSectionSelected = getElementSelected(
                        subSections,
                        value
                      );
                      setAssignmentForm({
                        ...assignmentForm,
                        subSection: subSectionSelected,
                      });
                      setErrors((prev) => ({
                        ...prev,
                        subSection: "",
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar subsección" />
                    </SelectTrigger>
                    <SelectContent>
                      {subSections.map((subSection) => (
                        <SelectItem key={subSection.id} value={subSection.name}>
                          {subSection.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.subSection && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.subSection}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="period-select">Período</Label>
                  <Select
                    value={assignmentForm.period.name}
                    onValueChange={(value) => {
                      const periodSelected = getElementSelected(
                        academicPeriods,
                        value
                      );
                      setAssignmentForm({
                        ...assignmentForm,
                        period: periodSelected,
                      });
                      setErrors((prev) => ({
                        ...prev,
                        period: "",
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar período" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...academicPeriods]
                        .filter((periodFilter) => periodFilter.isActive)
                        .map((period) => (
                          <SelectItem key={period.id} value={period.name}>
                            {period.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {errors.period && (
                    <p className="text-red-500 text-sm mt-1">{errors.period}</p>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} variant="outline">
                    {isEditing ? "Actualizar" : "Crear"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Docente</TableHead>
              <TableHead className="text-center">Materia</TableHead>
              <TableHead className="text-center">Sección</TableHead>
              <TableHead className="text-center hidden md:table-cell">
                SubSección
              </TableHead>
              <TableHead className="text-center">Período</TableHead>
              <TableHead className="text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!loading ? (
              sectionAssignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell className="font-medium">
                    {assignment.teacher.name}
                  </TableCell>
                  <TableCell>{assignment.subject.name}</TableCell>
                  <TableCell className="text-center">
                    {assignment.section.name}
                  </TableCell>
                  <TableCell className="text-center hidden md:table-cell">
                    {assignment.subSection.name}
                  </TableCell>
                  <TableCell>{assignment.period.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col md:flex-row gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsEditing(true);
                          setAssignmentForm(assignment);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Dialog
                        open={askDelete}
                        onOpenChange={() => {
                          setAskDelete(true);
                          setAssignmentId(assignment.id);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              ¿Desea eliminar esta Asignación?
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="flex justify-end gap-2">
                              <Button
                                onClick={() => {
                                  setAskDelete(false);
                                }}
                              >
                                Cancelar
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setAskDelete(false);
                                  deleteAssignment();
                                }}
                              >
                                Continuar
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="font-medium">
                  <Loader1 />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <span>
          Página {pagination.pageNumber} de {totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            disabled={pagination.pageNumber === 1}
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                pageNumber: prev.pageNumber - 1,
              }))
            }
          >
            Anterior
          </Button>
          <Button
            disabled={pagination.pageNumber === totalPages}
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                pageNumber: prev.pageNumber + 1,
              }))
            }
          >
            Siguiente
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SectionAssignments;
