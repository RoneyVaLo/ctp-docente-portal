import React from "react";

const AttendanceTable = ({ records, onEdit }) => {
  return (
    <div className="mt-6 bg-white p-4 rounded shadow-md">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Registros de Asistencia</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-2">Estudiante</th>
              <th className="px-4 py-2">Grupo</th>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  No hay registros disponibles.
                </td>
              </tr>
            ) : (
              records.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{item.studentName}</td>
                  <td className="px-4 py-2">{item.group}</td>
                  <td className="px-4 py-2">{item.date}</td>
                  <td className="px-4 py-2 capitalize">{item.status}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="text-blue-600 hover:underline"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceTable;
