// src/services/attendanceService.js
// const BASE_URL = import.meta.env.VITE_API_URL ?? "https://localhost:5001";
// const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5103";
const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

/** Arma una URL segura con query params sin usar `new URL` cuando es base relativa */
function buildUrl(path, params = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && `${v}` !== "") qs.set(k, v);
    });
    const query = qs.toString();
    const p = path.startsWith("/") ? path : `/${path}`;
    return `${API_BASE}${p}${query ? `?${query}` : ""}`;
}

/** Construye Observations a partir del estado + minutos tarde + notas */
function buildObservation({ statusTypeId, minutesLate, notes }) {
    const parts = [];
    if ((statusTypeId === 4 || statusTypeId === 5) && Number(minutesLate) > 0) {
        parts.push(`[TARDE ${Number(minutesLate)}m]`);
    }
    if (statusTypeId === 3) {
        parts.push(`[JUSTIF]`);
    }
    if (notes && notes.trim()) parts.push(notes.trim());
    return parts.join(" ").trim();
}

/** Compatibilidad: acepta filas con isPresent o con statusTypeId/minutesLate */
function normalizeStudentRow(s) {
    const hasExplicit = typeof s.statusTypeId === "number";
    const statusTypeId = hasExplicit ? s.statusTypeId : (s.isPresent ? 1 : 2);
    const minutesLate = hasExplicit ? Number(s.minutesLate ?? 0) : 0;
    const observations = hasExplicit
        ? buildObservation({ statusTypeId, minutesLate, notes: s.notes ?? "" })
        : (s.notes ?? "").trim();

    // Enviamos en PascalCase para evitar cualquier sensibilidad en el binding del BE
    return {
        StudentId: Number(s.studentId),
        StatusTypeId: Number(statusTypeId),
        MinutesLate: Number(minutesLate),
        Observations: observations,
    };
}

export const attendanceApi = {
    /** Listado de asistencias (si lo usás en otra vista) */
    async list({ date, sectionId }) {
        const url = buildUrl("/attendance", { date, sectionId });
        const res = await fetch(url);
        if (!res.ok) throw new Error(await res.text());
        return await res.json();
    },

    /** Guardar asistencia grupal */
    async createGroup({ date, sectionId, subjectId, takenAt, students }) {
        const payload = {
            // Usa PascalCase para alinear con los DTOs del backend
            Date: date,                           // "YYYY-MM-DD"
            SectionId: Number(sectionId),
            SubjectId: Number(subjectId),
            TakenAt: takenAt,                     // "YYYY-MM-DDTHH:mm:00"
            Students: (students ?? []).map(normalizeStudentRow),
        };

        // console.debug("POST /attendance/group payload", payload);

        const res = await fetch(`${API_BASE}/attendance/group`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
        return true;
    },

    /** Actualizar un registro individual */
    async update({ attendanceId, statusTypeId, minutesLate, notes, isPresent }) {
        const finalStatus =
            typeof statusTypeId === "number" ? statusTypeId : isPresent ? 1 : 2;

        const body = {
            Id: attendanceId,
            StatusTypeId: Number(finalStatus),
            // opcional: MinutesLate si tu UpdateAttendanceDto lo acepta
            // MinutesLate: Number(minutesLate ?? 0),
            Observations: buildObservation({
                statusTypeId: finalStatus,
                minutesLate: minutesLate ?? 0,
                notes: notes ?? "",
            }),
        };

        const res = await fetch(`${API_BASE}/attendance`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(await res.text());
        return true;
    },

    /** Resumen por sección */
    async summary({ sectionId }) {
        const url = buildUrl("/attendance/summary", { sectionId });
        const res = await fetch(url);
        if (!res.ok) throw new Error(await res.text());
        return await res.json();
    },

    /** Roster de estudiantes por sección (nuevo endpoint con fallback al viejo) */
    async roster({ sectionId, subjectId }) {
        // Nuevo
        let url = buildUrl("/attendance/studentsList", { sectionId, subjectId });
        let res = await fetch(url);

        // Fallback al viejo si 404
        if (res.status === 404) {
            url = buildUrl("/attendance/students", { sectionId });
            res = await fetch(url);
        }

        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();


        return (data ?? []).map((s) => ({
            id: s.id,
            name: (s.fullName ?? s.name ?? "").trim().replace(/\s+/g, " "),
            fullName: (s.fullName ?? s.name ?? "").trim().replace(/\s+/g, " "),
            identificationNumber: s.identificationNumber ?? s.idNumber ?? "",
            subsection: s.subsection ?? null,
            birthDate: s.birthDate ?? null,
            genderId: s.genderId ?? null,
        }));
    },
};
