const BASE_URL = import.meta.env.VITE_API_URL ?? "https://localhost:5001";

/** Construye Observations a partir del estado + minutos tarde + notas */
function buildObservation({ statusTypeId, minutesLate, notes }) {
  const parts = [];
  // 4 = Tarde (no just.), 5 = Tarde (just.)
  if ((statusTypeId === 4 || statusTypeId === 5) && Number(minutesLate) > 0) {
    parts.push(`[TARDE ${Number(minutesLate)}m]`);
  }
  // 3 = Ausente justificada
  if (statusTypeId === 3) {
    parts.push(`[JUSTIF]`);
  }
  if (notes && notes.trim()) parts.push(notes.trim());
  return parts.join(" ").trim();
}

/** Compatibilidad: acepta filas con isPresent o con statusTypeId/minutesLate */
function normalizeStudentRow(s) {
  // Si viene desde UI nueva:
  if (typeof s.statusTypeId === "number") {
    return {
      studentId: s.studentId,
      statusTypeId: s.statusTypeId,
      observations: buildObservation({
        statusTypeId: s.statusTypeId,
        minutesLate: s.minutesLate ?? 0,
        notes: s.notes ?? "",
      }),
    };
  }
  // Compatibilidad con versión anterior (solo presente/ausente):
  const status = s.isPresent ? 1 : 2;
  return {
    studentId: s.studentId,
    statusTypeId: status,
    observations: (s.notes ?? "").trim(),
  };
}

export const attendanceApi = {
  /** Listado de asistencias (si lo usás en otra vista) */
  async list({ date, sectionId }) {
    const url = new URL(`${BASE_URL}/api/attendance`);
    if (date) url.searchParams.set("date", date);
    if (sectionId) url.searchParams.set("sectionId", sectionId);
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  },

  /** Guardar asistencia grupal */
  async createGroup({ date, sectionId, students }) {
    const payload = {
      date,
      sectionId,
      students: (students ?? []).map(normalizeStudentRow),
    };
    const res = await fetch(`${BASE_URL}/api/attendance/group`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    return true;
  },

  /** Actualizar un registro individual */
  async update({ attendanceId, statusTypeId, minutesLate, notes, isPresent }) {
    // Soporta ambos formatos (nuevo y legacy con isPresent)
    const finalStatus =
      typeof statusTypeId === "number" ? statusTypeId : isPresent ? 1 : 2;

    const body = {
      id: attendanceId,
      statusTypeId: finalStatus,
      observations: buildObservation({
        statusTypeId: finalStatus,
        minutesLate: minutesLate ?? 0,
        notes: notes ?? "",
      }),
    };

    const res = await fetch(`${BASE_URL}/api/attendance`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
    return true;
    },

  /** Resumen por sección (si lo mostrás) */
  async summary({ sectionId }) {
    const url = new URL(`${BASE_URL}/api/attendance/summary`);
    url.searchParams.set("sectionId", sectionId);
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  },

  /** Roster de estudiantes por sección (sin materia) */
  async roster({ sectionId }) {
    const url = new URL(`${BASE_URL}/api/attendance/students`);
    url.searchParams.set("sectionId", sectionId);
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) throw new Error(await res.text());
    return await res.json(); // [{ id, name }]
  },
};
