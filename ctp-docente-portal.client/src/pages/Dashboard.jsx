import { useEffect, useState } from "react";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import TeacherDashboard from "@/components/dashboard/TeacherDashboard";
import { useAuth } from "@/context/AuthContext";
import Loader1 from "@/components/loaders/Loader1";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const API_ENDPOINTS = {
  teacher: (staffId, periodoId) =>
    `api/dashboardstatistics/teacher?staffId=${staffId}&periodoId=${periodoId}`,
  administrative: "api/dashboardstatistics/administrative",
  topSectionsAbsences: "api/dashboardstatistics/top-sections-absences",
  gradesDistribution: "api/dashboardstatistics/grades-distribution",
};

const fetchTeacherStatistics = async () => {
  const token = sessionStorage.getItem("token");
  const { data } = await axios.get(API_ENDPOINTS.teacher(72, 2), {
    headers: { Authorization: `Bearer ${token}` },
  });

  return {
    quantitySections: data.quantitySections,
    presentStudents: data.presentStudents,
    totalStudents: data.totalStudents,
    pendingEvaluations: data.pendingEvaluations,
    detailEvaluations: data.detailEvaluations,
  };
};

const fetchAdministrativeStatistics = async () => {
  const token = sessionStorage.getItem("token");
  const [summary, topSections, gradesDist] = await Promise.all([
    axios.get(API_ENDPOINTS.administrative, {
      headers: { Authorization: `Bearer ${token}` },
    }),
    axios.get(API_ENDPOINTS.topSectionsAbsences, {
      headers: { Authorization: `Bearer ${token}` },
    }),
    axios.get(API_ENDPOINTS.gradesDistribution, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  ]);

  return {
    administrativeSummary: summary.data,
    topSectionAbsences: topSections.data,
    gradeDistribution: gradesDist.data,
  };
};

const Dashboard = () => {
  const { roles } = useAuth();
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    setIsAdmin(roles?.includes("Administrativo"));
  }, [roles]);

  // 📌 Teacher query
  const {
    data: teacherStats,
    isLoading: loadingTeacher,
    error: errorTeacher,
  } = useQuery({
    queryKey: ["teacherStats"],
    queryFn: fetchTeacherStatistics,
    enabled: isAdmin === false,
    staleTime: 5 * 60 * 1000, // 5 min cache "fresh"
    cacheTime: 10 * 60 * 1000, // 10 min en memoria antes de ser garbage collected
  });

  // 📌 Admin query
  const {
    data: adminStats,
    isLoading: loadingAdmin,
    error: errorAdmin,
  } = useQuery({
    queryKey: ["adminStats"],
    queryFn: fetchAdministrativeStatistics,
    enabled: isAdmin === true,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  if (isAdmin === null) return null;

  if ((isAdmin && loadingAdmin) || (!isAdmin && loadingTeacher)) {
    return <Loader1 />;
  }

  if (errorAdmin || errorTeacher) {
    return <p>Error al cargar datos</p>;
  }

  return (
    <>
      {isAdmin ? (
        <AdminDashboard adminStats={adminStats} />
      ) : (
        <TeacherDashboard teacherStats={teacherStats} />
      )}
    </>
  );
};

export default Dashboard;
