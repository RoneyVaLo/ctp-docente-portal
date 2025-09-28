import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { notificationsApi } from "@/services/notificationsService";
import { sectionsApi } from "@/services/sectionsService";
import { ls } from "@/utils/localStore";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import FilterSelect from "@/components/evaluations/FilterSelect";
import Loader1 from "@/components/loaders/Loader1";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/Card";

import {
    Bell,
    Loader2,
    RotateCcw,
    MailCheck,
    MailX,
    Clock4,
    Calendar,
} from "lucide-react";
import toast from "react-hot-toast";

/* ---------- utils ---------- */
function formatDate(iso) {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("es-CR");
}

function parseJwt(token) {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const json = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(json);
    } catch {
        return {};
    }
}

const lastSectionBySubjectKey = (sid) =>
    `ui.notifications.lastSectionBySubject.${sid}`;

export default function NotificationsPage() {
    const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
    const saved = ls.get("ui.notifications.filters", {}) || {};

    const [date, setDate] = useState(saved.date ?? today);
    const [sectionId, setSectionId] = useState(saved.sectionId ?? 0);
    const [subjectId, setSubjectId] = useState(saved.subjectId ?? 0);
    const [status, setStatus] = useState(saved.status ?? "");
    const canQuery = sectionId > 0;

    const [sections, setSections] = useState([]);
    const [subjects, setSubjects] = useState([]);

    const [rows, setRows] = useState([]);

    const [loadingInit, setLoadingInit] = useState(true);  
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingTable, setLoadingTable] = useState(false); 
    const [resendingId, setResendingId] = useState(null);

    /* guards anti-carreras + caché de secciones */
    const sectionsReqIdRef = useRef(0);
    const tableReqIdRef = useRef(0);
    const sectionCacheRef = useRef(new Map());

    const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
    const claims = useMemo(() => (token ? parseJwt(token) : {}), [token]);

    const userName = claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"]?.toLowerCase();
    const email = claims["http://schemas.microsoft.com/ws/2008/06/identity/claims/email"]?.toLowerCase();
    const role = claims["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]?.toLowerCase();

    const isAdminSpecial = userName === "admin_adoc" || role === "administrativo" || email === "admin.test@administracion.docente.com";

    useEffect(() => {
        try {
            ls.set("ui.notifications.filters", { date, sectionId, subjectId, status });
        } catch { }
    }, [date, sectionId, subjectId, status]);

   
    useEffect(() => {
        return () => {
            try {
                if (ls.remove) ls.remove("ui.notifications.filters");
                else localStorage.removeItem("ui.notifications.filters");
            } catch { }
            setRows([]);
        };
    }, []);

    useEffect(() => {
        (async () => {
            try {
                setLoadingInit(true);
                if (isAdminSpecial) {
                    const [sects, subs] = await Promise.all([
                        sectionsApi.active(), 
                        notificationsApi.getSubjects(),
                    ]);
                    setSections(Array.isArray(sects) ? sects : []);
                    setSubjects(Array.isArray(subs) ? subs : []);
                    setLoadingSections(false);
                } else {
                    const subs = await notificationsApi.getSubjects();
                    setSubjects(Array.isArray(subs) ? subs : []);
                }
            } catch (e) {
                console.error(e);
                toast.error("No se pudieron cargar los catálogos.");
            } finally {
                setLoadingInit(false);
            }
        })();
    }, [isAdminSpecial]);

    useEffect(() => {
        if (isAdminSpecial) return; 
        (async () => {
            if (!subjectId) {
                setSections([]);
                setSectionId(0);
                return;
            }

            const cached = sectionCacheRef.current.get(subjectId);
            if (cached) {
                setSections(cached);
                const last = Number(ls.get(lastSectionBySubjectKey(subjectId), 0)) || 0;
                if (last && cached.find((s) => s.id === last)) {
                    setSectionId(last);
                } else if (cached.length === 1) {
                    setSectionId(cached[0].id);
                } else if (sectionId && !cached.find((s) => s.id === sectionId)) {
                    setSectionId(0);
                }
                return;
            }

            const reqId = ++sectionsReqIdRef.current;
            try {
                setLoadingSections(true);
                const secs = await sectionsApi.meAssigned({ subjectId});
                if (sectionsReqIdRef.current !== reqId) return;
                sectionCacheRef.current.set(subjectId, secs);
                setSections(secs);

                const last = Number(ls.get(lastSectionBySubjectKey(subjectId), 0)) || 0;
                if (last && secs.find((s) => s.id === last)) {
                    setSectionId(last);
                } else if (secs.length === 1) {
                    setSectionId(secs[0].id);
                } else if (sectionId && !secs.find((s) => s.id === sectionId)) {
                    setSectionId(0);
                }
            } catch (e) {
                if (sectionsReqIdRef.current !== reqId) return;
                console.error("Error cargando secciones asignadas:", e);
                setSections([]);
                setSectionId(0);
                toast.error("No se pudieron cargar las secciones asignadas.");
            } finally {
                if (sectionsReqIdRef.current === reqId) setLoadingSections(false);
            }
        })();
    }, [subjectId, isAdminSpecial]);

    const load = useCallback(async () => {
        if (!canQuery) {
            setRows([]);
            return;
        }
        const reqId = ++tableReqIdRef.current;
        setLoadingTable(true);
        try {
            const data = await notificationsApi.list({ date, sectionId, status, subjectId });
            if (tableReqIdRef.current !== reqId) return;
            setRows(Array.isArray(data) ? data : []);
        } catch (e) {
            if (tableReqIdRef.current !== reqId) return;
            console.error("Error al cargar notificaciones:", e);
            setRows([]);
            toast.error("No se pudieron cargar las notificaciones.");
        } finally {
            if (tableReqIdRef.current === reqId) setLoadingTable(false);
        }
    }, [canQuery, date, sectionId, status, subjectId]);


    useEffect(() => {
        if (loadingInit) return;
        const t = setTimeout(() => load(), 250);
        return () => clearTimeout(t);
    }, [sectionId, subjectId, status, date, loadingInit, load]);

    const resend = useCallback(
        async (id) => {
            try {
                setResendingId(id);
                await notificationsApi.resend(id);
                await load();
                toast.success("Mensaje reenviado");
            } catch (e) {
                console.error("Error al reintentar envío:", e);
                toast.error("No se pudo reenviar el mensaje.");
            } finally {
                setResendingId(null);
            }
        },
        [load]
    );

    const stats = useMemo(() => {
        let sent = 0,
            failed = 0,
            queued = 0;
        for (const r of rows) {
            if (r.status === "SENT") sent++;
            else if (r.status === "FAILED") failed++;
            else if (r.status === "QUEUED") queued++;
        }
        return { sent, failed, queued, total: rows.length };
    }, [rows]);

    const statusTabs = [
        { id: "", label: "Todos" },
        { id: "SENT", label: "Enviados" },
        { id: "FAILED", label: "Fallidos" },
        { id: "QUEUED", label: "En cola" },
    ];

    if (loadingInit) return <Loader1 />;

    return (
        <div className="min-h-screen bg-background dark:bg-background-dark p-6">
            <div className="mx-auto max-w-7xl space-y-6">
              
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-surface-dark dark:text-surface inline-flex items-center gap-2">
                            <Bell className="w-9 h-9" />
                            Notificaciones
                        </h1>
                        <p className="text-surface-dark/80 dark:text-surface/80 mt-1">
                            Consulta y filtra los avisos enviados a responsables.
                        </p>
                    </div>
                </div>
             
                <Card className="relative z-20 sticky top-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 dark:supports-[backdrop-filter]:bg-background-dark/80 overflow-visible">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Filtros
                        </CardTitle>
                        <CardDescription>Fecha, sección, asignatura y estado</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                            <div className="lg:col-span-2">
                                <label className="text-xs text-surface-dark/70 dark:text-surface/70 mb-1 block">
                                    Fecha
                                </label>
                                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                            </div>

                            <div className="lg:col-span-3 relative z-10 focus-within:z-50 focus-within:mb-64 lg:focus-within:mb-0">
                                <FilterSelect
                                    label={`Sección${!isAdminSpecial && loadingSections ? " (cargando…)" : ""}`}
                                    value={sectionId || ""}
                                    onChange={(val) => {
                                        const id = Number(val) || 0;
                                        setSectionId(id);
                                      
                                        if (!isAdminSpecial && subjectId && id) {
                                            try {
                                                ls.set(lastSectionBySubjectKey(subjectId), id);
                                            } catch { }
                                        }
                                    }}
                                    options={sections}
                                    placeholder={
                                        !isAdminSpecial
                                            ? subjectId
                                                ? "Seleccionar sección"
                                                : "Elegí una asignatura primero"
                                            : "Seleccionar sección"
                                    }
                                    disabled={!isAdminSpecial && (!subjectId || loadingSections)}
                                />
                            </div>

                            <div className="lg:col-span-3 relative z-10 focus-within:z-50 focus-within:mb-64 lg:focus-within:mb-0">
                                <FilterSelect
                                    label="Asignatura"
                                    value={subjectId || ""}
                                    onChange={(val) => {
                                        setSubjectId(Number(val) || 0);
                                      
                                        if (!isAdminSpecial) {
                                            setSectionId(0);
                                            setRows([]);
                                        }
                                    }}
                                    options={subjects}
                                    placeholder="Seleccionar asignatura"
                                />
                            </div>

                            <div className="lg:col-span-4">
                                <label className="text-xs text-surface-dark/70 dark:text-surface/70 mb-1 block">
                                    Estado
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {statusTabs.map((t) => (
                                        <Button
                                            key={t.id || "all"}
                                            variant={status === t.id ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setStatus(t.id)}
                                        >
                                            {t.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

    
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="py-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-surface-dark dark:text-surface">Enviados</p>
                                <p className="text-2xl font-bold text-surface-dark dark:text-surface">{stats.sent}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                                <MailCheck className="w-6 h-6 text-green-600 dark:text-green-300" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="py-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-surface-dark dark:text-surface">Fallidos</p>
                                <p className="text-2xl font-bold text-surface-dark dark:text-surface">{stats.failed}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900">
                                <MailX className="w-6 h-6 text-red-600 dark:text-red-300" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="py-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-surface-dark dark:text-surface">En cola</p>
                                <p className="text-2xl font-bold text-surface-dark dark:text-surface">{stats.queued}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900">
                                <Clock4 className="w-6 h-6 text-yellow-600 dark:text-yellow-300" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent>
                        <div className="relative">
                            {loadingTable && (
                                <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 dark:bg-background-dark/60 backdrop-blur-sm rounded-lg">
                                    <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                                    Cargando…
                                </div>
                            )}

                            <div className="overflow-x-auto w-48 sm:w-56 lg:w-full mx-auto lg:mx-0">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-3 font-medium">Estudiante</th>
                                            <th className="text-left p-3 font-medium">Teléfono</th>
                                            <th className="text-left p-3 font-medium">Mensaje</th>
                                            <th className="text-left p-3 font-medium">Fecha</th>
                                            <th className="text-left p-3 font-medium">Sección</th>
                                            <th className="text-left p-3 font-medium">Estado</th>
                                            <th className="text-right p-3 font-medium">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {!loadingTable && canQuery && rows.length === 0 && (
                                            <tr>
                                                <td className="p-6 text-center text-surface-dark dark:text-surface" colSpan={7}>
                                                    No hay notificaciones para los filtros seleccionados.
                                                </td>
                                            </tr>
                                        )}

                                        {rows.map((n) => (
                                            <tr key={n.id} className="border-b hover:bg-muted/40">
                                                <td className="p-3 font-medium">{n.studentName}</td>
                                                <td className="p-3">{n.phone}</td>
                                                <td className="p-3 max-w-[34rem] truncate" title={n.message}>
                                                    {n.message}
                                                </td>
                                                <td className="p-3">{formatDate(n.date)}</td>
                                                <td className="p-3">{n.sectionName ?? n.sectionId}</td>
                                                <td className="p-3">
                                                    {n.status === "SENT" && (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/50 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-300">
                                                            <MailCheck className="w-3.5 h-3.5" /> Enviado
                                                        </span>
                                                    )}
                                                    {n.status === "FAILED" && (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-900/50 px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-300">
                                                            <MailX className="w-3.5 h-3.5" /> Fallido
                                                        </span>
                                                    )}
                                                    {n.status === "QUEUED" && (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 dark:bg-yellow-900/50 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:text-yellow-300">
                                                            <Clock4 className="w-3.5 h-3.5" /> En cola
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-3 text-right">
                                                    {n.status === "FAILED" && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => resend(n.id)}
                                                            disabled={resendingId === n.id || loadingTable}
                                                        >
                                                            {resendingId === n.id ? (
                                                                <span className="inline-flex items-center">
                                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                    Reintentando…
                                                                </span>
                                                            ) : (
                                                                <>
                                                                    <RotateCcw className="w-4 h-4 mr-2" />
                                                                    Reintentar
                                                                </>
                                                            )}
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
