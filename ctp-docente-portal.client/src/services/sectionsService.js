// src/services/sectionsService.js
import api from "./api";

export const sectionsApi = {
    async active() {
        const { data } = await api.get("/sections/active");
        return (data ?? []).map(s => ({
            id: s.id,
            name: String(s.name ?? "").trim().replace(/\s+/g, " "),
        }));
    },
};
