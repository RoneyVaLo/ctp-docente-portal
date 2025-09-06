import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import Button from "../components/ui/Button";
import { ArrowLeft, Edit, Save } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/Alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import GradeTable from "../components/evaluations/GradeTable";
import {
  calculateAverageCriterion,
  calculateFinalGrade,
  calculateGeneralAverage,
  formatDate,
  getGradeColor,
} from "../utils/gradeUtils";
import axios from "axios";
import Loader1 from "../components/loaders/Loader1";
import { useEvaluation } from "../context/EvaluationContext";
import toast from "react-hot-toast";

const GradeEvaluationItem = () => {
  const { loading, setLoading, selectedGroup } = useEvaluation();

  const { itemId } = useParams();
  const { studentId } = useParams();

  const [editMode, setEditMode] = useState(false);
  const [successfulSave, setSuccessfulSave] = useState(false);
  const [evaluation, setEvaluation] = useState([]);
  const [grades, setGrades] = useState([]);

  useEffect(() => {
    const fetchEvaluationData = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem("token");
        const URL = `/api/evaluationitems/item/${itemId}`;

        const response = await axios.get(URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvaluation(response.data);
      } catch (error) {
        console.error(error?.response?.data?.Message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvaluationData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (evaluation?.studentScores?.length && evaluation?.criteria?.length) {
      const newState = {};
      evaluation.studentScores.forEach((student) => {
        newState[student.studentId] = evaluation.criteria.map(
          (criterion) => student.scoresByCriteriaId?.[criterion.id] ?? 0
        );
      });

      setGrades(newState);
    }
  }, [evaluation]);

  const updateGrade = async (studentId, item, indexCriterion, value) => {
    const numericalValue = Number.parseInt(value);

    if (isNaN(numericalValue) || numericalValue < 0 || numericalValue > 100)
      return;

    setGrades((prev) => {
      const newGrades = { ...prev };
      if (!newGrades[studentId]) {
        newGrades[studentId] = evaluation.criteria.map(() => 0);
      }
      newGrades[studentId][indexCriterion] = numericalValue;

      return newGrades;
    });
  };

  const getGradeValue = (student, item, index) => {
    return grades[student.studentId]?.[index] || 0;
  };

  const buildCriteriaScoresPayload = (
    studentScores,
    criteriaList,
    updatedBy
  ) => {
    const payload = [];

    // Recorremos cada estudiante y sus notas
    for (const [studentId, scoresArray] of Object.entries(studentScores)) {
      criteriaList.forEach((criteria, index) => {
        const scoreValue = scoresArray[index];

        payload.push({
          StudentId: parseInt(studentId),
          EvaluationItemId: criteria.evaluationItemId,
          CriteriaId: criteria.id,
          Score: scoreValue,
          UpdatedBy: updatedBy,
        });
      });
    }

    return payload;
  };

  const saveChanges = async () => {
    try {
      setLoading(true);

      const updatedBy = 1;

      const payload = buildCriteriaScoresPayload(
        grades,
        evaluation.criteria,
        updatedBy
      );

      const token = sessionStorage.getItem("token");
      const response = await axios.post(
        `/api/studentcriteriascores/section/${selectedGroup}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(response.data.message);

      setEditMode(false);
      setSuccessfulSave(false);
    } catch (error) {
      console.error(error?.response?.data?.Message);
      toast.error("Error al guardar las notas.");
    } finally {
      setLoading(false);
    }
  };

  if (loading || evaluation.length === 0) {
    return <Loader1 />;
  }

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
          Detalle de evaluación
        </h1>
      </div>

      {successfulSave && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-700">
            Los cambios han sido guardados exitosamente.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>{evaluation.itemName}</CardTitle>
            <CardDescription>
              Información general de la evaluación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Asignatura
                </h3>
                <p>{evaluation.subjectName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Grupo
                </h3>
                <p>{evaluation.sectionName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Fecha de Creación
                </h3>
                <p>{formatDate(evaluation.createdAt)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Valor
                </h3>
                <p>{evaluation.percentage}% del periodo</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Tipo
                </h3>
                <p>{evaluation.evaluationCategoryName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Estado
                </h3>
                <Badge
                  variant={
                    evaluation.estado === "Completado" ? "default" : "secondary"
                  }
                >
                  {/* {evaluation.estado} */}
                </Badge>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Descripción
              </h3>
              <p className="text-sm text-balance">{evaluation.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Evaluation Item Statistics */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Estadísticas</CardTitle>
            <CardDescription>Resumen de resultados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Promedio general
                </h3>
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold">
                    {calculateGeneralAverage(
                      grades,
                      evaluation.studentScores,
                      evaluation.criteria
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">/ 100</div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Promedio por criterio
                </h3>
                <div className="space-y-2">
                  {evaluation.criteria?.map((criterion, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm">{criterion.name}</span>
                      <div className="flex items-center gap-1">
                        <span
                          className={`font-medium ${getGradeColor(
                            calculateAverageCriterion(index, grades)
                          )}`}
                        >
                          {calculateAverageCriterion(index, grades)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          / 100
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Distribución
                </h3>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <div className="bg-green-100 text-green-800 rounded-md py-1 text-xs font-medium">
                      90-100
                    </div>
                    <div className="mt-1 font-bold">
                      {
                        evaluation?.studentScores?.filter(
                          (student) =>
                            calculateFinalGrade(
                              student.studentId,
                              grades,
                              evaluation.criteria
                            ) >= 90
                        ).length
                      }
                    </div>
                  </div>
                  <div>
                    <div className="bg-blue-100 text-blue-800 rounded-md py-1 text-xs font-medium">
                      80-89
                    </div>
                    <div className="mt-1 font-bold">
                      {
                        evaluation?.studentScores?.filter(
                          (student) =>
                            calculateFinalGrade(
                              student.studentId,
                              grades,
                              evaluation.criteria
                            ) >= 80 &&
                            calculateFinalGrade(
                              student.studentId,
                              grades,
                              evaluation.criteria
                            ) < 90
                        ).length
                      }
                    </div>
                  </div>
                  <div>
                    <div className="bg-amber-100 text-amber-800 rounded-md py-1 text-xs font-medium">
                      70-79
                    </div>
                    <div className="mt-1 font-bold">
                      {
                        evaluation?.studentScores?.filter(
                          (student) =>
                            calculateFinalGrade(
                              student.studentId,
                              grades,
                              evaluation.criteria
                            ) >= 70 &&
                            calculateFinalGrade(
                              student.studentId,
                              grades,
                              evaluation.criteria
                            ) < 80
                        ).length
                      }
                    </div>
                  </div>
                  <div>
                    <div className="bg-red-100 text-red-800 rounded-md py-1 text-xs font-medium">
                      &lt; 70
                    </div>
                    <div className="mt-1 font-bold">
                      {
                        evaluation?.studentScores?.filter(
                          (student) =>
                            calculateFinalGrade(
                              student.studentId,
                              grades,
                              evaluation.criteria
                            ) < 70
                        ).length
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setEditMode(false)}>
          Cancelar
        </Button>
        {editMode ? (
          <>
            <Button onClick={saveChanges}>
              <Save className="mr-2 h-4 w-4" />
              Guardar cambios
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => setEditMode(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </>
        )}
      </div>

      <GradeTable
        students={
          evaluation.studentScores
            ? studentId
              ? evaluation.studentScores.filter((s) => s.studentId == studentId)
              : evaluation.studentScores
            : []
        }
        criteria={evaluation.criteria ? evaluation.criteria : []}
        isEditing={editMode}
        getGradeValue={getGradeValue}
        onGradeChange={updateGrade}
        getFinalGrade={(s) =>
          calculateFinalGrade(s.studentId, grades, evaluation.criteria)
        }
      />
    </div>
  );
};

export default GradeEvaluationItem;
