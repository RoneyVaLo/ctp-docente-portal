import React, { useEffect, useMemo, useState, useCallback } from "react";
import { attendanceApi } from "@/services/attendanceService";
import { sectionsApi } from "@/services/sectionsService";
import { ls } from "@/utils/localStore";
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Chip,
} from "@mui/material";

// Opciones "quemadas" de asignaturas (ajusta ids/nombres a tu catálogo real)
const SUBJECT_OPTIONS = [
    { id: 1, name: "Matemáticas" },
    { id: 2, name: "Español" },
    { id: 3, name: "Ciencias" },
    { id: 4, name: "Estudios Sociales" },
    { id: 5, name: "Inglés" },
];

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

function formatBirth(iso) {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    if (d.getUTCFullYear() === 1970) return "-";
    return d.toLocaleDateString("es-CR");
}

export default function AttendancePage() {
    const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
    const initialTime = useMemo(() => nowHHmm(), []);
    const saved = ls.get("ui.attendance.filters", {}) || {};

    const [date, setDate] = useState(saved.date ?? today);
    const [time, setTime] = useState(saved.time ?? initialTime); 

    const [sectionId, setSectionId] = useState(0);
    const [subject, setSubject] = useState(saved.subject ?? "");
    const [subjectId, setSubjectId] = useState(saved.subjectId ?? 0);

    const [sections, setSections] = useState([]);
    const [loadingSections, setLoadingSections] = useState(false);

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState("");


    useEffect(() => {
        try {
            ls.set("ui.attendance.filters", { date, time, subject, subjectId });
        } catch (err) {
            console.warn("No se pudo persistir filtros en localStorage", err);
        }
    }, [date, time, subject, subjectId]);


    useEffect(() => {
        (async () => {
            setLoadingSections(true);
            try {
                const list = await sectionsApi.active();
                setSections(list);
            } catch (err) {
                console.error("Error cargando secciones:", err);
                setSections([]);
            } finally {
                setLoadingSections(false);
            }
        })();
    }, []);

    const loadRoster = useCallback(async () => {
        if (!sectionId) {
            setRows([]);
            return;
        }
        setLoading(true);
        try {
            const roster = await attendanceApi.roster({ sectionId, subjectId });
            setRows(
                (roster ?? []).map((s) => ({
                    studentId: s.id,
                    fullName: (s.fullName ?? s.name ?? "").trim().replace(/\s+/g, " "),
                    idNumber: s.identificationNumber ?? s.idNumber ?? "",
                    subsection: s.subsection ?? null,
                    birthDate: s.birthDate ?? null,
                    genderId: s.genderId ?? null,
                    isPresent: true,
                    notes: "",
                }))
            );
        } catch (err) {
            console.error("Error cargando estudiantes:", err);
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, [sectionId, subjectId]);

    useEffect(() => {
        loadRoster();
    }, [loadRoster]);

    const updateRow = (id, patch) =>
        setRows((prev) => prev.map((r) => (r.studentId === id ? { ...r, ...patch } : r)));

    const markPresent = (id, present) => updateRow(id, { isPresent: present });

    const markAll = (present) => setRows((prev) => prev.map((r) => ({ ...r, isPresent: present })));

    const resetAll = useCallback(() => {
        setRows([]);
        setSectionId(0);
        setSubject("");
        setSubjectId(0);
        setDate(today);
        setTime(nowHHmm());
        try {
            ls.set("ui.attendance.filters", {
                date: today,
                time: nowHHmm(),
                subject: "",
                subjectId: 0,
            });
        } catch (err) {
            console.warn("No se pudo limpiar filtros en localStorage", err);
        }
    }, [today]);

    const saveGroup = async () => {
        if (!sectionId) return alert("Seleccioná una sección.");
        if (!subjectId) return alert("Seleccioná una asignatura.");
        if (!rows.length) return alert("No hay estudiantes cargados.");
        if (!/^\d{2}:\d{2}$/.test(time)) return alert("Ingresá una hora válida (HH:MM).");

        setLoading(true);
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

            await attendanceApi.createGroup(payload);

            setToast("✅ Asistencia guardada");
            setTimeout(() => setToast(""), 3000);

            resetAll();
        } catch (e) {
            console.error("Error al guardar asistencia:", e);
            alert(e?.message ?? "Error al guardar");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Registro de asistencia diaria</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                    <label className="text-xs text-slate-500">Fecha</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full border rounded px-2 py-1"
                    />
                </div>

                <div className="w-40 sm:w-48 md:w-56">
                    <label className="text-xs text-slate-500">Hora</label>
                    <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        step={60}                    
                        className="w-full border rounded px-2 py-1"
                        aria-label="Hora de toma (editable)"
                    />
                </div>

                <div>
                    <label className="text-xs text-slate-500 block mb-1">Sección</label>
                    <FormControl fullWidth size="small">
                       
                        <Select
                            labelId="section-label"
                            label="Sección"
                            value={sectionId || ""}
                            onChange={(e) => setSectionId(Number(e.target.value) || 0)}
                            displayEmpty
                            renderValue={(selected) => {
                                if (!selected) return "Seleccioná una sección";
                                const item = sections.find((s) => s.id === selected);
                                return item ? item.name : selected;
                            }}
                        >
                            <MenuItem value="">
                                <em>Seleccioná una sección</em>
                            </MenuItem>
                            {loadingSections && (
                                <MenuItem disabled>
                                    <div className="flex items-center gap-2">
                                        <CircularProgress size={16} /> Cargando…
                                    </div>
                                </MenuItem>
                            )}
                            {sections.map((s) => (
                                <MenuItem key={s.id} value={s.id}>
                                    {s.name}
                                </MenuItem>
                            ))}
                            {!loadingSections && sections.length === 0 && (
                                <MenuItem disabled>(Sin secciones activas)</MenuItem>
                            )}
                        </Select>
                    </FormControl>
                </div>

                <div className="w-50 sm:w-50 md:w-70">
                    <label className="text-xs text-slate-500 block mb-1">Asignatura</label>
                    <FormControl fullWidth size="small">
                       
                        <Select
                            labelId="subject-label"
                            label="Asignatura"
                            value={subjectId || ""}
                            onChange={(e) => {
                                const val = Number(e.target.value) || 0;
                                setSubjectId(val);
                                const found = SUBJECT_OPTIONS.find((s) => s.id === val);
                                setSubject(found?.name ?? "");
                            }}
                            displayEmpty
                            renderValue={(selected) => {
                                if (!selected) return "Seleccioná una asignatura";
                                const item = SUBJECT_OPTIONS.find((s) => s.id === selected);
                                return item ? item.name : selected;
                            }}
                        >
                            <MenuItem value="">
                                <em>Seleccioná una asignatura</em>
                            </MenuItem>
                            {SUBJECT_OPTIONS.map((s) => (
                                <MenuItem key={s.id} value={s.id}>
                                    {s.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>
            </div>

            <div className="mb-3 flex items-center justify-between">
                <div className="text-sm text-slate-500">
                    {sectionId
                        ? loading
                            ? "Cargando estudiantes…"
                            : `Estudiantes: ${rows.length}`
                        : "Seleccioná sección para cargar estudiantes"}
                </div>
                <div className="flex gap-2">
                    <Button variant="outlined" size="small" onClick={() => markAll(true)} disabled={!rows.length}>
                        Todos Presente
                    </Button>
                    <Button variant="outlined" size="small" onClick={() => markAll(false)} disabled={!rows.length}>
                        Todos Ausente
                    </Button>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={saveGroup}
                        disabled={loading || !sectionId || !subjectId || !rows.length}
                    >
                        Guardar asistencia
                    </Button>
                </div>
            </div>

            {toast && (
                <div className="mb-3 text-sm bg-green-50 border border-green-200 text-green-700 rounded px-3 py-2">
                    {toast}
                </div>
            )}

            <TableContainer component={Paper} elevation={0} className="border">
                <Table size="small">
                    <TableHead className="bg-slate-50">
                        <TableRow>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Cédula</TableCell>
                            <TableCell>Subsec.</TableCell>
                            <TableCell>Nacimiento</TableCell>
                            <TableCell>Notas</TableCell>
                            <TableCell align="right">Asistencia</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((r) => (
                            <TableRow key={r.studentId}>
                                <TableCell className="font-medium">{r.fullName}</TableCell>
                                <TableCell>{r.idNumber || "-"}</TableCell>
                                <TableCell>{r.subsection ?? "-"}</TableCell>
                                <TableCell>{formatBirth(r.birthDate)}</TableCell>
                                <TableCell>
                                    <input
                                        className="text-sm w-full border rounded px-2 py-1"
                                        placeholder="Observaciones"
                                        value={r.notes}
                                        onChange={(e) => updateRow(r.studentId, { notes: e.target.value })}
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <div className="flex items-center gap-2 justify-end">
                                        <Button
                                            variant={r.isPresent ? "contained" : "outlined"}
                                            size="small"
                                            onClick={() => markPresent(r.studentId, true)}
                                        >
                                            Presente
                                        </Button>
                                        <Button
                                            variant={!r.isPresent ? "contained" : "outlined"}
                                            color="warning"
                                            size="small"
                                            onClick={() => markPresent(r.studentId, false)}
                                        >
                                            Ausente
                                        </Button>
                                        <Chip label={r.isPresent ? "✔" : "✖"} size="small" color={r.isPresent ? "success" : "default"} />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}

                        {!loading && sectionId > 0 && rows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6}>No hay estudiantes para esta sección.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

        </div>
    );
}
