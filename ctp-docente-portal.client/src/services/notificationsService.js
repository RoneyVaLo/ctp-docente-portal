import { ls } from "@/utils/localStore";

const K = { notifications: "notifications", students: "students", attendances: "attendances" };

// ---------- Seed de datos demo (últimos 10 días, 2 secciones) ----------
(function seedDemo() {
  const days = 10;
  const today = new Date();
  if (!ls.get(K.students)) {
    ls.set(K.students, [
      { id: 1, firstName: "Juan",  lastName: "Pérez", phone: "+50680000001", sectionId: 1 },
      { id: 2, firstName: "María", lastName: "Gómez", phone: "+50680000002", sectionId: 1 },
      { id: 3, firstName: "Luis",  lastName: "Soto",  phone: "+50680000003", sectionId: 2 },
      { id: 4, firstName: "Ana",   lastName: "Rojas", phone: "+50680000004", sectionId: 2 },
    ]);
  }
  if (!ls.get(K.attendances)) {
    const rows = [];
    for (let d = 0; d < days; d++) {
      const date = new Date(today); date.setDate(today.getDate() - d);
      const iso = date.toISOString().slice(0, 10);
      // alternamos ausentes/presentes
      rows.push({ id: 100 + d*10 + 1, date: iso, sectionId: 1, studentId: 1, statusTypeId: (d % 3 === 0) ? 2 : 1 });
      rows.push({ id: 100 + d*10 + 2, date: iso, sectionId: 1, studentId: 2, statusTypeId: (d % 4 === 0) ? 2 : 1 });
      rows.push({ id: 100 + d*10 + 3, date: iso, sectionId: 2, studentId: 3, statusTypeId: (d % 2 === 0) ? 2 : 1 });
      rows.push({ id: 100 + d*10 + 4, date: iso, sectionId: 2, studentId: 4, statusTypeId: (d % 5 === 0) ? 2 : 1 });
    }
    ls.set(K.attendances, rows);
  }
  if (!ls.get(K.notifications)) {
    // Pre-crear algunos mensajes con distintos estados para distintos días
    const nots = [];
    const push = (obj) => nots.push({ id: ls.nextId(K.notifications), ...obj });
    for (let d = 0; d < 5; d++) {
      const date = new Date(today); date.setDate(today.getDate() - d);
      const iso = date.toISOString().slice(0, 10);
      push({ studentId: 1, studentName: "Juan Pérez",  phone: "+50680000001", message: `Ausencia ${iso}`, status: "SENT",   createdAt: iso+"T08:00:00Z", sentAt: iso+"T08:00:10Z", date: iso, sectionId: 1 });
      push({ studentId: 2, studentName: "María Gómez", phone: "+50680000002", message: `Ausencia ${iso}`, status: "FAILED", createdAt: iso+"T09:00:00Z", sentAt: null,           date: iso, sectionId: 1, error: "Timeout" });
      push({ studentId: 3, studentName: "Luis Soto",   phone: "+50680000003", message: `Ausencia ${iso}`, status: "QUEUED", createdAt: iso+"T10:00:00Z", sentAt: null,           date: iso, sectionId: 2 });
    }
    ls.set(K.notifications, nots);
  }
})();

function fullName(s) { return [s?.firstName, s?.lastName].filter(Boolean).join(" ").trim(); }
function nowIso() { return new Date().toISOString(); }

export const notificationsApi = {
  async sendAbsences({ date, sectionId }) {
    const atts = ls.get(K.attendances, []);
    const sts  = ls.get(K.students, []);
    const nots = ls.get(K.notifications, []);

    const absentRows = atts.filter(a =>
      String(a.date) === String(date) &&
      Number(a.sectionId) === Number(sectionId) &&
      Number(a.statusTypeId) === 2
    );

    let created = 0, sent = 0, failed = 0;
    const messages = [];

    for (const a of absentRows) {
      const stu = sts.find(s => Number(s.id) === Number(a.studentId));
      const dto = {
        id: ls.nextId(K.notifications),
        studentId: a.studentId,
        studentName: fullName(stu) || `Estudiante ${a.studentId}`,
        phone: stu?.phone ?? "",
        message: `El/la estudiante ${fullName(stu) || a.studentId} se ausentó el ${new Date(date).toLocaleDateString()}.`,
        status: (a.studentId % 3 === 0) ? "FAILED" : ((a.studentId % 2 === 0) ? "QUEUED" : "SENT"),
        providerMessageId: `wa_${Date.now()}`,
        createdAt: nowIso(),
        sentAt: null,
        error: null,
        date,
        sectionId,
      };
      if (dto.status === "SENT") dto.sentAt = nowIso();
      if (dto.status === "FAILED") dto.error = "Simulado: error de red";
      nots.push(dto);
      created++; if (dto.status === "SENT") sent++; if (dto.status === "FAILED") failed++;
      messages.push(dto);
    }
    ls.set(K.notifications, nots);
    return { created, sent, failed, messages };
  },

  async list({ date, sectionId, status }) {
    const nots = ls.get(K.notifications, []);
    return nots.filter(n =>
      (!date || String(n.date) === String(date)) &&
      (!sectionId || Number(n.sectionId) === Number(sectionId)) &&
      (!status || String(n.status).toUpperCase() === String(status).toUpperCase())
    ).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async resend(id) {
    const nots = ls.get(K.notifications, []);
    const i = nots.findIndex(n => Number(n.id) === Number(id));
    if (i >= 0) {
      nots[i].status = "SENT";
      nots[i].sentAt = nowIso();
      nots[i].error = null;
      ls.set(K.notifications, nots);
      return true;
    }
    return false;
  },

  // --- Probar envío REAL vía backend (WhatsApp Cloud API) ---
  async testSend({ to, message }) {
    const BASE_URL = import.meta.env.VITE_API_URL ?? "https://localhost:5001";
    const res = await fetch(`${BASE_URL}/api/notifications/test`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ to, message }),
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  },
};
