import React from "react";

const Analytics = () => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-4">
        Análisis y Estadísticas
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
          <h3 className="font-medium text-slate-800 dark:text-slate-100 mb-2">
            Promedio General
          </h3>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            85.2
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            +2.3% vs mes anterior
          </p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
          <h3 className="font-medium text-slate-800 dark:text-slate-100 mb-2">
            Estudiantes Aprobados
          </h3>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            92%
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            28 de 30 estudiantes
          </p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
          <h3 className="font-medium text-slate-800 dark:text-slate-100 mb-2">
            Tareas Pendientes
          </h3>
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            5
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Por revisar
          </p>
        </div>
      </div>
      <div className="mt-6">
        <h3 className="font-medium text-slate-800 dark:text-slate-100 mb-4">
          Distribución de Calificaciones
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <span className="w-20 text-sm text-slate-600 dark:text-slate-400">
              90-100
            </span>
            <div className="flex-1 bg-slate-200 dark:bg-slate-600 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: "30%" }}
              ></div>
            </div>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              30%
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="w-20 text-sm text-slate-600 dark:text-slate-400">
              80-89
            </span>
            <div className="flex-1 bg-slate-200 dark:bg-slate-600 rounded-full h-3">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: "40%" }}
              ></div>
            </div>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              40%
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="w-20 text-sm text-slate-600 dark:text-slate-400">
              70-79
            </span>
            <div className="flex-1 bg-slate-200 dark:bg-slate-600 rounded-full h-3">
              <div
                className="bg-yellow-500 h-3 rounded-full transition-all duration-500"
                style={{ width: "22%" }}
              ></div>
            </div>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              22%
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="w-20 text-sm text-slate-600 dark:text-slate-400">
              0-69
            </span>
            <div className="flex-1 bg-slate-200 dark:bg-slate-600 rounded-full h-3">
              <div
                className="bg-red-500 h-3 rounded-full transition-all duration-500"
                style={{ width: "8%" }}
              ></div>
            </div>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              8%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
