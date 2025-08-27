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

const TeacherDashboard = ({ teacherSections, pendingEvaluations }) => {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Secciones Asignadas
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold">{teacherSections.length}</div>
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
              {teacherSections.reduce(
                (acc, section) => acc + section.present,
                0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              de{" "}
              {teacherSections.reduce(
                (acc, section) => acc + section.students,
                0
              )}{" "}
              total
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
              {pendingEvaluations.reduce(
                (acc, pendingEval) => acc + pendingEval.pending,
                0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Calificaciones por registrar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Notificaciones
            </CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Nuevas este día</p>
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
            {pendingEvaluations.map((pendingEval, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row justify-center items-center md:justify-between p-3 border rounded-lg"
              >
                <div className="text-center md:text-start">
                  <h4 className="font-medium">
                    {pendingEval.subject} - {pendingEval.section}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {pendingEval.type}
                  </p>
                </div>
                <div className="flex flex-col md:flex-row mt-4 md:mt-0 items-center gap-2">
                  <Badge variant="secondary">
                    {pendingEval.pending} pendientes
                  </Badge>
                  <Button size="sm">Calificar</Button>
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
