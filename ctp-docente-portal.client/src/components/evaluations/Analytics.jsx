import { useEvaluation } from "../../context/EvaluationContext";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import {
  AlertTriangle,
  Award,
  BarChart3,
  TrendingUp,
  Users,
} from "lucide-react";
import { Progress } from "../ui/Progress";
import { Badge } from "../ui/Badge";
import {
  getBarColor,
  getClassStats,
  getGradeDistribution,
  getRubricPerformance,
  getStudentsAtRisk,
} from "../../utils/evaluationAnalytics";

const Analytics = () => {
  const { students, evaluationItems } = useEvaluation();

  const classStats = getClassStats(students, evaluationItems);
  const gradeDistribution = getGradeDistribution(students);
  const rubricPerformance = getRubricPerformance(students, evaluationItems);
  const studentsAtRisk = getStudentsAtRisk(students, evaluationItems);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Análisis y Estadísticas</h2>
        <p className="text-muted-foreground">
          Insights sobre el rendimiento académico del grupo
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Estudiantes
                </p>
                <p className="text-2xl font-bold">{classStats.totalStudents}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Promedio General
                </p>
                <p className="text-2xl font-bold">{classStats.averageGrade}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Tasa de Aprobación
                </p>
                <p className="text-2xl font-bold">{classStats.passRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Excelencia
                </p>
                <p className="text-2xl font-bold">
                  {classStats.excellentRate}%
                </p>
              </div>
              <Award className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grade Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Calificaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-14 md:space-y-4">
            {gradeDistribution.map((grade) => (
              <div
                key={grade.range}
                className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 border-2 border-t-0 md:border-0 rounded-md p-4 md:p-0"
              >
                <div className="w-full text-center md:text-start md:w-16 text-sm font-medium">
                  {grade.range}
                </div>
                <div className="flex-1">
                  {/* Progress Bar */}
                  <div className="relative h-6 w-full overflow-hidden rounded-full bg-slate-300 ">
                    <div
                      className={`h-full w-full flex-1 ${grade.color} transition-all`}
                      style={{
                        transform: `translateX(-${100 - grade.percentage}%)`,
                      }}
                    />
                  </div>
                </div>
                <div className="w-full md:w-20 text-sm text-center md:text-right flex flex-col">
                  <span>{grade.count} estudiantes</span>
                  <span>({grade.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rubric Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Rendimiento por Rúbrica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rubricPerformance.map((rubric) => (
              <div
                key={rubric.name}
                className="flex flex-col md:flex-row gap-2 items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <h3 className="font-medium">{rubric.name}</h3>
                  <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                    <span className="text-2xl font-bold">
                      {rubric.average}%
                    </span>
                  </div>
                </div>
                <div className="w-48">
                  <div className="relative h-4 w-full overflow-hidden rounded-full bg-slate-300 ">
                    <div
                      className={`h-full w-full flex-1 ${getBarColor(
                        rubric.average
                      )} transition-all`}
                      style={{
                        transform: `translateX(-${100 - rubric.average}%)`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Students at Risk */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Estudiantes en Riesgo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {studentsAtRisk.map((student) => (
              <div
                key={student.name}
                className="flex items-center justify-between flex-col md:flex-row p-4 border border-yellow-500 rounded-lg bg-yellow-100 dark:bg-yellow-900/20"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-center">{student.name}</h3>
                  <div className="flex flex-col items-center gap-2 mt-1">
                    <span className="text-lg font-semibold text-red-600 dark:text-red-500">
                      {student.grade}%
                    </span>
                    <div className="flex flex-wrap justify-center gap-2">
                      {student.issues.map((issue) => (
                        <Badge
                          key={issue}
                          variant="destructive"
                          className="text-xs"
                        >
                          {issue}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
