import React, { useEffect, useState } from "react";
import { attendanceApi } from "@/services/attendanceService";

export default function AttendancePage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [sectionId, setSectionId] = useState(0);
  const [sections, setSections] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // 1) cargar secciones
  useEffect(() => {
    (async () => {
      try {
        setErr("");
        const data = await attendanceApi.sections();
        setSections(data ?? []);
      } catch {
        setErr("No se pudieron cargar las secciones");
      }
    })();
  }, []);

  // 2) cargar roster por sección (o tu lista guardada si ya la tienes)
  useEffect(() => {
    if (!sectionId) return;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const roster = await attendanceApi.roster({ sectionId });
        setRows((roster ?? []).map(s => ({
          attendanceId: 0,
          studentId: s.id,
          name: s.name,
          isPresent: true,
          notes: ""
        })));
      } catch {
        setErr("No se pudo cargar el roster de estudiantes.");
      } finally {
        setLoading(false);
      }
    })();
  }, [date, sectionId]);

  const toggle = (id, value) =>
    setRows(prev => prev.map(r => (r.studentId === id ? { ...r, isPresent: value } : r)));

  const setNotes = (id, value) =>
    setRows(prev => prev.map(r => (r.studentId === id ? { ...r, notes: value } : r)));

  const saveGroup = async () => {
    try {
      if (!sectionId || rows.length === 0) return;
      await attendanceApi.createGroup({
        date,
        sectionId,
        students: rows.map(r => ({
          studentId: r.studentId,
          isPresent: r.isPresent,
          notes: r.notes
        }))
      });
      alert("Asistencia guardada ✅");
    } catch {
      alert("No se pudo guardar la asistencia");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Registro de asistencia diaria</h1>

      <div className="flex gap-3 items-center mb-4">
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <select
          value={sectionId}
          onChange={e => setSectionId(+e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="0">Seleccione sección</option>
          {sections.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <button
          onClick={saveGroup}
          disabled={!sectionId || rows.length === 0}
          className="bg-green-600 text-white px-3 py-1 rounded disabled:opacity-50"
        >
          Guardar asistencia
        </button>
      </div>

      {!!err && <div className="text-red-600 text-sm mb-3">{err}</div>}
      {loading && <div className="text-sm text-slate-500">Cargando…</div>}

      {rows.length === 0 && !loading && sectionId !== 0 && (
        <div className="text-sm text-slate-500">No hay estudiantes para esta sección.</div>
      )}

      {rows.length > 0 && (
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-slate-100 text-left">
              <th className="p-2">Estudiante</th>
              <th className="p-2">Presente</th>
              <th className="p-2">Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.studentId} className="border-b">
                <td className="p-2">{r.name}</td>
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={r.isPresent}
                    onChange={e => toggle(r.studentId, e.target.checked)}
                  />
                </td>
                <td className="p-2">
                  <input
                    className="border rounded px-2 py-1 w-full"
                    placeholder="Observaciones"
                    value={r.notes}
                    onChange={e => setNotes(r.studentId, e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
