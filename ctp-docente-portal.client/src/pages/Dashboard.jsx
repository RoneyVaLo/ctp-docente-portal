import { useEffect, useState } from "react";
import AdminDashboard from "../components/dashboard/AdminDashboard";
import TeacherDashboard from "../components/dashboard/TeacherDashboard";
import { useAuth } from "../context/AuthContext";
import Loader1 from "../components/loaders/Loader1";
import axios from "axios";

const Dashboard = () => {
  const { roles } = useAuth();

  const API_ENDPOINTS = {
    teacher: (staffId, periodoId) =>
      `api/dashboardstatistics/teacher?staffId=${staffId}&periodoId=${periodoId}`,
    administrative: "api/dashboardstatistics/administrative",
    topSectionsAbsences: "api/dashboardstatistics/top-sections-absences",
    gradesDistribution: "api/dashboardstatistics/grades-distribution",
  };

  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(false);

  const [teacherStats, setTeacherStats] = useState({
    quantitySections: -1,
    presentStudents: -1,
    totalStudents: -1,
    pendingEvaluations: -1,
    detailEvaluations: [],
  });
  const [adminStats, setAdminStats] = useState({
    administrativeSummary: [],
    topSectionAbsences: [],
    gradeDistribution: [],
  });

  useEffect(() => {
    setIsAdmin(roles?.includes("Administrativo"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTeacherStatistics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await axios.get(API_ENDPOINTS.teacher(72, 2), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const {
        quantitySections,
        presentStudents,
        totalStudents,
        pendingEvaluations,
        detailEvaluations,
      } = data;

      setTeacherStats({
        quantitySections,
        presentStudents,
        totalStudents,
        pendingEvaluations,
        detailEvaluations,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdministrativeStatistics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
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

      setAdminStats({
        administrativeSummary: summary.data,
        topSectionAbsences: topSections.data,
        gradeDistribution: gradesDist.data,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin !== null) {
      isAdmin ? fetchAdministrativeStatistics() : fetchTeacherStatistics();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  if (loading) return <Loader1 />;

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
