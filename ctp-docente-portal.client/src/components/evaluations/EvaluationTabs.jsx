import { BarChart3, FileText, GraduationCap, Settings } from "lucide-react";
import TabsList from "./TabsList";
import TabsTrigger from "./TabsTrigger ";
import GradingInterface from "./GradingInterface";
import EvaluationItems from "./EvaluationItems";
import TabsContent from "./TabsContent";
import Analytics from "./Analytics";

const EvaluationTabs = ({ activeTab, handleTabChange }) => {
  return (
    <>
      {/* TODO: Validar cómo se ve mejor en laptop, con "w-full" o "lg:w-fit" */}
      <TabsList className="grid w-full grid-cols-3">
        {[
          { value: "grading", icon: GraduationCap, label: "Calificaciones" },
          { value: "items", icon: FileText, label: "Items" },
          // { value: "rubrics", icon: Settings, label: "Rúbricas" },
          { value: "analytics", icon: BarChart3, label: "Análisis" },
        ].map(({ value, icon: Icon, label }) => (
          <TabsTrigger
            key={value}
            value={value}
            isActive={activeTab === value}
            onClick={handleTabChange}
          >
            <Icon className="w-4 h-4" />
            {/* {React.createElement(Icon, { className: "w-4 h-4" })} */}
            <span className="hidden sm:inline">{label}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="grading" activeTab={activeTab}>
        <GradingInterface />
      </TabsContent>
      <TabsContent value="items" activeTab={activeTab}>
        <EvaluationItems />
      </TabsContent>
      <TabsContent value="analytics" activeTab={activeTab}>
        <Analytics />
      </TabsContent>
    </>
  );
};

export default EvaluationTabs;
