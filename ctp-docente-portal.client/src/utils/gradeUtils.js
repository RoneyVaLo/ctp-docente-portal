import { Columns } from "lucide-react";

export const getGradeColor = (grade) => {
  if (grade >= 90) return "text-green-600 dark:text-green-400";
  if (grade >= 80) return "text-blue-600 dark:text-blue-400";
  if (grade >= 70) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
};

export const getGradeBadgeVariant = (grade) => {
  if (grade >= 90) return "default";
  if (grade >= 80) return "secondary";
  if (grade >= 70) return "outline";
  return "destructive";
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "UTC", // si quieres mantener hora en UTC
  };
  const formattedDate = date.toLocaleString("es-ES", options);
  return formattedDate;
};

export const calculateFinalGrade = (studentId, grades, criteria) => {
  if (!grades[studentId]) return 0;

  let finalGrade = 0;
  for (let i = 0; i < criteria.length; i++) {
    finalGrade += (grades[studentId][i] * criteria[i].weight) / 100;
  }
  return Math.round(finalGrade);
};

export const calculateGeneralAverage = (grades, studentScores, criteria) => {
  let sum = 0;
  let counter = 0;

  studentScores?.forEach((student) => {
    const grade = calculateFinalGrade(student.studentId, grades, criteria);
    sum += grade;
    counter++;
  });

  return counter > 0 ? (sum / counter).toFixed(1) : 0;
};

export const calculateAverageCriterion = (indexCriterion, grades) => {
  let sum = 0;
  let counter = 0;

  Object.values(grades).forEach((grades) => {
    if (grades[indexCriterion]) {
      sum += grades[indexCriterion];
      counter++;
    }
  });

  return counter > 0 ? (sum / counter).toFixed(1) : 0;
};

export const getResponsiveGridCols = (columns) => {
  if (columns === 3) return "md:grid-cols-3";
  if (columns === 4) return "md:grid-cols-3 lg:grid-cols-4";
  if (columns === 5) return "md:grid-cols-4 lg:grid-cols-5";
  if (columns >= 6) return "md:grid-cols-5 lg:grid-cols-6";

  // Valor por defecto si hay menos de 3 columnas
  return "";
};
