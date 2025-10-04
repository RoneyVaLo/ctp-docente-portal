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
import { Edit, Link, Plus, Trash2 } from "lucide-react";
import { Label } from "../ui/Label";
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
// import { useAdminConfig } from "../../context/AdminConfigContext";
import axios from "axios";
import Loader1 from "../loaders/Loader1";

const EvaluationRoles = () => {
  // const { staff, staffRoles, setStaffRoles, loading, setLoading } = useAdminConfig();

  const [loading, setLoading] = useState(false);
  const [staff, setStaff] = useState([]);
  const [staffRoles, setStaffRoles] = useState([]);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 5,
    totalCount: 0,
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDialogLinkOpen, setIsDialogLinkOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [askDelete, setAskDelete] = useState(false);
  const [staffRoleId, setStaffRoleId] = useState(0);
  const [users, setUsers] = useState([]);
  const [evaluationRoles, setEvaluationRoles] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);

  const [staffRoleForm, setStaffRoleForm] = useState({
    staff: { id: 0, name: "" },
    role: { id: 0, name: "" },
  });

  const [staffUserForm, setStaffUserForm] = useState({
    staff: { id: 0, name: "" },
    user: { id: 0, username: "" },
  });

  const [errors, setErrors] = useState({
    staff: "",
    role: "",
    user: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem("token");
        setLoading(true);
        const [usersResponse, evaluationRolesResponse, staffResponse] =
          await Promise.all([
            axios.get("api/users", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("api/evaluationrole", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("api/staff", {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

        setUsers(usersResponse.data);
        setEvaluationRoles(evaluationRolesResponse.data);
        setStaff(staffResponse.data);
      } catch (error) {
        toast.error(error?.response?.data?.Message);
      } finally {
        setLoading(false);
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
          `api/evaluationstaffroles/pagination?pageNumber=${pagination.pageNumber}&pageSize=${pagination.pageSize}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setStaffRoles(data.items);
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

  const validateStaffRoleForm = () => {
    const newErrors = {
      staff: "",
      role: "",
    };

    let isValid = true;

    // Validar staff
    if (staffRoleForm.staff.id === 0 || !staffRoleForm.staff.name.trim()) {
      newErrors.staff = "Debe seleccionar un miembro del staff válido";
      isValid = false;
    }

    // Validar role
    if (staffRoleForm.role.id === 0 || !staffRoleForm.role.name.trim()) {
      newErrors.role = "Debe seleccionar un rol válido";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const validateStaffUserForm = () => {
    const newErrors = {
      staff: "",
      user: "",
    };

    let isValid = true;

    // Validar staff
    if (staffUserForm.staff.id === 0 || !staffUserForm.staff.name.trim()) {
      newErrors.staff = "Debe seleccionar un miembro del staff válido";
      isValid = false;
    }

    // Validar usuario
    if (staffUserForm.user.id === 0 || !staffUserForm.user.username.trim()) {
      newErrors.user = "Debe seleccionar un usuario válido";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const deleteAssignment = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const response = await axios.delete(
        `api/evaluationstaffroles/${staffRoleId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 204) {
        const updatedStaffRole = [...staffRoles].filter(
          (sa) => sa.id !== staffRoleId
        );

        setStaffRoles(updatedStaffRole);
        toast.success("Asignación de rol eliminada exitosamente.");
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
    setIsDialogLinkOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setStaffRoleForm({
      staff: { id: 0, name: "" },
      role: { id: 0, name: "" },
    });

    setStaffUserForm({
      staff: { id: 0, name: "" },
      user: { id: 0, username: "" },
    });
    setErrors({
      staff: "",
      role: "",
      user: "",
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      if (validateStaffRoleForm()) {
        const token = sessionStorage.getItem("token");
        setLoading(true);
        if (staffRoleForm.id) {
          const response = await axios.put(
            `api/evaluationstaffroles/${staffRoleForm.id}`,
            staffRoleForm,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          console.log(response);

          if (response.status === 200) {
            setStaffRoles(
              staffRoles.map((staff) =>
                staff.id === staffRoleForm.id ? { ...staffRoleForm } : staff
              )
            );
            finishSave("Asignación de rol actualizada exitosamente.");
          }
        } else {
          const response = await axios.post(
            "api/evaluationstaffroles",
            staffRoleForm,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (response.status === 201) {
            staffRoleForm.id = response.data.id;
            setStaffRoles([...staffRoles, staffRoleForm]);
            finishSave("Rol asignado exitosamente.");
          }
        }
      }
    } catch (error) {
      toast.error(error?.response?.data?.Message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLink = async () => {
    try {
      if (validateStaffUserForm()) {
        const token = sessionStorage.getItem("token");
        setLoading(true);
        const response = await axios.post(
          "api/staffuserlinks",
          { staffId: staffUserForm.staff.id, userId: staffUserForm.user.id },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.status === 201) {
          staffUserForm.id = response.data.id;
          setStaffUsers([...staffUsers, staffUserForm]);
          finishSave("Usuario vinculado exitosamente.");
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

  const totalPages = Math.ceil(pagination.totalCount / pagination.pageSize);

  if (loading) return <Loader1 />;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 md:flex-row text-center md:text-start items-center justify-between">
          <div className="mb-2 md:mb-0">
            <CardTitle>Asignación de Roles al Personal</CardTitle>
            <CardDescription>
              Asigna roles a los miembros del staff
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
                Asignar Rol
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {isEditing
                    ? "Editar Asignación de Rol"
                    : "Crear Nuevo Asignación de Rol"}
                </DialogTitle>
                <DialogDescription>
                  Asigna un rol para un usuario
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {!staffRoleForm.id ? (
                  <div>
                    <Label htmlFor="teacher-select">Docente</Label>
                    <Select
                      value={staffRoleForm.staff.name}
                      onValueChange={(value) => {
                        const staffSelected = getElementSelected(staff, value);
                        setStaffRoleForm({
                          ...staffRoleForm,
                          staff: staffSelected,
                        });
                        setErrors((prev) => ({
                          ...prev,
                          staff: "",
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar docente" />
                      </SelectTrigger>
                      <SelectContent>
                        {staff.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.name}>
                            {teacher.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.staff && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.staff}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="teacher-select">Docente</Label>
                    <Select value={staffRoleForm.staff.name}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar docente" />
                      </SelectTrigger>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="role-select">Rol</Label>
                  <Select
                    value={staffRoleForm.role.name}
                    onValueChange={(value) => {
                      const roleSelected = getElementSelected(
                        evaluationRoles,
                        value
                      );
                      setStaffRoleForm({
                        ...staffRoleForm,
                        role: roleSelected,
                      });
                      setErrors((prev) => ({
                        ...prev,
                        role: "",
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {evaluationRoles.map((role) => (
                        <SelectItem key={role.id} value={role.name}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-red-500 text-sm mt-1">{errors.role}</p>
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

          <Dialog
            open={isDialogLinkOpen}
            onOpenChange={() => {
              setIsDialogLinkOpen(!isDialogLinkOpen);
              resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Link className="h-4 w-4 mr-2" />
                Vincular Usuario - Personal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? "Editar Vinculación" : "Crear Nueva Vinculación"}
                </DialogTitle>
                <DialogDescription>
                  Vincular el Personal con su Usuario
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="personal-select">Personal</Label>
                  <Select
                    value={staffUserForm.staff.name}
                    onValueChange={(value) => {
                      const staffSelected = getElementSelected(staff, value);
                      setStaffUserForm({
                        ...staffUserForm,
                        staff: staffSelected,
                      });
                      setErrors((prev) => ({
                        ...prev,
                        staff: "",
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar personal" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.map((st) => (
                        <SelectItem key={st.id} value={st.name}>
                          {st.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.staff && (
                    <p className="text-red-500 text-sm mt-1">{errors.staff}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="user-select">Usuario</Label>
                  <Select
                    value={staffUserForm.user.username}
                    onValueChange={(value) => {
                      const userSelected = users.find(
                        (user) => user.username === value
                      );
                      setStaffUserForm({
                        ...staffUserForm,
                        user: userSelected,
                      });
                      setErrors((prev) => ({
                        ...prev,
                        user: "",
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar usuario" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.username}>
                          {user.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.user && (
                    <p className="text-red-500 text-sm mt-1">{errors.user}</p>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => {
                      setIsDialogLinkOpen(false);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveLink} variant="outline">
                    {isEditing ? "Actualizar" : "Crear"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto w-56 lg:w-full mx-auto lg:mx-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="text-center">Rol</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!loading ? (
                staffRoles.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      {member.staff.name}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{member.role.name}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setIsEditing(true);
                            setStaffRoleForm(member);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Dialog
                          open={askDelete}
                          onOpenChange={() => {
                            setAskDelete(true);
                            setStaffRoleId(member.id);
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

export default EvaluationRoles;
