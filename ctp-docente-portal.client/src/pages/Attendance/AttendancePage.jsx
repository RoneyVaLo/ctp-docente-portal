import React, { useEffect, useMemo, useState, useCallback } from "react";
import { attendanceApi } from "@/services/attendanceService";
import { sectionsApi } from "@/services/sectionsService";
import { ls } from "@/utils/localStore";
import {
    FormControl,
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
    Snackbar,
    ToggleButton,
    ToggleButtonGroup,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import { Save, CheckCircle, Cancel } from "@mui/icons-material";

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
    const [subjects, setSubjects] = useState([]);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingSubjects, setLoadingSubjects] = useState(false);

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState("");


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

    useEffect(() => {
        const fetchSubjects = async () => {
            setLoadingSubjects(true);
            try {
                const data = await attendanceApi.getSubjects();
                setSubjects(data);
            } catch (err) {
                console.error("Error cargando las materias:", err);
            } finally {
                setLoadingSubjects(false);
            }
        };
        fetchSubjects();
    }, []);

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

    const markAll = (present) =>
        setRows((prev) => prev.map((r) => ({ ...r, isPresent: present })));

    async function doSave(payload) {
        await attendanceApi.createGroup(payload);
        setLastSavedKey(currentKey);
        setToast("Asistencia guardada");
        setTimeout(() => setToast(""), 3000);
    }

    const saveGroup = async () => {
        if (!sectionId) return alert("Seleccioná una sección.");
        if (!subjectId) return alert("Seleccioná una asignatura.");
        if (!rows.length) return alert("No hay estudiantes cargados.");
        if (!/^\d{2}:\d{2}$/.test(time)) return alert("Ingresá una hora válida (HH:MM).");

        if (currentKey === lastSavedKey) {
            setToast("Esta asistencia ya ha sido registrada.");
            setTimeout(() => setToast(""), 2500);
            return;
        }

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

            // Pre-chequeo 
            const existing = await attendanceApi.newList({ date, sectionId, subjectId });
            if (Array.isArray(existing) && existing.length > 0) {
                setPendingPayload(payload);
                setConfirmOpen(true);
                setLoading(false);
                return;
            }

            await doSave(payload);
        } catch (e) {
            console.error("Error al guardar asistencia:", e);
            alert(e?.message ?? "Error al guardar");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                📝 Registro de asistencia diaria
            </h1>

            <Paper className="p-4 shadow-sm rounded-lg border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="text-xs text-slate-500">Fecha</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full border rounded px-2 py-1"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-500">Hora</label>
                        <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            step={60}
                            className="w-full border rounded px-2 py-1"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-500">Sección</label>
                        <FormControl fullWidth size="small">
                            <Select
                                value={sectionId || ""}
                                onChange={(e) => setSectionId(Number(e.target.value) || 0)}
                                displayEmpty
                            >
                                <MenuItem value="">
                                    <em>Seleccioná una sección</em>
                                </MenuItem>
                                {loadingSections && (
                                    <MenuItem disabled>
                                        <CircularProgress size={16} /> Cargando…
                                    </MenuItem>
                                )}
                                {sections.map((s) => (
                                    <MenuItem key={s.id} value={s.id}>
                                        {s.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                    <div>
                        <label className="text-xs text-slate-500">Asignatura</label>
                        <FormControl fullWidth size="small">
                            <Select
                                value={subjectId || ""}
                                onChange={(e) => {
                                    const val = Number(e.target.value) || 0;
                                    setSubjectId(val);
                                    const found = subjects.find((s) => s.id === val);
                                    setSubject(found?.name ?? "");
                                }}
                                displayEmpty
                            >
                                <MenuItem value="">
                                    <em>Seleccioná una asignatura</em>
                                </MenuItem>
                                {subjects.map((s) => (
                                    <MenuItem key={s.id} value={s.id}>
                                        {s.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                </div>
            </Paper>


            <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">
                    {sectionId
                        ? loading
                            ? "Cargando estudiantes…"
                            : `Estudiantes: ${rows.length} | Presentes: ${rows.filter((r) => r.isPresent).length
                            } | Ausentes: ${rows.filter((r) => !r.isPresent).length}`
                        : "Seleccioná sección para cargar estudiantes"}
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<CheckCircle />}
                        onClick={() => markAll(true)}
                        disabled={!rows.length}
                    >
                        Todos Presente
                    </Button>
                    <Button
                        variant="outlined"
                        size="small"
                        color="warning"
                        startIcon={<Cancel />}
                        onClick={() => markAll(false)}
                        disabled={!rows.length}
                    >
                        Todos Ausente
                    </Button>
                    <Button
                        variant="contained"
                        size="small"
                        color="primary"
                        startIcon={<Save />}
                        onClick={saveGroup}
                        disabled={loading || !sectionId || !subjectId || !rows.length}
                    >
                        Guardar asistencia
                    </Button>
                </div>
            </div>


            <TableContainer component={Paper} className="shadow-sm rounded-lg border">
                <Table size="small">
                    <TableHead className="bg-slate-100">
                        <TableRow>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Cédula</TableCell>
                            <TableCell>Notas</TableCell>
                            <TableCell align="center">Asistencia</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((r, idx) => (
                            <TableRow
                                key={r.studentId}
                                className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}
                            >
                                <TableCell className="font-medium">{r.fullName}</TableCell>
                                <TableCell>{r.idNumber || "-"}</TableCell>
                                <TableCell>
                                    <input
                                        className="text-sm w-full border rounded px-2 py-1"
                                        placeholder="Observaciones"
                                        value={r.notes}
                                        onChange={(e) => updateRow(r.studentId, { notes: e.target.value })}
                                    />
                                </TableCell>
                                <TableCell align="center">
                                    <ToggleButtonGroup
                                        value={r.isPresent ? "present" : "absent"}
                                        exclusive
                                        onChange={(_, val) =>
                                            updateRow(r.studentId, { isPresent: val === "present" })
                                        }
                                        size="small"
                                    >
                                        <ToggleButton value="present" color="success">
                                            Presente
                                        </ToggleButton>
                                        <ToggleButton value="absent" color="error">
                                            Ausente
                                        </ToggleButton>
                                    </ToggleButtonGroup>
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


            <Snackbar
                open={!!toast}
                autoHideDuration={3000}
                onClose={() => setToast("")}
                message={toast}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            />

            {/* Diálogo de confirmación */}
            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <DialogTitle>Asistencia ya registrada</DialogTitle>
                <DialogContent>
                    Ya existe asistencia para esta sección y asignatura el{" "}
                    {new Date(date).toLocaleDateString("es-CR")}. ¿Deseás <b>actualizarla</b>?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
                    <Button
                        variant="contained"
                        onClick={async () => {
                            setConfirmOpen(false);
                            setLoading(true);
                            try {
                                await doSave(pendingPayload);
                                setToast("Asistencia actualizada");
                            } catch (e) {
                                alert(e?.message ?? "Error al guardar");
                            } finally {
                                setLoading(false);
                            }
                        }}
                    >
                        Actualizar
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
