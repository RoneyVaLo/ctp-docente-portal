// src/services/sectionsService.js
import api from "./api";
function mapOptions(data) {
    return (data ?? []).map((s) => ({
        id: s.id,
        name: String(s.name ?? "").trim().replace(/\s+/g, " "),
    }));
}

export const sectionsApi = {
  async active() {
    const token = sessionStorage.getItem("token");
    const { data } = await api.get("/section/active", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return (data ?? []).map((s) => ({
      id: s.id,
      name: String(s.name ?? "")
        .trim()
        .replace(/\s+/g, " "),
    }));
  },
    async meAssigned({ academicPeriodId, subjectId } = {}) {
        const token = sessionStorage.getItem("token");
        const params = {};
        if (academicPeriodId) params.academicPeriodId = academicPeriodId;
        if (subjectId) params.subjectId = subjectId;

        const { data } = await api.get("/section/me/sections", {
            headers: { Authorization: `Bearer ${token}` },
            params,
        });
        return mapOptions(data);
    },

    // para admin: secciones asignadas a un userId concreto
    async assignedByUser(userId, { academicPeriodId, subjectId } = {}) {
        const token = sessionStorage.getItem("token");
        const params = {};
        if (academicPeriodId) params.academicPeriodId = academicPeriodId;
        if (subjectId) params.subjectId = subjectId;

        const { data } = await api.get(`/section/user/${userId}/sections`, {
            headers: { Authorization: `Bearer ${token}` },
            params,
        });
        return mapOptions(data);
    },
};