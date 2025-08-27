import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/Card";
import {
  Bell,
  BookOpen,
  GraduationCap,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import Button from "../ui/Button";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const AdminDashboard = ({ topAbsenteeismSections, gradeDistribution }) => {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Estudiantes Activos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">
              +12 desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Asistencia Hoy
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold text-green-600">94.2%</div>
            <p className="text-xs text-muted-foreground">
              1,175 de 1,247 estudiantes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ausencias Hoy</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold text-red-600">72</div>
            <p className="text-xs text-muted-foreground">
              De 42 controles de asistencia registrados
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              5.8% del total de estudiantes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Docentes Activos
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">
              Con asignaciones activas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Secciones con Mayor Ausentismo</CardTitle>
            <CardDescription>
              Ranking de secciones con más ausencias hoy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topAbsenteeismSections.slice(0, 5).map((section, index) => (
                <div
                  key={section.section}
                  className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:scale-105 transition-transform"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium">Sección {section.section}</h4>
                      <p className="text-sm text-muted-foreground">
                        {section.absent} ausentes de {section.total} estudiantes
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-600">
                      {section.percentage}%
                    </div>
                    <p className="text-xs text-muted-foreground">ausentismo</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución de Calificaciones</CardTitle>
            <CardDescription>Rendimiento académico general</CardDescription>
          </CardHeader>
          <CardContent>
            <h2>Graficos</h2>
            <div>{gradeDistribution[0].color}</div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Accesos Rápidos Administrativos</CardTitle>
          <CardDescription>Gestión y reportes del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button className="h-20 flex-col gap-2" variant="outline">
              <Users className="h-6 w-6" />
              Generar Reporte de Asistencia
            </Button>
            <Button className="h-20 flex-col gap-2" variant="outline">
              <BookOpen className="h-6 w-6" />
              Reporte de Calificaciones
            </Button>
            <Button className="h-20 flex-col gap-2" variant="outline">
              <Bell className="h-6 w-6" />
              Enviar Notificaciones
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
