import { useState } from "react";

function AttendanceForm({ setStudents }) {
  const [form, setForm] = useState({
    date: "",
    group: "",
    institution: "",
    subject: "",
    period: "",
    students: [],
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleStudentChange = (index, field, value) => {
    const updatedStudents = [...form.students];
    updatedStudents[index][field] = value;
    setForm({ ...form, students: updatedStudents });
  };

  const handleAddStudent = () => {
    setForm({
      ...form,
      students: [...form.students, { name: "", status: "presente" }],
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStudents(form.students);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <h1 className="text-2xl font-bold text-green-500 mb-4">
        Registro de asistencia diaria
      </h1>

      {/* Formulario */}
      <div className="max-w-4xl mx-auto bg-slate-800 p-6 rounded-2xl shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Registrar asistencia</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-1 text-sm font-medium">Periodo</label>
              <select
                name="period"
                value={form.period}
                onChange={handleChange}
                className="w-full border border-gray-600 rounded px-3 py-2 bg-slate-700 text-white"
              >
                <option value="">Seleccione</option>
                <option value="1">1° periodo</option>
                <option value="2">2° periodo</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Institución</label>
              <select
                name="institution"
                value={form.institution}
                onChange={handleChange}
                className="w-full border border-gray-600 rounded px-3 py-2 bg-slate-700 text-white"
              >
                <option value="">Seleccione</option>
                <option value="ctp">C.T.P LOS CHILES</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Asignatura</label>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="Ej: Matemáticas"
                className="w-full border border-gray-600 rounded px-3 py-2 bg-slate-700 text-white"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Grupo</label>
              <input
                type="text"
                name="group"
                value={form.group}
                onChange={handleChange}
                placeholder="Ej: 11-3"
                className="w-full border border-gray-600 rounded px-3 py-2 bg-slate-700 text-white"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Fecha</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full border border-gray-600 rounded px-3 py-2 bg-slate-700 text-white"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">Estudiantes</label>
            <button
              type="button"
              onClick={handleAddStudent}
              className="bg-blue-600 text-white px-4 py-1 rounded mb-3 hover:bg-blue-700"
            >
              + Agregar estudiante
            </button>

            {form.students.map((student, index) => (
              <div key={index} className="flex gap-4 mb-2">
                <input
                  type="text"
                  placeholder="Nombre"
                  value={student.name}
                  onChange={(e) =>
                    handleStudentChange(index, "name", e.target.value)
                  }
                  className="flex-1 border border-gray-600 rounded px-3 py-2 bg-slate-700 text-white"
                  required
                />
                <select
                  value={student.status}
                  onChange={(e) =>
                    handleStudentChange(index, "status", e.target.value)
                  }
                  className="border border-gray-600 rounded px-3 py-2 bg-slate-700 text-white"
                >
                  <option value="presente">Presente</option>
                  <option value="ausente">Ausente</option>
                  <option value="justificado">Justificado</option>
                </select>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Guardar asistencia
          </button>
        </form>
      </div>
    </div>
  );
}

export default AttendanceForm;
