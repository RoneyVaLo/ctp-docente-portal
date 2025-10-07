import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export const useEvaluationLogic = () => {
  const [loading, setLoading] = useState(false);

  const [academicPeriods, setAcademicPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(
    sessionStorage.getItem("selectedPeriod") || ""
  );

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(
    sessionStorage.getItem("selectedSubject") || ""
  );

  const [sections, setSections] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(
    sessionStorage.getItem("selectedGroup") || ""
  );

  const [students, setStudents] = useState([]);
  const [evaluationItems, setEvaluationItems] = useState([]);

  // Actualizar sessionStorage cuando los filtros cambien
  useEffect(() => {
    const currentPeriod = sessionStorage.getItem("selectedPeriod");

    if (selectedPeriod !== currentPeriod) {
      setSelectedSubject("");
    }

    sessionStorage.setItem("selectedPeriod", selectedPeriod);
  }, [selectedPeriod]);

  useEffect(() => {
    const currentSubject = sessionStorage.getItem("selectedSubject");

    if (selectedSubject !== currentSubject) {
      setSelectedGroup("");
    }
    sessionStorage.setItem("selectedSubject", selectedSubject);
  }, [selectedSubject]);

  useEffect(() => {
    sessionStorage.setItem("selectedGroup", selectedGroup);
  }, [selectedGroup]);

  // Obtener periodos académicos
  useEffect(() => {
    const fetchAcademicPeriods = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem("token");
        const response = await axios.get("/api/academicperiods", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAcademicPeriods(response.data);
      } catch (error) {
        toast.error(error?.response?.data?.Message);
      } finally {
        setLoading(false);
      }
    };
    fetchAcademicPeriods();
  }, []);

  // Obtener materias
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        if (selectedPeriod) {
          const token = sessionStorage.getItem("token");
          const response = await axios.get(
            `/api/subject/period/${selectedPeriod}/subjects`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          setSubjects(response.data);
        }
      } catch (error) {
        toast.error(error?.response?.data?.Message);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, [selectedPeriod]);

  // Obtener secciones
  useEffect(() => {
    const fetchSections = async () => {
      try {
        setLoading(true);
        if (selectedPeriod && selectedSubject) {
          // setSelectedGroup("");
          setStudents([]);
          setEvaluationItems([]);
          const token = sessionStorage.getItem("token");
          const response = await axios.get(
            `/api/section/period/${selectedPeriod}/subjects/${selectedSubject}/sections`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setSections(response.data);
        }
      } catch (error) {
        toast.error(error?.response?.data?.Message);
      } finally {
        setLoading(false);
      }
    };
    fetchSections();
  }, [selectedPeriod, selectedSubject]);

  const calculateFinalGrade = (grades, evaluationItems) => {
    let total = 0;
    evaluationItems.forEach((item) => {
      const grade = grades[item.id] || 0;
      total += (grade * item.percentage) / 100;
    });

    return Number(total.toFixed(1));
  };

  // Obtener evaluaciones y estudiantes
  useEffect(() => {
    const fetchEvaluationData = async () => {
      try {
        setLoading(true);
        if (selectedPeriod && selectedSubject && selectedGroup) {
          setStudents([]);
          setEvaluationItems([]);
          const token = sessionStorage.getItem("token");
          const response = await axios.get(
            `/api/evaluationscores/subject/${selectedSubject}/section/${selectedGroup}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const { items, students } = response.data;
          setEvaluationItems(items);
          setStudents(students);
          setStudents((prev) =>
            prev.map((student) => ({
              ...student,
              finalGrade: calculateFinalGrade(student.scoresByItemId, items),
            }))
          );
        }
      } catch (error) {
        toast.error(error?.response?.data?.Message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvaluationData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroup]);

  const updateEvaluationItems = (updatedItems) => {
    setEvaluationItems(updatedItems);
  };

  const calculateFinalGradeCriteria = (studentId, grades, criteria) => {
    if (!grades[studentId]) return 0;

    let finalGrade = 0;

    for (let i = 0; i < criteria.length; i++) {
      finalGrade += (grades[studentId][i] * criteria[i].weight) / 100;
    }

    return Number(finalGrade.toFixed(1));
  };

  const updateGradesWithCriteria = (item, grades) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) => {
        const newScore = calculateFinalGradeCriteria(
          student.studentId,
          grades,
          item.criteria
        );
        return {
          ...student,
          scoresByItemId: {
            ...student.scoresByItemId,
            [item.id]: newScore,
          },
        };
      })
    );
  };

  return {
    loading,
    setLoading,
    academicPeriods,
    selectedPeriod,
    setSelectedPeriod,
    subjects,
    selectedSubject,
    setSelectedSubject,
    sections,
    selectedGroup,
    setSelectedGroup,
    students,
    setStudents,
    evaluationItems,
    setEvaluationItems,
    updateEvaluationItems,
    updateGradesWithCriteria,
  };
};
