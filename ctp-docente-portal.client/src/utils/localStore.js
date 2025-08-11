// Utilidades simples para JSON en localStorage
export const ls = {
  get(key, fallback = null) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
    catch { return fallback; }
  },
  set(key, value) { localStorage.setItem(key, JSON.stringify(value)); },
  nextId(seqKey) {
    const k = `${seqKey}__seq`;
    const next = Number(localStorage.getItem(k) || 0) + 1;
    localStorage.setItem(k, String(next));
    return next;
  },
};
