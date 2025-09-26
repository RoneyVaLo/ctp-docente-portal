import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Progress } from "../components/ui/Progress";

import FilterSelect from "../components/evaluations/FilterSelect";
import EvaluationTabs from "../components/evaluations/EvaluationTabs";
import Loader1 from "../components/loaders/Loader1";
import { useEvaluation } from "../context/EvaluationContext";
import { getResponsiveGridCols } from "../utils/gradeUtils";
import { Plus } from "lucide-react";
import { NavLink } from "react-router-dom";
import SchoolIcon from "@mui/icons-material/School";
const Evaluations = () => {
  const [activeTab, setActiveTab] = useState("grading");
  const {
    loading,
    academicPeriods,
    selectedPeriod,
    setSelectedPeriod,
    subjects,
    selectedSubject,
    setSelectedSubject,
    sections,
    selectedGroup,
    setSelectedGroup,
    evaluationItems,
  } = useEvaluation();

  const handleTabChange = (tabValue) => {
    setActiveTab(tabValue);
  };

  if (loading) {
    return <Loader1 />;
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto relative">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
             <SchoolIcon fontSize="large" className="text-blue-600" />
              Sistema de Calificaciones
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Gestión integral de evaluaciones y calificaciones estudiantiles
          </p>
        </div>

        {/* Filters Section */}
        <Card className="relative z-10">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-4">
              <FilterSelect
                label="Período"
                value={selectedPeriod}
                onChange={setSelectedPeriod}
                options={academicPeriods}
                placeholder="Seleccione un Período"
              />

              <FilterSelect
                label="Asignatura"
                value={selectedSubject}
                onChange={setSelectedSubject}
                options={subjects}
                placeholder="Seleccione una Asignatura"
              />

              <FilterSelect
                label="Grupo"
                value={selectedGroup}
                onChange={setSelectedGroup}
                options={sections}
                placeholder="Seleccione un Grupo"
              />
            </div>
          </CardContent>
        </Card>

        {/* Rubric Overview */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Distribución de Rúbricas</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`grid grid-cols-2 ${getResponsiveGridCols(
                evaluationItems.length
              )} gap-4`}
            >
              {evaluationItems.length > 0 ? (
                evaluationItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col text-center p-2 gap-2 justify-between"
                  >
                    <div className="flex-grow">
                      <div className="h-full flex items-center justify-center">
                        <div className="font-medium text-sm">{item.name}</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold">{item.percentage}%</div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-center col-span-2">
                  <p className="text-gray-800 dark:text-gray-300 font-bold">
                    No hay Items de Evaluación disponibles...
                  </p>
                  <div className="mt-3">
                    <NavLink to="/item/nuevo">
                      <button className="flex items-center mt-3 px-4 py-2 bg-gray-300 dark:bg-gray-800 text-black dark:text-gray-200 font-bold rounded-xl hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors">
                        <Plus className="w-4 h-4 mr-2 font-bold" />
                        Añadir Item
                      </button>
                    </NavLink>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 mt-8">
          <EvaluationTabs
            activeTab={activeTab}
            handleTabChange={handleTabChange}
          />
        </div>
      </div>
    </div>
  );
};

export default Evaluations;
