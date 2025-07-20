import React, { useState } from "react";
import TabsList from "../components/evaluations/TabsList";
import TabsTrigger from "../components/evaluations/TabsTrigger ";
import { BarChart3, FileText, GraduationCap, Settings } from "lucide-react";
import TabsContent from "../components/evaluations/TabsContent";
import GradingInterface from "../components/evaluations/GradingInterface";
import RubricManager from "../components/evaluations/RubricManager";
import EvaluationItems from "../components/evaluations/EvaluationItems";
import Analytics from "../components/evaluations/Analytics";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Label } from "../components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/Select";
import { Progress } from "../components/ui/Progress";
import { Badge } from "../components/ui/Badge";

const Evaluations = () => {
  const [activeTab, setActiveTab] = useState("grading");
  const [selectedPeriod, setSelectedPeriod] = useState("1° Período");
  const [selectedSubject, setSelectedSubject] = useState("Destrezas Digitales");
  const [selectedGroup, setSelectedGroup] = useState("Decimo Año-1");

  const rubricItems = [
    {
      id: "trabajo-cotidiano",
      name: "Trabajo Cotidiano",
      weight: 45,
      maxScore: 100,
      hasRubric: true,
    },
    {
      id: "tareas",
      name: "Tareas",
      weight: 10,
      maxScore: 100,
      hasRubric: true,
    },
    {
      id: "prueba",
      name: "Prueba",
      weight: 20,
      maxScore: 100,
      hasRubric: false,
    },
    {
      id: "proyecto",
      name: "Proyecto",
      weight: 15,
      maxScore: 100,
      hasRubric: true,
    },
    {
      id: "asistencia",
      name: "Asistencia",
      weight: 10,
      maxScore: 100,
      hasRubric: false,
    },
  ];

  const handleTabChange = (tabValue) => {
    setActiveTab(tabValue);
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            Sistema de Calificaciones
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Gestión integral de evaluaciones y calificaciones estudiantiles
          </p>
        </div>

        {/* Filters Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-4">
              <div className="space-y-2 bg-slate-400/30 p-2 rounded-lg">
                <Label htmlFor="period">Período</Label>
                <Select
                  value={selectedPeriod}
                  onValueChange={setSelectedPeriod}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1° Período">1° Período</SelectItem>
                    <SelectItem value="2° Período">2° Período</SelectItem>
                    <SelectItem value="3° Período">3° Período</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 bg-slate-400/30 p-2 rounded-lg">
                <Label htmlFor="subject">Asignatura</Label>
                <Select
                  value={selectedSubject}
                  onValueChange={setSelectedSubject}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Destrezas Digitales">
                      Destrezas Digitales para el Procesamiento
                    </SelectItem>
                    <SelectItem value="Matemáticas">Matemáticas</SelectItem>
                    <SelectItem value="Español">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 bg-slate-400/30 p-2 rounded-lg">
                <Label htmlFor="group">Grupo</Label>
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Décimo Año-1">Décimo Año-1</SelectItem>
                    <SelectItem value="Décimo Año-2">Décimo Año-2</SelectItem>
                    <SelectItem value="Undécimo Año-1">
                      Undécimo Año-1
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rubric Overview */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Distribución de Rúbricas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {rubricItems.map((item) => (
                <div key={item.id} className="text-center space-y-2">
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-2xl font-bold">
                    {item.weight}%
                  </div>
                  <Progress value={item.weight} className="h-2" />
                  {item.hasRubric && (
                    <Badge variant="secondary" className="text-xs">
                      Con Rúbrica
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 mt-8">
          {/* TODO: Validar cómo se ve mejor en laptop, con "w-full" o "w-fit" */}
          <TabsList className="grid w-full grid-cols-4 lg::w-fit">
            <TabsTrigger
              value="grading"
              isActive={activeTab === "grading"}
              onClick={handleTabChange}
            >
              <GraduationCap className="w-4 h-4" />
              <span className="hidden sm:inline">Calificaciones</span>
            </TabsTrigger>

            <TabsTrigger
              value="items"
              isActive={activeTab === "items"}
              onClick={handleTabChange}
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Items</span>
            </TabsTrigger>

            <TabsTrigger
              value="rubrics"
              isActive={activeTab === "rubrics"}
              onClick={handleTabChange}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Rúbricas</span>
            </TabsTrigger>

            <TabsTrigger
              value="analytics"
              isActive={activeTab === "analytics"}
              onClick={handleTabChange}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Análisis</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="grading" activeTab={activeTab}>
            <GradingInterface />
          </TabsContent>

          <TabsContent value="rubrics" activeTab={activeTab}>
            <RubricManager />
          </TabsContent>

          <TabsContent value="items" activeTab={activeTab}>
            <EvaluationItems />
          </TabsContent>

          <TabsContent value="analytics" activeTab={activeTab}>
            <Analytics />
          </TabsContent>
        </div>
      </div>
    </div>
  );
};

export default Evaluations;
