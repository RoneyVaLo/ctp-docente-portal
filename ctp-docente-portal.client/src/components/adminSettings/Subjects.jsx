import { useEffect, useState } from "react";
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
import Input from "../ui/Input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/Table";
import { Textarea } from "../ui/Textarea";
import toast from "react-hot-toast";
import Loader1 from "../loaders/Loader1";
import axios from "axios";

const Subjects = () => {
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 5,
    totalCount: 0,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [askDelete, setAskDelete] = useState(false);
  const [subjectId, setSubjectId] = useState(0);

  const [subjectForm, setSubjectForm] = useState({
    name: "",
    code: "",
    description: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    code: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem("token");
        const { data } = await axios.get(
          `api/subject/pagination?pageNumber=${pagination.pageNumber}&pageSize=${pagination.pageSize}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSubjects(data.items);
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

    fetchData();
  }, [pagination.pageNumber, pagination.pageSize]);

  const validateForm = () => {
    const newErrors = {
      name: "",
      code: "",
    };

    let isValid = true;

    // Validar nombre
    if (!subjectForm.name.trim()) {
      newErrors.name = "El nombre de la materia es requerido";
      isValid = false;
    } else if (subjectForm.name.length < 3) {
      newErrors.name = "El nombre debe tener al menos 3 caracteres";
      isValid = false;
    }

    // Validar código
    if (!subjectForm.code.trim()) {
      newErrors.code = "El código de la materia es requerido";
      isValid = false;
    } else if (subjectForm.code.length < 2) {
      newErrors.code = "El código debe tener al menos 2 caracteres";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const deleteSubject = async () => {
    try {
      if (subjectId > 0) {
        setLoading(true);
        const token = sessionStorage.getItem("token");
        const response = await axios.delete(`api/subject/${subjectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 204) {
          const updatedSubjects = [...subjects].filter(
            (ei) => ei.id !== subjectId
          );

          setSubjects(updatedSubjects);
          toast.success("Materia eliminada exitosamente.");
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
    setSubjectForm({ code: "", name: "", description: "" });
    setErrors({ name: "", code: "" });
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      if (validateForm()) {
        setLoading(true);
        const token = sessionStorage.getItem("token");
        if (subjectForm.id) {
          const response = await axios.put(
            `api/subject/${subjectForm.id}`,
            subjectForm,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (response.status === 200) {
            setSubjects(
              subjects.map((subject) =>
                subject.id === subjectForm.id ? { ...subjectForm } : subject
              )
            );
            finishSave("Materia actualizada exitosamente.");
          }
        } else {
          const response = await axios.post("api/subject", subjectForm, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.status === 200) {
            subjectForm.id = response.data.id;
            setSubjects([...subjects, subjectForm]);
            finishSave("Materia creada exitosamente.");
          }
        }
      }
    } catch (error) {
      toast.error(error?.response?.data?.Message);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(pagination.totalCount / pagination.pageSize);

  if (loading) return <Loader1 />;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row text-center md:text-start items-center justify-between">
          <div>
            <CardTitle>Materias / Asignaturas</CardTitle>
            <CardDescription>
              Administra las materias del plan de estudios
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Materia
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? "Editar Materia" : "Crear Nueva Materia"}
                </DialogTitle>
                <DialogDescription>
                  Define los detalles de la materia o asignatura
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="subject-code">Código</Label>
                  <Input
                    id="subject-code"
                    value={subjectForm.code}
                    onChange={(e) => {
                      setSubjectForm({
                        ...subjectForm,
                        code: e.target.value.toUpperCase(),
                      });
                      setErrors((prev) => ({
                        ...prev,
                        code: "",
                      }));
                    }}
                    placeholder="ej. MAT"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="subject-name">Nombre</Label>
                  <Input
                    id="subject-name"
                    value={subjectForm.name}
                    onChange={(e) => {
                      setSubjectForm({
                        ...subjectForm,
                        name: e.target.value,
                      });
                      setErrors((prev) => ({
                        ...prev,
                        name: "",
                      }));
                    }}
                    placeholder="ej. Matemáticas"
                  />
                  {errors.code && (
                    <p className="text-red-500 text-sm mt-1">{errors.code}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="subject-description">Descripción</Label>
                  <Textarea
                    id="subject-description"
                    value={subjectForm.description}
                    onChange={(e) =>
                      setSubjectForm({
                        ...subjectForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Descripción de la materia..."
                  />
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
        <div className="overflow-x-auto w-52 sm:w-56 lg:w-full mx-auto lg:mx-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!loading ? (
                subjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell className="font-medium">
                      {subject.code}
                    </TableCell>
                    <TableCell>{subject.name}</TableCell>
                    <TableCell>{subject.description}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit
                            className="h-4 w-4"
                            onClick={() => {
                              setSubjectForm(subject);
                              setIsEditing(true);
                              setIsDialogOpen(true);
                            }}
                          />
                        </Button>

                        <Dialog
                          open={askDelete}
                          onOpenChange={() => {
                            setAskDelete(true);
                            setSubjectId(subject.id);
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
                                ¿Desea eliminar esta Materia?
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
                                    deleteSubject();
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
        </div>
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

export default Subjects;
