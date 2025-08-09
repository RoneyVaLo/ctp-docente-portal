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
    list: ({ date, sectionId }) =>
        http(`${BASE_URL}/api/attendance?${new URLSearchParams({ date, sectionId })}`),

    summary: ({ date, sectionId }) =>
        http(`${BASE_URL}/api/attendance/summary?${new URLSearchParams({ date, sectionId })}`),

    createGroup: (body) =>
        http(`${BASE_URL}/api/attendance/group`, {
            method: "POST",
            body: JSON.stringify(body),
        }),

    update: ({ attendanceId, isPresent, notes }) =>
        http(`${BASE_URL}/api/attendance/${attendanceId}`, {
            method: "PUT",
            body: JSON.stringify({ attendanceId, isPresent, notes }),
        }),
};
