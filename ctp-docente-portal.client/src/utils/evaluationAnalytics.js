// Función para calcular estadísticas generales
export const getClassStats = (students) => {
  const totalStudents = students.length;
  const grades = students.map((s) => s.finalGrade);
  const averageGrade = grades.reduce((a, b) => a + b, 0) / totalStudents;
  const passRate = (grades.filter((g) => g >= 60).length / totalStudents) * 100;
  const excellentRate =
    (grades.filter((g) => g >= 90).length / totalStudents) * 100;

  return {
    totalStudents,
    averageGrade: +averageGrade.toFixed(1),
    passRate: +passRate.toFixed(1),
    excellentRate: +excellentRate.toFixed(1),
  };
};

// Función para calcular distribución de calificaciones
export const getGradeDistribution = (students) => {
  const ranges = [
    {
      range: "90-100",
      min: 90,
      max: 100,
      color: "bg-green-500 dark:bg-green-600",
    },
    { range: "80-89", min: 80, max: 89, color: "bg-blue-600 dark:bg-blue-700" },
    {
      range: "70-79",
      min: 70,
      max: 79,
      color: "bg-amber-400 dark:bg-amber-500",
    },
    { range: "< 70", min: 0, max: 69, color: "bg-red-500 dark:bg-red-600" },
  ];

  const total = students.length;

  return ranges.map((r) => {
    const count = students.filter(
      (s) => s.finalGrade >= r.min && s.finalGrade <= r.max
    ).length;
    const percentage = (count / total) * 100;
    return { ...r, count, percentage: +percentage.toFixed(1) };
  });
};

// Función para calcular rendimiento por rúbrica
export const getRubricPerformance = (students, evaluationItems) => {
  return evaluationItems.map((item) => {
    const grades = students.map((s) => s.scoresByItemId[item.id] || 0);
    const average = grades.reduce((a, b) => a + b, 0) / grades.length;

    return {
      name: item.name,
      average: +average.toFixed(1),
      weight: item.percentage, // peso en la nota final
    };
  });
};

// Función para detectar estudiantes en riesgo
export const getStudentsAtRisk = (students, evaluationItems) => {
  return students
    .filter((s) => s.finalGrade < 70)
    .map((s) => {
      const issues = evaluationItems
        .filter((item) => (s.scoresByItemId[item.id] || 0) < 70)
        .map((item) => item.name);

      return {
        name: s.studentName,
        grade: +s.finalGrade.toFixed(1),
        issues,
      };
    });
};

export const getBarColor = (average) => {
  if (average >= 90) return "bg-green-500 dark:bg-green-600";
  if (average >= 80) return "bg-blue-600 dark:bg-blue-700";
  if (average >= 70) return "bg-amber-400 dark:bg-amber-500";
  return "bg-red-500 dark:bg-red-600";
};
