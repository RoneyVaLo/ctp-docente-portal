import React from "react";

const AttendanceFilters = ({ filters, onChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...filters, [name]: value });
  };

  return (
    <div className="bg-white p-4 rounded shadow-md mb-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Filtros</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Fecha</label>
          <input
            type="date"
            name="date"
            value={filters.date}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Grupo</label>
          <input
            type="text"
            name="group"
            value={filters.group}
            onChange={handleChange}
            placeholder="Ej: 10-2"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Estado</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Todos</option>
            <option value="presente">Presente</option>
            <option value="ausente">Ausente</option>
            <option value="justificado">Justificado</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default AttendanceFilters;
