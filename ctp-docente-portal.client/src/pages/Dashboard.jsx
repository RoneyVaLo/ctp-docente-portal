import { useEffect, useState } from "react";
import AdminDashboard from "../components/dashboard/AdminDashboard";
import TeacherDashboard from "../components/dashboard/TeacherDashboard";
import { useAuth } from "../context/AuthContext";

// const attendanceData = [
//   { section: "A-1", present: 28, absent: 2 },
//   { section: "A-2", present: 25, absent: 5 },
//   { section: "B-1", present: 30, absent: 0 },
//   { section: "B-2", present: 27, absent: 3 },
// ];

const topAbsenteeismSections = [
  { section: "A-2", absent: 5, total: 30, percentage: 16.7 },
  { section: "B-2", absent: 3, total: 30, percentage: 10.0 },
  { section: "A-1", absent: 2, total: 30, percentage: 6.7 },
  { section: "B-1", absent: 0, total: 30, percentage: 0.0 },
];

const gradeDistribution = [
  { name: "Excelente (18-20)", value: 35, color: "#22c55e" },
  { name: "Bueno (16-17)", value: 40, color: "#3b82f6" },
  { name: "Regular (14-15)", value: 20, color: "#f59e0b" },
  { name: "Deficiente (<14)", value: 5, color: "#ef4444" },
];

const teacherSections = [
  { id: 1, name: "Matemáticas A-1", students: 30, present: 28, pending: 2 },
  { id: 2, name: "Matemáticas B-2", students: 30, present: 27, pending: 1 },
];

const pendingEvaluations = [
  {
    subject: "Matemáticas",
    section: "A-1",
    type: "Examen Parcial",
    pending: 5,
  },
  { subject: "Matemáticas", section: "B-2", type: "Tarea", pending: 3 },
];

const Dashboard = () => {
  const { roles } = useAuth();

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(roles?.includes("Administrativo"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {isAdmin ? (
        <AdminDashboard
          gradeDistribution={gradeDistribution}
          topAbsenteeismSections={topAbsenteeismSections}
        />
      ) : (
        <TeacherDashboard
          pendingEvaluations={pendingEvaluations}
          teacherSections={teacherSections}
        />
      )}
    </>
  );
};

export default Dashboard;
