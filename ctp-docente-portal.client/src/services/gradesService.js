// src/services/gradeService.js
const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

/** Arma URL con query params (base relativa segura) */
function buildUrl(path, params = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && `${v}` !== "") qs.set(k, v);
    });
    const query = qs.toString();
    const p = path.startsWith("/") ? path : `/${path}`;
    return `${API_BASE}${p}${query ? `?${query}` : ""}`;
}

export const gradesApi = {
    /** GET /api/report/grades => GradeReportDto[] */
    async listReport({ date, sectionId } = {}) {
        const url = buildUrl("/report/grades/detail", { date, sectionId });
        const token = localStorage.getItem("token");

        const res = await fetch(url, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error(await res.text());

        // Devuelve el DTO tal cual lo manda el BE: GradeReportDto[]
        return await res.json();
    },
};
