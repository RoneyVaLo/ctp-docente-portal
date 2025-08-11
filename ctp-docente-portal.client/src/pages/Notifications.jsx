// ...imports
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { notificationsApi } from "@/services/notificationsService";

export default function NotificationsPage() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [date, setDate] = useState(today);
  const [sectionId, setSectionId] = useState(0);
  const [subject, setSubject] = useState(""); // NUEVO: materia (opcional)
  const [status, setStatus] = useState("");   // "", SENT, FAILED, QUEUED

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [testTo, setTestTo] = useState("+50687169595");
  const [testMsg, setTestMsg] = useState("Mensaje de prueba desde el portal.");

  const canQuery = sectionId > 0;

  const load = useCallback(async () => {
    if (!canQuery) return;
    setLoading(true);
    setErr("");
    try {
      // subject se envía por si tu servicio lo usa; si no, simplemente se ignora.
      const data = await notificationsApi.list
        ? await notificationsApi.list({ date, sectionId, status, subject })
        : await notificationsApi.getMessages({ date, sectionId, status, subject });
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message ?? "Error al cargar.");
    } finally {
      setLoading(false);
    }
  }, [canQuery, date, sectionId, status, subject]);

  const sendAll = useCallback(async () => {
    if (!canQuery) return;
    setLoading(true);
    setErr("");
    try {
      await notificationsApi.sendAbsences({ date, sectionId, subject });
      await load();
    } catch (e) {
      setErr(e?.message ?? "Error al enviar.");
    } finally {
      setLoading(false);
    }
  }, [canQuery, date, sectionId, subject, load]);

  const resend = useCallback(async (id) => {
    setLoading(true);
    setErr("");
    try {
      await notificationsApi.resend(id);
      await load();
    } catch (e) {
      setErr(e?.message ?? "Error al reintentar.");
    } finally {
      setLoading(false);
    }
  }, [load]);

  const testSend = useCallback(async () => {
    if (!notificationsApi.testSend) return alert("Función de prueba no disponible.");
    setLoading(true);
    setErr("");
    try {
      await notificationsApi.testSend({ to: testTo, message: testMsg });
      alert("Envío solicitado. Revisá tu WhatsApp.");
    } catch (e) {
      setErr(e?.message ?? "Error al enviar prueba.");
    } finally {
      setLoading(false);
    }
  }, [testTo, testMsg]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Notificaciones</h1>

      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-3 mb-3">
        <div className="flex flex-col">
          <label className="text-xs text-slate-600 mb-1">Fecha</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-slate-600 mb-1">Sección</label>
          <input
            type="number"
            min={0}
            value={sectionId}
            onChange={(e) => setSectionId(+e.target.value)}
            placeholder="Ej: 6"
            className="border rounded px-2 py-1 w-28"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-slate-600 mb-1">Materia</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Ej: Matemáticas"
            className="border rounded px-2 py-1 w-48"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-slate-600 mb-1">Estado</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="">Todos</option>
            <option value="SENT">Enviados</option>
            <option value="FAILED">Fallidos</option>
            <option value="QUEUED">En cola</option>
          </select>
        </div>

        <button
          onClick={sendAll}
          disabled={!canQuery || loading}
          className="bg-green-600 text-white px-3 py-1 rounded disabled:opacity-50"
        >
          Enviar ausentes
        </button>
        <button
          onClick={load}
          disabled={!canQuery || loading}
          className="bg-slate-600 text-white px-3 py-1 rounded disabled:opacity-50"
        >
          Refrescar
        </button>
      </div>

      {!canQuery && (
        <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-3">
          Ingresá un número de sección para consultar.
        </div>
      )}

      {/* Panel de prueba de envío real */}
      <div className="mb-4 p-3 border rounded bg-white">
        <div className="text-sm font-semibold mb-2">Probar envío real (WhatsApp Cloud API)</div>
        <div className="flex flex-wrap gap-2 items-center">
          <input value={testTo} onChange={e=>setTestTo(e.target.value)} className="border rounded px-2 py-1" placeholder="+50687169595" />
          <input value={testMsg} onChange={e=>setTestMsg(e.target.value)} className="border rounded px-2 py-1 flex-1 min-w-[240px]" placeholder="Mensaje..." />
          <button onClick={testSend} disabled={loading} className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50">Enviar a mi número</button>
        </div>
      </div>

      {err && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2 mb-3">{err}</div>}
      {loading && <div className="text-sm">Cargando…</div>}

      <div className="space-y-3">
        {rows.map((n) => (
          <div key={n.id} className="border rounded p-3 bg-white">
            <div className="flex justify-between">
              <div className="font-semibold">
                {n.studentName} <span className="text-slate-500">({n.phone})</span>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded ${
                  n.status === "SENT"
                    ? "bg-green-100 text-green-700"
                    : n.status === "FAILED"
                    ? "bg-red-100 text-red-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {n.status}
              </span>
            </div>
            {/* Muestra materia si existe en el registro */}
            {n.subject && <div className="text-xs text-slate-500 mt-0.5">Materia: {n.subject}</div>}

            <div className="text-sm mt-1">{n.message}</div>
            <div className="text-[12px] text-slate-500 mt-1">
              Creado: {n.createdAt ? new Date(n.createdAt).toLocaleString() : "-"}
              {n.sentAt ? ` | Enviado: ${new Date(n.sentAt).toLocaleString()}` : ""}
            </div>
            {n.status === "FAILED" && (
              <button
                onClick={() => resend(n.id)}
                disabled={loading}
                className="mt-2 text-sm bg-blue-600 text-white px-2 py-1 rounded disabled:opacity-50"
              >
                Reintentar
              </button>
            )}
          </div>
        ))}
        {rows.length === 0 && !loading && canQuery && (
          <div className="text-sm text-slate-500">Sin mensajes.</div>
        )}
      </div>
    </div>
  );
}
