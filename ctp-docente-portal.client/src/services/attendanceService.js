import api from "./http";

export const attendanceApi = {
  async sections() {
    const { data } = await api.get("/api/attendance/sections");
    return data; // [{ id, name }]
  },

  async roster({ sectionId }) {
    const { data } = await api.get("/api/attendance/students", {
      params: { sectionId },
    });
    return data; // [{ id, name }] o tu shape real
  },

  async createGroup({ date, sectionId, students }) {
    const payload = {
      date,
      sectionId,
      students: students.map((s) => ({
        studentId: s.studentId,
        statusTypeId: s.isPresent ? 1 : 2,
        observations: s.notes ?? "",
      })),
    };
    await api.post("/api/attendance/group", payload);
    return true;
  },

  async update({ attendanceId, isPresent, notes }) {
    await api.put("/api/attendance", {
      id: attendanceId,
      statusTypeId: isPresent ? 1 : 2,
      observations: notes ?? "",
    });
    return true;
  },

  async list({ date, sectionId }) {
    const { data } = await api.get("/api/attendance", {
      params: { date, sectionId },
    });
    return data;
  },

  async summary({ sectionId }) {
    const { data } = await api.get("/api/attendance/summary", {
      params: { sectionId },
    });
    return data;
  },
};
