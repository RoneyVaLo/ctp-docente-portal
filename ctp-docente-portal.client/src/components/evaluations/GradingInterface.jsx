import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import {
  AlertCircle,
  CheckCircle,
  Download,
  Edit,
  Filter,
  Save,
  Search,
} from "lucide-react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { Alert, AlertDescription } from "../ui/Alert";

import GradeTable from "./GradeTable";
import { useEvaluation } from "../../context/EvaluationContext";
import axios from "axios";
import Loader1 from "../loaders/Loader1";

const GradingInterface = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // <"idle" | "saving" | "saved" | "error">
  const [saveStatus, setSaveStatus] = useState("idle");
  const [isEditing, setIsEditing] = useState(false);

  const {
    evaluationItems,
    students,
    setStudents,
    loading,
    setLoading,
    selectedGroup,
  } = useEvaluation();

  const calculateFinalGrade = (grades) => {
    let total = 0;
    evaluationItems.forEach((item) => {
      const grade = grades[item.id] || 0;
      total += (grade * item.percentage) / 100;
    });

    return total.toFixed(1);
  };

  const handleEditToggle = () => {
    setIsEditing((prev) => !prev);
  };

  useEffect(() => {
    setStudents((prev) =>
      prev.map((student) => ({
        ...student,
        finalGrade: calculateFinalGrade(student.scoresByItemId),
      }))
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGradeChange = (studentId, item, index, value) => {
    const rubricId = item.id;
    const numValue = Number.parseFloat(value) || 0;
    if (numValue < 0 || numValue > 100) return;

    setStudents((prev) =>
      prev.map((student) => {
        if (student.studentId === studentId) {
          const newGrades = { ...student.scoresByItemId, [rubricId]: numValue };
          return {
            ...student,
            scoresByItemId: newGrades,
            finalGrade: calculateFinalGrade(newGrades),
          };
        }
        return student;
      })
    );

    setSaveStatus("saving");
    setTimeout(() => setSaveStatus("saved"), 1000);
    setTimeout(() => setSaveStatus("idle"), 3000);
  };

  const saveChanges = async () => {
    try {
      setLoading(true);
      const updatedBy = 1;

      const payload = students.flatMap((student) =>
        Object.entries(student.scoresByItemId).map(([itemId, score]) => ({
          StudentId: student.studentId,
          EvaluationItemId: parseInt(itemId, 10),
          Score: score || 0,
          UpdatedBy: updatedBy,
        }))
      );

      // console.log(payload);
      const response = await axios.post(
        `/api/evaluationscores/section/${selectedGroup}`,
        payload
      );
      console.log(response.data);
      setSaveStatus("idle");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student) =>
    student.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loader1 />;

  return (
    <div className="bg-white dark:bg-slate-800 dark:text-white rounded-lg shadow-sm p-6">
      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros de Evaluación
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center rounded-md w-[98%] mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar estudiante..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-black"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Status */}
      <Alert
        className={`mt-4 ${saveStatus === "idle" && "opacity-0"}
            ${
              saveStatus === "error"
                ? "border-red-200 bg-red-50"
                : "border-green-200 bg-green-50"
            }`}
      >
        {saveStatus === "saving" && <AlertCircle className="h-4 w-4" />}
        {saveStatus === "saved" && <CheckCircle className="h-4 w-4" />}
        {saveStatus === "error" && <AlertCircle className="h-4 w-4" />}
        <AlertDescription className={`${saveStatus === "idle" && "opacity-0"}`}>
          {saveStatus === "saving" && "Guardando cambios..."}
          {saveStatus === "saved" && "Cambios guardados exitosamente"}
          {saveStatus === "error" && "Error al guardar los cambios"}
          {saveStatus === "idle" && "Hola Mundo"}
        </AlertDescription>
      </Alert>

      {/* Grading Table */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <span className="mx-auto sm:mx-0 mb-4 sm:mb-0">
              Estudiantes ({filteredStudents.length})
            </span>
            <div className="flex gap-4 flex-col sm:flex-row">
              <Button size="sm" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Descargar Reporte
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={isEditing ? saveChanges : handleEditToggle}
                className="sm:min-w-48"
              >
                {isEditing ? (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Calificaciones
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar Calificaciones
                  </>
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <GradeTable
            students={filteredStudents}
            criteria={evaluationItems}
            isEditing={isEditing}
            getGradeValue={(s, item) => s.scoresByItemId[item.id]}
            onGradeChange={handleGradeChange}
            showRubricLink={isEditing}
            getFinalGrade={(s) => calculateFinalGrade(s.scoresByItemId) || 0}
            readOnlyCondition={
              (item) => item.hasCriteria /*  || item.name === "Asistencia" */
            }
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default GradingInterface;
