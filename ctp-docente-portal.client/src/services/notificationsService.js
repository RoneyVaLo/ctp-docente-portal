const BASE_URL = import.meta.env.VITE_API_URL ?? "https://localhost:5001";

export const notificationsApi = {
  async sendAbsences({ date, sectionId, subject }) {
    const res = await fetch(`${BASE_URL}/api/notifications/absences`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ date, sectionId, subject })
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  },

  async list({ date, sectionId, status, subject }) {
    const url = new URL(`${BASE_URL}/api/notifications`);
    if (date) url.searchParams.set("date", date);
    if (sectionId) url.searchParams.set("sectionId", sectionId);
    if (status) url.searchParams.set("status", status);
    if (subject) url.searchParams.set("subject", subject);
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  },

  async resend(id) {
    const res = await fetch(`${BASE_URL}/api/notifications/${id}/resend`, {
      method: "POST",
      credentials: "include"
    });
    if (!res.ok && res.status !== 204) throw new Error(await res.text());
    return true;
  },

  async testSend({ to, message }) {
    const res = await fetch(`${BASE_URL}/api/notifications/test`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ to, message })
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  }
};
