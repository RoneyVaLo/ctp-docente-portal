// src/services/sectionsService.js
import api from "./api";

export const sectionsApi = {
  async active() {
    const token = localStorage.getItem("token");
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
};
