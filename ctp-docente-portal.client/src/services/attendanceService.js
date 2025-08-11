import { ls } from "@/utils/localStore";

const K = { students: "students", attendances: "attendances" };

// ---- seeds mínimos (solo si no existen) ----
(function seed() {
  if (!ls.get(K.students)) {
    ls.set(K.students, [
      { id: 1, firstName: "Josafath", lastName: "", sectionId: 6 },
      { id: 2, firstName: "Carla", lastName: "Mora", sectionId: 6 },
    ]);
  }
  if (!ls.get(K.attendances)) ls.set(K.attendances, []);
})();

const d10 = (d) => new Date(d).toISOString().slice(0, 10);
const fullName = (s) => [s?.firstName, s?.lastName].filter(Boolean).join(" ").trim();

function upsertAttendance({ id, date, sectionId, studentId, statusTypeId, notes }) {
  const rows = ls.get(K.attendances, []);
  const idx = id
    ? rows.findIndex((r) => Number(r.id) === Number(id))
    : rows.findIndex(
        (r) =>
          r.date === date &&
          Number(r.sectionId) === Number(sectionId) &&
          Number(r.studentId) === Number(studentId)
      );

  const row = {
    id: idx >= 0 ? rows[idx].id : ls.nextId(K.attendances),
    date,
    sectionId: Number(sectionId),
    studentId: Number(studentId),
    statusTypeId, // 1=Presente, 2=Ausente
    notes: notes ?? "",
  };

  if (idx >= 0) rows[idx] = row; else rows.push(row);
  ls.set(K.attendances, rows);
  return row;
}

export const attendanceApi = {
  // Devuelve lo que ya espera tu AttendancePage
  async list({ date, sectionId }) {
    const dateIso = d10(date);
    const students = ls.get(K.students, []).filter(s => Number(s.sectionId) === Number(sectionId));
    const rows = ls.get(K.attendances, []).filter(r => r.date === dateIso && Number(r.sectionId) === Number(sectionId));
    const map = new Map(rows.map(r => [String(r.studentId), r]));
    return students
      .map(s => {
        const att = map.get(String(s.id));
        return {
          attendanceId: att?.id ?? 0,
          studentId: s.id,
          studentName: fullName(s),
          isPresent: att ? att.statusTypeId !== 2 : true,
          notes: att?.notes ?? "",
        };
      })
      .sort((a,b) => a.studentName.localeCompare(b.studentName, "es"));
  },

  // Guarda el grupo completo (lo llama tu botón "Guardar asistencia")
  async createGroup({ date, sectionId, students }) {
    const dateIso = d10(date);
    for (const st of students) {
      upsertAttendance({
        id: 0,
        date: dateIso,
        sectionId,
        studentId: st.studentId,
        statusTypeId: st.isPresent ? 1 : 2,
        notes: st.notes,
      });
    }
    return true;
  },

  // Actualiza 1 estudiante (si ya existe el registro)
  async update({ attendanceId, isPresent, notes }) {
    if (!attendanceId) return false;
    const rows = ls.get(K.attendances, []);
    const found = rows.find(r => Number(r.id) === Number(attendanceId));
    if (!found) return false;
    upsertAttendance({
      id: attendanceId,
      date: found.date,
      sectionId: found.sectionId,
      studentId: found.studentId,
      statusTypeId: isPresent ? 1 : 2,
      notes,
    });
    return true;
  },

  // Resumen simple (últimos 30 días)
  async summary({ date, sectionId }) {
    const since = new Date(); since.setDate(since.getDate() - 30);
    const rows = ls.get(K.attendances, []).filter(r => Number(r.sectionId) === Number(sectionId) && new Date(r.date) >= since);
    const students = ls.get(K.students, []).filter(s => Number(s.sectionId) === Number(sectionId));
    const acc = new Map();
    for (const r of rows) {
      const a = acc.get(r.studentId) || { present: 0, abs: 0 };
      if (r.statusTypeId === 2) a.abs++; else a.present++;
      acc.set(r.studentId, a);
    }
    return students.map(s => {
      const a = acc.get(s.id) || { present: 0, abs: 0 };
      return {
        studentId: s.id,
        name: fullName(s),
        unjustifiedAbsences: a.abs,
        justifiedAbsences: 0,
        unjustifiedLates: 0,
        justifiedLates: 0,
        presentCount: a.present,
      };
    });
  },
};
