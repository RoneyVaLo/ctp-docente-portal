import React, { useCallback, useEffect, useMemo, useState } from "react";
import { notificationsApi } from "@/services/notificationsService";
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
    Chip,
    TextField,
    Tooltip,
    IconButton,
} from "@mui/material";
import ReplayIcon from "@mui/icons-material/Replay";
import SearchIcon from "@mui/icons-material/Search";

const SUBJECT_OPTIONS = [
    { id: 1, name: "Matemáticas" },
    { id: 2, name: "Español" },
    { id: 3, name: "Ciencias" },
    { id: 4, name: "Estudios Sociales" },
    { id: 5, name: "Inglés" },
];

function formatDate(iso) {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("es-CR");
}

export default function NotificationsPage() {
    const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
    const saved = ls.get("ui.notifications.filters", {}) || {};

    const [date, setDate] = useState(saved.date ?? today);
    const [sectionId, setSectionId] = useState(saved.sectionId ?? 0);
    const [status, setStatus] = useState(saved.status ?? "");
    const [subject, setSubject] = useState(saved.subject ?? "");
    const [subjectId, setSubjectId] = useState(saved.subjectId ?? 0);

    const [sections, setSections] = useState([]);
    const [loadingSections, setLoadingSections] = useState(false);

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const canQuery = sectionId > 0; // requerimos sección

    // Persistir filtros
    useEffect(() => {
        try {
            ls.set("ui.notifications.filters", {
                date,
                sectionId,
                status,
                subject,
                subjectId,
            });
        } catch (err) {
            console.warn("No se pudo persistir filtros en localStorage:", err);
        }
    }, [date, sectionId, status, subject, subjectId]);


    useEffect(() => {
        (async () => {
            setLoadingSections(true);
            try {
                const data = await sectionsApi.active();
                setSections(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error("Error cargando secciones", e);
                setSections([]);
            } finally {
                setLoadingSections(false);
            }
        })();
    }, []);

    const load = useCallback(async () => {
        if (!canQuery) return;
        setLoading(true);
        setErr("");
        try {
            const data = await notificationsApi.list({ date, sectionId, status, subjectId });
            setRows(Array.isArray(data) ? data : []);
        } catch (e) {
            setErr(e?.message ?? "Error al cargar.");
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, [canQuery, date, sectionId, status, subjectId]);


    useEffect(() => {
        if (saved && saved.sectionId > 0) {
            load();
        }
    }, []);

    const resend = useCallback(
        async (id) => {
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
        },
        [load]
    );

    const statusChip = (st) => {
        const map = {
            SENT: { color: "success", label: "Enviado" },
            FAILED: { color: "error", label: "Fallido" },
            QUEUED: { color: "warning", label: "En cola" },
        };
        const cfg = map[st] ?? { color: "default", label: st || "-" };
        return <Chip label={cfg.label} size="small" color={cfg.color} variant={cfg.color === "default" ? "outlined" : undefined} />;
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Notificaciones</h1>


            <Paper elevation={0} className="p-4 mb-4 border">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">

                    <div>
                        <label className="text-xs text-slate-600 mb-1 block">Fecha</label>
                        <TextField
                            type="date"
                            size="small"
                            fullWidth
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            inputProps={{ "aria-label": "Fecha" }}
                        />
                    </div>


                    <div>
                        <label className="text-xs text-slate-600 mb-1 block">Sección</label>
                        <FormControl fullWidth size="small">
                            <Select
                                value={sectionId || ""}
                                displayEmpty
                                onChange={(e) => setSectionId(Number(e.target.value) || 0)}
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


                    <div>
                        <label className="text-xs text-slate-600 mb-1 block">Asignatura</label>
                        <FormControl fullWidth size="small">
                            <Select
                                value={subjectId || ""}
                                displayEmpty
                                onChange={(e) => {
                                    const val = Number(e.target.value) || 0;
                                    setSubjectId(val);
                                    const found = SUBJECT_OPTIONS.find((s) => s.id === val);
                                    setSubject(found?.name ?? "");
                                }}
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


                    <div>
                        <label className="text-xs text-slate-600 mb-1 block">Estado</label>
                        <FormControl fullWidth size="small">
                            <Select value={status} onChange={(e) => setStatus(e.target.value)} displayEmpty>
                                <MenuItem value="">
                                    <em>Todos</em>
                                </MenuItem>
                                <MenuItem value="SENT">Enviados</MenuItem>
                                <MenuItem value="FAILED">Fallidos</MenuItem>
                                <MenuItem value="QUEUED">En cola</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="contained"
                            startIcon={<SearchIcon />}
                            onClick={load}
                            disabled={!canQuery || loading}
                            fullWidth
                        >
                            Buscar
                        </Button>
                    </div>
                </div>
            </Paper>

            {err && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2 mb-3">{err}</div>
            )}

            {/* Tabla */}
            <TableContainer component={Paper} elevation={0} className="border">
                <Table size="small">
                    <TableHead className="bg-slate-50">
                        <TableRow>
                            <TableCell>Estudiante</TableCell>
                            <TableCell>Teléfono</TableCell>
                            <TableCell>Mensaje</TableCell>
                            <TableCell>Fecha</TableCell>
                            <TableCell>Sección</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell align="right">Acción</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading && (
                            <TableRow>
                                <TableCell colSpan={7}>
                                    <div className="flex items-center gap-2 text-sm p-2">
                                        <CircularProgress size={18} /> Cargando…
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}

                        {!loading && canQuery && rows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7}>
                                    <div className="text-center text-slate-500 p-3">Sin notificaciones.</div>
                                </TableCell>
                            </TableRow>
                        )}

                        {rows.map((n) => (
                            <TableRow key={n.id} hover>
                                <TableCell className="font-medium">{n.studentName}</TableCell>
                                <TableCell>{n.phone}</TableCell>
                                <TableCell className="max-w-[28rem] truncate" title={n.message}>
                                    {n.message}
                                </TableCell>
                                <TableCell>{formatDate(n.date)}</TableCell>
                                <TableCell>{n.sectionId}</TableCell>
                                <TableCell>{statusChip(n.status)}</TableCell>
                                <TableCell align="right">
                                    {n.status === "FAILED" && (
                                        <Tooltip title="Reintentar">
                                            <span>
                                                <IconButton size="small" onClick={() => resend(n.id)} disabled={loading}>
                                                    <ReplayIcon fontSize="small" />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}