import React, { useEffect, useMemo, useState, useCallback } from "react";
import { attendanceApi } from "@/services/attendanceService";
import { ls } from "@/utils/localStore";

export default function AttendancePage() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const saved = ls.get("ui.attendance.filters", {});
  const [date, setDate] = useState(saved.date ?? today);

  // Sección seleccionada
  const [sectionId, setSectionId] = useState(saved.sectionId ?? 0);
  const [sections, setSections] = useState([]); // [{id,name,studentsCount}]

  // (opcional) Asignatura como texto libre
  const [subject, setSubject] = useState(saved.subject ?? "");

  // Roster de estudiantes
  const [rows, setRows] = useState([]);   // { studentId, name, isPresent, notes }
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  // Persistir filtros
  useEffect(() => {
    ls.set("ui.attendance.filters", { date, sectionId, subject });
  }, [date, sectionId, subject]);

  // 1) Cargar secciones para el combo
  useEffect(() => {
    (async () => {
      try {
        const data = await attendanceApi.sections();
        setSections(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // 2) Cargar estudiantes de la sección
  const loadRoster = useCallback(async () => {
    if (!sectionId) { setRows([]); return; }
    setLoading(true);
    try {
      const roster = await attendanceApi.roster({ sectionId });
      setRows(
        (roster ?? []).map(r => ({
          studentId: r.id,
          name: (r.name ?? "").trim().replace(/\s+/g, " "),
          isPresent: true,
          notes: ""
        }))
      );
    } finally {
      setLoading(false);
    }
  }, [sectionId]);

  // 3) (opcional) cargar resumen por sección
  const loadSummary = useCallback(async () => {
    if (!sectionId) { setSummary([]); return; }
    const data = await attendanceApi.summary({ sectionId });
    setSummary(Array.isArray(data) ? data : []);
  }, [sectionId]);

  useEffect(() => {
    loadRoster();
    loadSummary();
  }, [loadRoster, loadSummary]);

  const updateRow = (id, patch) =>
    setRows(prev => prev.map(r => r.studentId === id ? { ...r, ...patch } : r));

  const saveGroup = async () => {
    if (!sectionId) return alert("Seleccioná una sección.");
    setLoading(true);
    try {
      await attendanceApi.createGroup({
        date,
        sectionId,
        students: rows.map(r => ({
          studentId: r.studentId,
          isPresent: r.isPresent,
          notes: r.notes
        }))
      });
      setToast("✅ Asistencia guardada");
      setTimeout(() => setToast(""), 3000);
      await loadSummary();
    } catch (e) {
      alert(e?.message ?? "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Registro de asistencia diaria</h1>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs text-slate-500">Fecha</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full border rounded px-2 py-1"
          />
        </div>

        <div>
          <label className="text-xs text-slate-500">Sección</label>
          <select
            value={sectionId}
            onChange={e => setSectionId(+e.target.value || 0)}
            className="w-full border rounded px-2 py-1"
          >
            <option value={0}>Seleccione una sección…</option>
            {sections.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} {s.studentsCount ? `(${s.studentsCount})` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="text-xs text-slate-500">Asignatura</label>
          <input
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Ej: Matemáticas"
            className="w-full border rounded px-2 py-1"
          />
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-slate-500">
          {sectionId ? (loading ? "Cargando estudiantes…" : `Estudiantes: ${rows.length}`) : "Elegí una sección para cargar estudiantes"}
        </div>
        <button
          onClick={saveGroup}
          disabled={loading || !sectionId}
          className="bg-green-600 text-white px-3 py-1 rounded disabled:opacity-50"
        >
          Guardar asistencia
        </button>
      </div>

      {toast && (
        <div className="mb-3 text-sm bg-green-50 border border-green-200 text-green-700 rounded px-3 py-2">
          {toast}
        </div>
      )}

      {/* Lista de estudiantes */}
      <div className="space-y-2">
        {rows.map(r => (
          <div key={r.studentId} className="bg-white border rounded p-2 flex items-center gap-3">
            <div className="flex-1">
              <div className="font-medium">{r.name}</div>
              <input
                className="text-sm w-full border rounded px-2 py-1 mt-1"
                placeholder="Observaciones"
                value={r.notes}
                onChange={e => updateRow(r.studentId, { notes: e.target.value })}
              />
            </div>
            <select
              className="border rounded px-2 py-1"
              value={r.isPresent ? "1" : "2"}
              onChange={e => updateRow(r.studentId, { isPresent: e.target.value === "1" })}
            >
              <option value="1">Presente</option>
              <option value="2">Ausente</option>
            </select>
          </div>
        ))}
        {!loading && rows.length === 0 && sectionId > 0 && (
          <div className="text-sm text-slate-500">No hay estudiantes para esta sección.</div>
        )}
      </div>

      {/* Resumen (si tu API lo devuelve) */}
      {summary?.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Resumen</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {summary.map(s => (
              <div key={s.studentId} className="border rounded p-3 bg-white">
                <div className="font-medium">{s.name}</div>
                <div className="text-sm text-slate-600">
                  Ausencias injustificadas: {s.unjustifiedAbsences} ·
                  Ausencias justificadas: {s.justifiedAbsences} ·
                  Tardías injustificadas: {s.unjustifiedLates} ·
                  Tardías justificadas: {s.justifiedLates} ·
                  Presente: {s.presentCount}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
