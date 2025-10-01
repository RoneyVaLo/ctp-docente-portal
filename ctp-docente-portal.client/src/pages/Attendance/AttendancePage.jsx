import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { attendanceApi } from "@/services/attendanceService";
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
    Calendar,
    Clock,
    Save,
    CheckCircle,
    XCircle,
    Users,
    AlertTriangle,
    Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

function nowHHmm() {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
}
function combineDateTimeLocal(date, time) {
    const safeTime = time && /^\d{2}:\d{2}$/.test(time) ? time : "00:00";
    return `${date}T${safeTime}:00`;
}

export default function AttendancePage() {
    const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
    const initialTime = useMemo(() => nowHHmm(), []);
    const saved = ls.get("ui.attendance.filters", {}) || {};

    const [date, setDate] = useState(saved.date ?? today);
    const [time, setTime] = useState(saved.time ?? initialTime);

    const [sections, setSections] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [sectionId, setSectionId] = useState(0);
    const [subjectId, setSubjectId] = useState(saved.subjectId ?? 0);
    const [rows, setRows] = useState([]);

    const [loadingInit, setLoadingInit] = useState(true);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingRoster, setLoadingRoster] = useState(false);
    const [saving, setSaving] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingPayload, setPendingPayload] = useState(null);

    const currentKey = useMemo(
        () =>
            JSON.stringify({
                date,
                sectionId,
                subjectId,
                rows: rows.map((r) => ({
                    id: r.studentId,
                    p: r.isPresent,
                    n: (r.notes || "").trim(),
                })),
            }),
        [date, sectionId, subjectId, rows]
    );
    const [lastSavedKey, setLastSavedKey] = useState("");

    const sectionsReqIdRef = useRef(0);
    const rosterReqIdRef = useRef(0);
    const sectionCacheRef = useRef(new Map());
    const lastSectionBySubjectKey = (sid) => `ui.attendance.lastSectionBySubject.${sid}`;

    useEffect(() => {
        (async () => {
            try {
                setLoadingInit(true);
                const listSubjects = await attendanceApi.getSubjects();
                setSubjects(listSubjects ?? []);
            } catch (err) {
                console.error("Error cargando materias:", err);
                setSubjects([]);
                toast.error("No se pudieron cargar las materias.");
            } finally {
                setLoadingInit(false);
            }
        })();
    }, []);

    useEffect(() => {
        try {
            ls.set("ui.attendance.filters", { date, time, subjectId });
        } catch {
            /* no-op */
        }
    }, [date, time, subjectId]);

    useEffect(() => {
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
                const secs = await sectionsApi.meAssigned({ subjectId });
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
            } catch (err) {
                if (sectionsReqIdRef.current !== reqId) return;
                console.error("Error cargando secciones asignadas:", err);
                setSections([]);
                setSectionId(0);
                toast.error("No se pudieron cargar las secciones asignadas.");
            } finally {
                if (sectionsReqIdRef.current === reqId) setLoadingSections(false);
            }
        })();
    }, [subjectId]);

    const loadRoster = useCallback(async () => {
        if (!sectionId) {
            setRows([]);
            return;
        }
        const reqId = ++rosterReqIdRef.current;
        setLoadingRoster(true);
        try {
            const roster = await attendanceApi.roster({ sectionId, subjectId });
            if (rosterReqIdRef.current !== reqId) return;
            setRows(
                (roster ?? []).map((s) => ({
                    studentId: s.id,
                    fullName: (s.fullName ?? s.name ?? "").trim().replace(/\s+/g, " "),
                    idNumber: s.identificationNumber ?? s.idNumber ?? "",
                    guardianPhone: s.guardianPhone ?? "",
                    isPresent: true,
                    notes: "",
                }))
            );
        } catch (err) {
            if (rosterReqIdRef.current !== reqId) return;
            console.error("Error cargando estudiantes:", err);
            setRows([]);
            toast.error("No se pudo cargar el listado.");
        } finally {
            if (rosterReqIdRef.current === reqId) setLoadingRoster(false);
        }
    }, [sectionId, subjectId]);

    useEffect(() => {
        loadRoster();
    }, [loadRoster]);

    const updateRow = (id, patch) =>
        setRows((prev) => prev.map((r) => (r.studentId === id ? { ...r, ...patch } : r)));
    const markAll = (present) =>
        setRows((prev) => prev.map((r) => ({ ...r, isPresent: present })));

    async function doSave(payload) {
        await attendanceApi.createGroup(payload);
        setLastSavedKey(currentKey);
        toast.success("Asistencia guardada");
    }

    const saveGroup = async () => {
        if (!sectionId) return toast.error("Seleccioná una sección.");
        if (!subjectId) return toast.error("Seleccioná una asignatura.");
        if (!rows.length) return toast.error("No hay estudiantes cargados.");
        if (!/^\d{2}:\d{2}$/.test(time)) return toast.error("Ingresá una hora válida (HH:MM).");

        if (currentKey === lastSavedKey) {
            toast("Esta asistencia ya fue registrada.");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                date,
                sectionId,
                subjectId,
                takenAt: combineDateTimeLocal(date, time),
                students: rows.map((r) => ({
                    studentId: r.studentId,
                    statusTypeId: r.isPresent ? 1 : 2,
                    minutesLate: 0,
                    notes: r.notes,
                })),
            };
            const existing = await attendanceApi.newList({ date, sectionId, subjectId });
            if (Array.isArray(existing) && existing.length > 0) {
                setPendingPayload(payload);
                setConfirmOpen(true);
                return;
            }

            await doSave(payload);
        } catch (e) {
            console.error("Error al guardar asistencia:", e);
            toast.error(e?.message ?? "Error al guardar");
        } finally {
            setSaving(false);
        }
    };

    const total = rows.length;
    const presentCount = rows.filter((r) => r.isPresent).length;
    const absentCount = total - presentCount;

    const canSave = !saving && !loadingRoster && !!subjectId && !!sectionId && rows.length > 0;

    if (loadingInit) return <Loader1 />;

    return (
        <div className="min-h-screen bg-background dark:bg-background-dark p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-surface-dark dark:text-surface inline-flex gap-2">
                            <Users className="w-9 h-9" />
                            <span>Registro de asistencia diaria</span>
                        </h1>
                        <p className="text-surface-dark dark:text-surface mt-1">
                            Marca asistencia, añade observaciones y guarda el registro del grupo.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={saveGroup} disabled={!canSave}>
                            {saving ? (
                                <span className="inline-flex items-center">
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Guardando…
                                </span>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Guardar asistencia
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <Card className="relative z-20 overflow-visible">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Detalles de asistencia
                        </CardTitle>
                        <CardDescription>Seleccioná fecha, hora, sección y asignatura</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="flex flex-col">
                                <label className="text-xs text-surface-dark/70 dark:text-surface/70 mb-1">Fecha</label>
                                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                            </div>

                            <div className="flex flex-col">
                                <label className="text-xs text-surface-dark/70 dark:text-surface/70 mb-1 inline-flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" /> Hora
                                </label>
                                <Input type="time" step={60} value={time} onChange={(e) => setTime(e.target.value)} />
                            </div>

                            <div className="relative z-10 focus-within:z-50 focus-within:mb-64 md:focus-within:mb-0">
                                <FilterSelect
                                    label={`Sección${loadingSections ? " (cargando…)" : ""}`}
                                    value={sectionId || ""}
                                    onChange={(val) => {
                                        const id = Number(val) || 0;
                                        setSectionId(id);
                                        if (subjectId && id) {
                                            try { ls.set(lastSectionBySubjectKey(subjectId), id); } catch { }
                                        }
                                    }}
                                    options={sections}
                                    placeholder={subjectId ? "Seleccionar sección" : "Elegí una asignatura primero"}
                                    disabled={!subjectId || loadingSections}
                                />
                            </div>

                            <div className="relative z-10 focus-within:z-50 focus-within:mb-64 md:focus-within:mb-0">
                                <FilterSelect
                                    label="Asignatura"
                                    value={subjectId || ""}
                                    onChange={(val) => {
                                        setSubjectId(Number(val) || 0);
                                        setSectionId(0);
                                        setRows([]);
                                    }}
                                    options={subjects}
                                    placeholder="Seleccionar asignatura"
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                            <div className="text-sm text-surface-dark dark:text-surface">
                                {sectionId ? (
                                    <>
                                        Estudiantes: <b>{total}</b> &nbsp;|&nbsp; Presentes: <b>{presentCount}</b> &nbsp;|&nbsp; Ausentes:{" "}
                                        <b>{absentCount}</b>
                                    </>
                                ) : (
                                    "Seleccioná una sección para cargar estudiantes"
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => markAll(true)} disabled={!rows.length || loadingRoster}>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Todos presente
                                </Button>
                                <Button variant="outline" onClick={() => markAll(false)} disabled={!rows.length || loadingRoster}>
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Todos ausente
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="py-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-surface-dark dark:text-surface">Total estudiantes</p>
                                <p className="text-2xl font-bold text-surface-dark dark:text-surface">{total}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                                <Users className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="py-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-surface-dark dark:text-surface">Presentes</p>
                                <p className="text-2xl font-bold text-surface-dark dark:text-surface">{presentCount}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-300" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="py-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-surface-dark dark:text-surface">Ausentes</p>
                                <p className="text-2xl font-bold text-surface-dark dark:text-surface">{absentCount}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900">
                                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-300" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Lista de alumnos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative">
                            {loadingRoster && (
                                <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 dark:bg-background-dark/60 backdrop-blur-sm rounded-lg">
                                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                                    Cargando estudiantes…
                                </div>
                            )}

                            <div className="overflow-x-auto w-48 sm:w-56 lg:w-full mx-auto lg:mx-0">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-3 font-medium">Nombre</th>
                                            <th className="text-left p-3 font-medium">Cédula</th>
                                            <th className="text-left p-3 font-medium">Teléfono del encargado</th>
                                            <th className="text-left p-3 font-medium">Notas</th>
                                            <th className="text-center p-3 font-medium">Asistencia</th>
                                        </tr>
                                    </thead>
                                    <tbody aria-busy={loadingRoster}>
                                        {rows.map((r) => {
                                            const on = r.isPresent;
                                            return (
                                                <tr key={r.studentId} className="border-b hover:bg-muted/40">
                                                    <td className="p-3 font-medium">{r.fullName}</td>
                                                    <td className="p-3">{r.idNumber || "-"}</td>
                                                    
                                                    <td className="p-3">
                                                        {r.guardianPhone
                                                            ? (
                                                                <a
                                                                    href={`tel:${String(r.guardianPhone).split(/[\/|]/)[0].trim()}`}
                                                                    className="underline"
                                                                >
                                                                    {r.guardianPhone}
                                                                </a>
                                                            )
                                                            : "-"}
                                                    </td>
                                                    <td className="p-3">
                                                        <Input
                                                            placeholder="Observaciones"
                                                            value={r.notes}
                                                            onChange={(e) => updateRow(r.studentId, { notes: e.target.value })}
                                                            disabled={loadingRoster}
                                                        />
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <div className="inline-flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant={on ? "default" : "outline"}
                                                                onClick={() => updateRow(r.studentId, { isPresent: true })}
                                                                disabled={loadingRoster}
                                                            >
                                                                Presente
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant={!on ? "destructive" : "outline"}
                                                                onClick={() => updateRow(r.studentId, { isPresent: false })}
                                                                disabled={loadingRoster}
                                                            >
                                                                Ausente
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {sectionId > 0 && rows.length === 0 && !loadingRoster && (
                                            <tr>
                                                <td className="p-4 text-center text-surface-dark dark:text-surface" colSpan={5}>
                                                    No hay estudiantes para esta sección.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex justify-end mt-6">
                            <Button onClick={saveGroup} disabled={!canSave}>
                                {saving ? (
                                    <span className="inline-flex items-center">
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Guardando…
                                    </span>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Guardar asistencia
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {confirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setConfirmOpen(false)} aria-hidden />
                    <Card className="relative z-10 w-[95%] max-w-md overflow-visible">
                        <CardHeader>
                            <CardTitle>Asistencia ya registrada</CardTitle>
                            <CardDescription>
                                Ya existe asistencia para esta sección y asignatura el{" "}
                                {new Date(date).toLocaleDateString("es-CR")}. ¿Deseás actualizarla?
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                                Cancelar
                            </Button>
                            <Button
                                onClick={async () => {
                                    try {
                                        setConfirmOpen(false);
                                        setSaving(true);
                                        await doSave(pendingPayload);
                                        toast.success("Asistencia actualizada");
                                    } catch (e) {
                                        toast.error(e?.message ?? "Error al guardar");
                                    } finally {
                                        setSaving(false);
                                    }
                                }}
                            >
                                Actualizar
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
