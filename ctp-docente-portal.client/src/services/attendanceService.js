const BASE_URL = import.meta.env.VITE_API_URL ?? "https://localhost:5001";

async function http(url, options) {
    const res = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        ...options,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.status === 204 ? undefined : await res.json();
}

export const attendanceApi = {
    // lista del día por sección
    list: (params: { date: string; sectionId: number }) =>
        api.get("/api/attendance", { params }).then(r => r.data),

    // resumen por estudiante de la sección (si tienes endpoint)
    summary: (params: { date: string; sectionId: number }) =>
        api.get("/api/attendance/summary", { params }).then(r => r.data),

    // ya los tienes:
    createGroup: (body: any) => api.post("/api/attendance/group", body),
    update: (body: { attendanceId: number; isPresent: boolean; notes?: string }) =>
        api.put(`/api/attendance/${body.attendanceId}`, body),
};


    update: (body) =>
        http(`${BASE_URL}/api/attendance`, {
            method: "PUT",
            body: JSON.stringify(body),
        }),

    get: (q) => {
        const qs = new URLSearchParams(
            Object.entries(q).filter(([, v]) => v != null && v !== "")
        ).toString();
        return http(`${BASE_URL}/api/attendance?${qs}`);
    },

    summary: (sectionId) =>
        http(`${BASE_URL}/api/attendance/summary?sectionId=${sectionId}`),
};
