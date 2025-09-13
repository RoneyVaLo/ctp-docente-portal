import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/Card";
import { Bell, BookOpen, Calendar, UserCheck } from "lucide-react";
import { Badge } from "../ui/Badge";
import Button from "../ui/Button";
import { NavLink } from "react-router-dom";

const TeacherDashboard = ({ teacherStats }) => {
  const {
    detailEvaluations,
    pendingEvaluations,
    presentStudents,
    quantitySections,
    totalStudents,
  } = teacherStats;
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Secciones Asignadas
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold">
              {Number(quantitySections) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Activas este período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Estudiantes Presentes Hoy
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Number(presentStudents) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              de {Number(totalStudents) || 0} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Evaluaciones Pendientes
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Number(pendingEvaluations) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Calificaciones por registrar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Evaluations */}
      <Card>
        <CardHeader>
          <CardTitle>Evaluaciones Pendientes</CardTitle>
          <CardDescription>
            Calificaciones que requieren tu atención
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {detailEvaluations.map((pendingEval, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row justify-center items-center md:justify-between p-3 border rounded-lg"
              >
                <div className="text-center md:text-start">
                  <h4 className="font-medium">
                    {pendingEval.subject} - {pendingEval.section}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {pendingEval.evaluationItem.name}
                  </p>
                </div>
                <div className="flex flex-col md:flex-row mt-4 md:mt-0 items-center gap-2">
                  <NavLink
                    to={`/item/${pendingEval.evaluationItem.id}/calificar`}
                  >
                    <Button variant="outline" size="sm">
                      Calificar
                    </Button>
                  </NavLink>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherDashboard;
