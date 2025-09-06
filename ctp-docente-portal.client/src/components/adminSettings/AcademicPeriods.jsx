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
import { Switch } from "../ui/Switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/Table";
import { Badge } from "../ui/Badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/Select";
import toast from "react-hot-toast";
import { formatDate } from "../../utils/gradeUtils";
import axios from "axios";
import Loader1 from "../loaders/Loader1";

const AcademicPeriods = () => {
  const [loading, setLoading] = useState(false);
  const [enrollments, setEnrollments] = useState([]);
  const [academicPeriods, setAcademicPeriods] = useState([]);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 5,
    totalCount: 0,
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [askDelete, setAskDelete] = useState(false);
  const [periodId, setPeriodId] = useState(0);

  const [periodForm, setPeriodForm] = useState({
    name: "",
    enrollment: { id: 0, name: "" },
    startDate: "",
    endDate: "",
    isActive: false,
  });

  const [errors, setErrors] = useState({
    name: "",
    enrollment: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem("token");
        const response = await axios.get("api/enrollment", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setEnrollments(response.data);
      } catch (error) {
        toast.error(error?.response?.data?.Message);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem("token");
        const { data } = await axios.get(
          `api/academicperiods/pagination?pageNumber=${pagination.pageNumber}&pageSize=${pagination.pageSize}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAcademicPeriods(data.items);
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
      enrollment: "",
      startDate: "",
      endDate: "",
    };

    let isValid = true;

    // Validar nombre
    if (!periodForm.name.trim()) {
      newErrors.name = "El nombre es requerido";
      isValid = false;
    } else if (periodForm.name.length < 3) {
      newErrors.name = "El nombre debe tener al menos 3 caracteres";
      isValid = false;
    }

    // Validar matrícula
    if (periodForm.enrollment.id === 0 || !periodForm.enrollment.name.trim()) {
      newErrors.enrollment = "Debe seleccionar una matrícula válida";
      isValid = false;
    }

    // Validar fechas
    if (!periodForm.startDate) {
      newErrors.startDate = "La fecha de inicio es requerida";
      isValid = false;
    }

    if (!periodForm.endDate) {
      newErrors.endDate = "La fecha de fin es requerida";
      isValid = false;
    }

    // Validar que la fecha de fin sea posterior a la de inicio
    if (periodForm.startDate && periodForm.endDate) {
      const start = new Date(periodForm.startDate);
      const end = new Date(periodForm.endDate);

      if (end <= start) {
        newErrors.endDate =
          "La fecha de fin debe ser posterior a la fecha de inicio";
        isValid = false;
      }
    }

    setErrors(newErrors);

    return isValid;
  };

  const resetForm = () => {
    setPeriodForm({ name: "", startDate: "", endDate: "", isActive: false });
    setErrors({
      name: "",
      enrollment: "",
      startDate: "",
      endDate: "",
    });
    setIsEditing(false);
  };

  const deletePeriod = async () => {
    try {
      if (periodId > 0) {
        setLoading(true);
        const token = sessionStorage.getItem("token");
        const response = await axios.delete(`api/academicperiods/${periodId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 204) {
          const updatedPeriods = [...academicPeriods].filter(
            (ei) => ei.id !== periodId
          );

          setAcademicPeriods(updatedPeriods);
          toast.success("Periodo eliminado exitosamente.");
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

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      if (validateForm()) {
        const year = new Date(periodForm.startDate).getFullYear();
        const dataToSend = {
          ...periodForm,
          year: new Date(year, 0, 1).toISOString(),
          startDate: new Date(periodForm.startDate).toISOString(),
          endDate: new Date(periodForm.endDate).toISOString(),
        };

        if (periodForm.id) {
          const response = await axios.put(
            `api/academicperiods/${periodForm.id}`,
            dataToSend,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (response.status === 200) {
            setAcademicPeriods(
              academicPeriods.map((period) =>
                period.id === periodForm.id ? { ...periodForm } : period
              )
            );
            finishSave("Periodo actualizado exitosamente.");
          }
        } else {
          const response = await axios.post("api/academicperiods", dataToSend, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.status === 200) {
            periodForm.id = response.data.id;
            setAcademicPeriods([...academicPeriods, periodForm]);
            finishSave("Periodo creado exitosamente.");
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

  if (loading) <Loader1 />;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Períodos Académicos</CardTitle>
            <CardDescription>
              Gestiona los períodos escolares y sus fechas
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Período
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? "Editar Período" : "Crear Nuevo Período"}
                </DialogTitle>
                <DialogDescription>
                  Define las fechas de inicio y fin del período académico
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="period-name">Nombre del Período</Label>
                  <Input
                    id="period-name"
                    value={periodForm.name}
                    onChange={(e) => {
                      setPeriodForm({
                        ...periodForm,
                        name: e.target.value,
                      });
                      setErrors((prev) => ({
                        ...prev,
                        name: "",
                      }));
                    }}
                    placeholder="ej. Primer Semestre"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="period-name">Periodo de Inscripción</Label>
                  <Select
                    value={periodForm.enrollment?.name}
                    onValueChange={(value) => {
                      const enrollmentSelected = enrollments.find(
                        (enrollment) => enrollment.name == value
                      );

                      setPeriodForm({
                        ...periodForm,
                        enrollment: enrollmentSelected || value,
                      });
                      setErrors((prev) => ({
                        ...prev,
                        enrollment: "",
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar Inscripción" />
                    </SelectTrigger>
                    <SelectContent>
                      {enrollments.map((enrollment) => (
                        <SelectItem key={enrollment.id} value={enrollment.name}>
                          {enrollment.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.enrollment && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.enrollment}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-date">Fecha de Inicio</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={periodForm.startDate.split("T")[0]}
                      onChange={(e) => {
                        setPeriodForm({
                          ...periodForm,
                          startDate: e.target.value,
                        });
                        setErrors((prev) => ({
                          ...prev,
                          startDate: "",
                        }));
                      }}
                    />
                    {errors.startDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.startDate}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="end-date">Fecha de Fin</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={periodForm.endDate.split("T")[0]}
                      onChange={(e) => {
                        setPeriodForm({
                          ...periodForm,
                          endDate: e.target.value,
                        });
                        setErrors((prev) => ({
                          ...prev,
                          endDate: "",
                        }));
                      }}
                    />
                    {errors.endDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.endDate}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is-active"
                    checked={periodForm.isActive}
                    onChange={() =>
                      setPeriodForm({
                        ...periodForm,
                        isActive: !periodForm.isActive,
                      })
                    }
                  />
                  <Label htmlFor="is-active">Período Activo</Label>
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
              <TableHead className="text-center">Nombre</TableHead>
              <TableHead className="text-center">Fecha de Inicio</TableHead>
              <TableHead className="text-center">Fecha de Fin</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {academicPeriods.length > 0 ? (
              academicPeriods.map((period) => (
                <TableRow key={period.id}>
                  <TableCell className="font-medium text-center">
                    {period.name}
                  </TableCell>
                  <TableCell className="text-center">
                    {formatDate(period.startDate)}
                  </TableCell>
                  <TableCell className="text-center">
                    {formatDate(period.endDate)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={period.isActive ? "default" : "secondary"}>
                      {period.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setPeriodForm(period);
                          setIsEditing(true);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Dialog
                        open={askDelete}
                        onOpenChange={() => {
                          setAskDelete(true);
                          setPeriodId(period.id);
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
                              ¿Desea eliminar este Periodo?
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
                                  deletePeriod();
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
                <TableCell className="font-medium text-center">
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

export default AcademicPeriods;
