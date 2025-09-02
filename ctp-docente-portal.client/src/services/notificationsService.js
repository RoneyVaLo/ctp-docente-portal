// notificationsService.js
const RAW = import.meta.env.VITE_API_URL || '/api';  // default al proxy
const BASE_URL = (/^https?:\/\//i.test(RAW) ? RAW : RAW).replace(/\/+$/, '');

export const notificationsApi = {
    async sendAbsences({ date, sectionId, subjectId, subject }) {
        const res = await fetch(${ BASE_URL } / notifications / absences, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ date, sectionId, subjectId, subject })
        });
        if (!res.ok) throw new Error(await res.text());
        return await res.json();
    },

    async list({ date, sectionId, status, subjectId }) {
        const url = new URL(${ BASE_URL } / notifications, window.location.origin);
        if (date) url.searchParams.set("date", date);
        if (sectionId) url.searchParams.set("sectionId", sectionId);
        if (status) url.searchParams.set("status", status);
        if (subjectId) url.searchParams.set("subjectId", subjectId);
        const res = await fetch(url, { credentials: "include" });
        if (!res.ok) throw new Error(await res.text());
        return await res.json();
    },

    async resend(id) {
        const res = await fetch(${ BASE_URL } / notifications / ${ id } / resend, {
            method: "POST",
            credentials: "include"
        });
        if (!res.ok && res.status !== 204) throw new Error(await res.text());
        return true;
    },

    async testSend({ to, message }) {
        const res = await fetch(${ BASE_URL } / notifications / test, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ to, message })
        });
        if (!res.ok) throw new Error(await res.text());
        return await res.json();
    }
};