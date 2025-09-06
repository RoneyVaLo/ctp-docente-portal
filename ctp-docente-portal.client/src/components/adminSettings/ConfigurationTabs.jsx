import { lazy, Suspense } from "react";
import TabsList from "../evaluations/TabsList";
import TabsTrigger from "../evaluations/TabsTrigger ";
import { BookOpen, Calendar, UserCog, Users } from "lucide-react";
import TabsContent from "../evaluations/TabsContent";
import Loader1 from "../loaders/Loader1";

const ConfigurationTabs = ({ activeTab, handleTabChange }) => {
  const AcademicPeriods = lazy(() => import("./AcademicPeriods"));
  const Subjects = lazy(() => import("./Subjects"));
  const SectionAssignments = lazy(() => import("./SectionAssignments"));
  const EvaluationRoles = lazy(() => import("./EvaluationRoles"));

  return (
    <>
      <TabsList className="grid w-full grid-cols-4">
        {[
          { value: "periods", icon: Calendar, label: "Períodos" },
          { value: "subjects", icon: BookOpen, label: "Materias" },
          { value: "assignments", icon: Users, label: "Asignaciones" },
          { value: "roles", icon: UserCog, label: "Roles" },

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

      <Suspense fallback={<Loader1 />}>
        <TabsContent value="periods" activeTab={activeTab}>
          <AcademicPeriods />
        </TabsContent>

        <TabsContent value="subjects" activeTab={activeTab}>
          <Subjects />
        </TabsContent>

        <TabsContent value="assignments" activeTab={activeTab}>
          <SectionAssignments />
        </TabsContent>

        <TabsContent value="roles" activeTab={activeTab}>
          <EvaluationRoles />
        </TabsContent>
      </Suspense>
    </>
  );
};

export default ConfigurationTabs;
