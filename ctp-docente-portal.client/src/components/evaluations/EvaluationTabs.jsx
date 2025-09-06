import { BarChart3, FileText, GraduationCap } from "lucide-react";
import TabsList from "./TabsList";
import TabsTrigger from "./TabsTrigger ";
import GradingInterface from "./GradingInterface";
import EvaluationItems from "./EvaluationItems";
import TabsContent from "./TabsContent";
import Analytics from "./Analytics";

const EvaluationTabs = ({ activeTab, handleTabChange }) => {
  return (
    <>
      <TabsList className="grid w-full grid-cols-3">
        {[
          { value: "grading", icon: GraduationCap, label: "Calificaciones" },
          { value: "items", icon: FileText, label: "Items" },
          { value: "analytics", icon: BarChart3, label: "Análisis" },
          // eslint-disable-next-line no-unused-vars
        ].map(({ value, icon: Icon, label }) => (
          <TabsTrigger
            key={value}
            value={value}
            isActive={activeTab === value}
            onClick={handleTabChange}
          >
            <Icon className="w-4 h-4" />
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
