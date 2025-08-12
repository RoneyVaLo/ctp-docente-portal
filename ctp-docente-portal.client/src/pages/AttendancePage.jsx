import React, { useEffect, useMemo, useState, useCallback } from "react";
import { attendanceApi } from "@/services/attendanceService";
import { ls } from "@/utils/localStore";

const STATUS = [
  { id: 1, label: "Presente" },
  { id: 2, label: "Ausente (no just.)" },
  { id: 3, label: "Ausente (just.)" },
  { id: 4, label: "Tarde (no just.)" },
  { id: 5, label: "Tarde (just.)" },
];

export default function AttendancePage() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const saved = ls.get("ui.attendance.filters", {});
  const [date, setDate] = useState(saved.date ?? today);
  const [sectionId, setSectionId] = useState(saved.sectionId ?? 0);

  const [rows, setRows] = useState([]);   // { studentId, name, statusTypeId, minutesLate, notes }
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  // Persistir filtros para reusar en Notificaciones
  useEffect(() => {
    ls.set("ui.attendance.filters", { date, sectionId });
  }, [date, sectionId]);

  const loadRoster = useCallback(async () => {
    if (!sectionId) { setRows([]); return; }
    setLoading(true);
    try {
      const roster = await attendanceApi.roster({ sectionId });
      setRows(
        (roster ?? []).map(r => ({
          studentId: r.id,
          name: (r.name ?? "").trim().replace(/\s+/g, " "),
          statusTypeId: 1,   // por defecto presente
          minutesLate: 0,
          notes: ""
        }))
      );
    } finally {
      setLoading(false);
    }
  }, [sectionId]);

  useEffect(() => {
    loadRoster();
  }, [loadRoster]);

  const updateRow = (id, patch) =>
    setRows(prev => prev.map(r => (r.studentId === id ? { ...r, ...patch } : r)));

  const saveGroup = async () => {
    if (!sectionId || rows.length === 0) return;
    setLoading(true);
    try {
      await attendanceApi.createGroup({
        date,
        sectionId,
        students: rows.map(r => ({
          studentId: r.studentId,
          statusTypeId: r.statusTypeId,
          minutesLate: Number(r.minutesLate || 0),
          notes: (r.notes || "").trim()
        })),
      });
      setToast("✅ Asistencia guardada");
      setTimeout(() => setToast(""), 2500);
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
          <input
            type="number"
            value={sectionId}
            onChange={e => setSectionId(+e.target.value || 0)}
            placeholder="Ej: 1"
            className="w-full border rounded px-2 py-1"
          />
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-slate-500">
          {sectionId ? (loading ? "Cargando estudiantes…" : `Estudiantes: ${rows.length}`) : "Ingresá una sección"}
        </div>
        <button
          onClick={saveGroup}
          disabled={loading || rows.length === 0 || !sectionId}
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
        {rows.map(r => {
          const showLate = r.statusTypeId === 4 || r.statusTypeId === 5;
        return (
          <div key={r.studentId} className="bg-white border rounded p-2 flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1">
              <div className="font-medium">{r.name}</div>
              <input
                className="text-sm w-full border rounded px-2 py-1 mt-1"
                placeholder="Notas / observaciones"
                value={r.notes}
                onChange={e => updateRow(r.studentId, { notes: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                className="border rounded px-2 py-1"
                value={r.statusTypeId}
                onChange={e => updateRow(r.studentId, { statusTypeId: +e.target.value })}
              >
                {STATUS.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>

              {showLate && (
                <input
                  type="number"
                  min={0}
                  max={59}
                  className="w-24 border rounded px-2 py-1"
                  placeholder="Min"
                  value={r.minutesLate}
                  onChange={e => updateRow(r.studentId, { minutesLate: e.target.value })}
                  title="Minutos tarde"
                />
              )}
            </div>
          </div>
        );})}

        {!loading && rows.length === 0 && sectionId > 0 && (
          <div className="text-sm text-slate-500">No hay estudiantes para esta sección.</div>
        )}
      </div>
    </div>
  );
}
