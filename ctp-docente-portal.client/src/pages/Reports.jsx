import React, { useMemo, useState, useEffect, useCallback } from "react";
import { attendanceApi } from "@/services/attendanceService";
import { sectionsApi } from "@/services/sectionsService";
import { gradesApi } from "@/services/gradesService";
import { ls } from "@/utils/localStore";
import {
    FormControl,
    Select,
    MenuItem,
    CircularProgress,
    Paper,
    Button,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import * as XLSX from "xlsx";

export default function Reports() {

    const today = useMemo(() => new Date().toLocaleDateString("en-CA"), []);
    const saved = ls.get("ui.reports.filters", {}) || {};

    const [date, setDate] = useState(saved.date ?? today);
    const [sectionId, setSectionId] = useState(saved.sectionId ?? 0);
    const [subjectId, setSubjectId] = useState(saved.subjectId ?? 0);
    const [subject, setSubject] = useState(saved.subject ?? "");
    const [reportType, setReportType] = useState(saved.reportType ?? "attendance"); 

    const [sections, setSections] = useState([]);
    const [loadingSections, setLoadingSections] = useState(false);

    const [subjects, setSubjects] = useState([]);
    const [loadingSubjects, setLoadingSubjects] = useState(false);

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const [hasSearched, setHasSearched] = useState(false);
    const [lastQuery, setLastQuery] = useState(null); 

    const canSearch = sectionId > 0;


    useEffect(() => {
        try {
            ls.set("ui.reports.filters", { date, sectionId, subjectId, subject, reportType });
        } catch (e) {
            console.warn("No se pudo persistir filtros en localStorage:", e);
        }
    }, [date, sectionId, subjectId, subject, reportType]);
    useEffect(() => {
        setRows([]);
        setRoster([]);
        setHasSearched(false);
        setLastQuery(null);
        setErr("");

    }, [reportType]);
    // Cargar asignaturas
    useEffect(() => {
        const fetchSubjects = async () => {
            setLoadingSubjects(true);
            try {
                const data = await attendanceApi.getSubjects();
                setSubjects(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error("Error cargando las materias:", e);
                setSubjects([]);
            } finally {
                setLoadingSubjects(false);
            }
        };
        fetchSubjects();
    }, []);

    // Cargar secciones
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


    const normalizeAttendanceRow = (r) => ({
        studentId: r.studentId ?? r.StudentId ?? r.alumnoId ?? null,
        sectionId: r.sectionId ?? r.SectionId ?? null,
        subjectId: r.subjectId ?? r.SubjectId ?? null,
        statusTypeId: r.statusTypeId ?? r.StatusTypeId ?? null,
        date: r.date ?? r.Date ?? null,
    });


    const normalizeGradeRow = (r) => ({
        studentId: r.studentId ?? r.StudentId ?? null,
        studentName: r.studentName ?? r.StudentName ?? "",
        sectionId: r.sectionId ?? r.SectionId ?? null,
        sectionName: r.sectionName ?? r.SectionName ?? "",
        evaluationItemId: r.evaluationItemId ?? r.EvaluationItemId ?? null,
        itemName: r.evaluationItemName ?? r.EvaluationItemName ?? "",
        score: Number(r.score ?? r.Score ?? 0),
        percentage: Number(r.percentage ?? r.Percentage ?? 0),
        createdAt: r.createdAtUtc ?? r.CreatedAtUtc ?? r.createdAt ?? r.CreatedAt ?? null,
    });

    const onSearch = useCallback(async () => {
        if (!canSearch) return;
        setHasSearched(true);
        setLastQuery({ date, sectionId, subjectId, reportType });
        setErr("");
        setLoading(true);
        try {
            if (reportType === "attendance") {
                const data = await attendanceApi.listReport({ date, sectionId, subjectId });
                const normalized = (Array.isArray(data) ? data : []).map(normalizeAttendanceRow);
                setRows(normalized);
            } else {
                const data = await gradesApi.listReport({ date, sectionId });
                const normalized = (Array.isArray(data) ? data : []).map(normalizeGradeRow);
                setRows(normalized);
            }
        } catch (e) {
            setErr(e?.message ?? "Error al buscar.");
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, [date, sectionId, subjectId, canSearch, reportType]);

    const [roster, setRoster] = useState([]);
    const [loadingRoster, setLoadingRoster] = useState(false);

    useEffect(() => {
        const loadRoster = async () => {
            if (!hasSearched || !lastQuery?.sectionId) {
                setRoster([]);
                return;
            }
            setLoadingRoster(true);
            try {
                const data = await attendanceApi.roster({
                    sectionId: lastQuery.sectionId,
                    subjectId: lastQuery.subjectId,
                });
                setRoster(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error("Error cargando roster", e);
                setRoster([]);
            } finally {
                setLoadingRoster(false);
            }
        };
        loadRoster();
    }, [hasSearched, lastQuery?.sectionId, lastQuery?.subjectId]);

    const studentNameById = useMemo(() => {
        const m = {};
        for (const s of roster) m[s.id] = (s.fullName ?? s.name ?? "").trim();
        return m;
    }, [roster]);

    const sectionNameById = useMemo(() => {
        const m = {};
        for (const s of sections) m[s.id] = s.name;
        return m;
    }, [sections]);

    const subjectNameById = useMemo(() => {
        const m = {};
        for (const s of subjects) m[s.id] = s.name;
        return m;
    }, [subjects]);

    const statusChip = (st) => {
        const id = Number(st);
        const map = {
            1: { color: "success", label: "Presente" },
            2: { color: "error", label: "Ausente" },
            3: { color: "info", label: "Justificado" },
            4: { color: "warning", label: "Tarde" },
        };
        const cfg = map[id] ?? { color: "default", label: String(st ?? "-") };
        return (
            <Chip
                label={cfg.label}
                size="small"
                color={cfg.color}
                variant={cfg.color === "default" ? "outlined" : undefined}
            />
        );
    };

    const statusLabel = (st) => {
        const id = Number(st);
        switch (id) {
            case 1:
                return "Presente";
            case 2:
                return "Ausente";
            case 3:
                return "Justificado";
            case 4:
                return "Tarde";
            default:
                return String(st ?? "-");
        }
    };

    const onExport = useCallback(() => {
        if (!rows || rows.length === 0) return;

        let exportRows;
        if (reportType === "attendance") {
            exportRows = rows.map((r) => ({
                Estudiante: studentNameById[r.studentId] || r.studentId || "-",
                Sección: sectionNameById[r.sectionId] || r.sectionId || "-",
                Asignatura: subjectNameById[r.subjectId] || r.subjectId || "-",
                Estado: statusLabel(r.statusTypeId),
            }));
        } else {
            exportRows = rows.map((r) => ({
                Estudiante: studentNameById[r.studentId] || r.studentName || r.studentId || "-",
                Sección: sectionNameById[r.sectionId] || r.sectionName || r.sectionId || "-",
                Ítem: r.itemName || "-",
                Calificación: Number.isFinite(r.score) ? r.score : "-",
                Porcentaje: Number.isFinite(r.percentage) ? r.percentage : "-",
            }));
        }

        const ws = XLSX.utils.json_to_sheet(exportRows);
        const headers = Object.keys(exportRows[0] ?? {});
        const colWidths = headers.map((h, i) => ({
            wch:
                Math.max(
                    h.length,
                    ...exportRows.map((row) => String(row[headers[i]] ?? "").length)
                ) + 2,
        }));
        ws["!cols"] = colWidths;

        const secIdForName = lastQuery?.sectionId ?? sectionId;
        const subIdForName = lastQuery?.subjectId ?? subjectId;
        const secName = sectionNameById[secIdForName] || secIdForName || "seccion";
        const subjName = subjectNameById[subIdForName] || subIdForName || "asignatura";
        const safe = (s) => String(s).replace(/[^\w\-]+/g, "_");
        const prefix = reportType === "attendance" ? "reporte_asistencias" : "reporte_calificaciones";
        const filename = `${prefix}_${lastQuery?.date ?? date}_${safe(secName)}_${safe(subjName)}.xlsx`;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Reporte");
        XLSX.writeFile(wb, filename);
    }, [
        rows,
        studentNameById,
        sectionNameById,
        subjectNameById,
        date,
        sectionId,
        subjectId,
        lastQuery,
        reportType,
    ]);

    const totalCols = reportType === "attendance" ? 4 : 5;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Reportes</h1>

            <Paper elevation={0} className="p-4 mb-4 border">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                    {/* Tipo de reporte */}
                    <div>
                        <label className="text-xs text-slate-600 mb-1 block">Tipo de reporte</label>
                        <FormControl fullWidth size="small">
                            <Select
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                                displayEmpty
                                renderValue={(selected) =>
                                    selected === "attendance" ? "Asistencias" : "Calificaciones"
                                }
                            >
                                <MenuItem value={"attendance"}>Asistencias</MenuItem>
                                <MenuItem value={"grades"}>Calificaciones</MenuItem>
                            </Select>
                        </FormControl>
                    </div>

                   
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
                                disabled={reportType === "grades"}
                                onChange={(e) => {
                                    const val = Number(e.target.value) || 0;
                                    setSubjectId(val);
                                    const found = subjects.find((s) => s.id === val);
                                    setSubject(found?.name ?? "");
                                }}
                                renderValue={(selected) => {
                                    if (!selected) return "Seleccioná una asignatura";
                                    const item = subjects.find((s) => s.id === selected);
                                    return item ? item.name : selected;
                                }}
                            >
                                <MenuItem value="">
                                    <em>Seleccioná una asignatura</em>
                                </MenuItem>
                                {loadingSubjects && (
                                    <MenuItem disabled>
                                        <div className="flex items-center gap-2">
                                            <CircularProgress size={16} /> Cargando…
                                        </div>
                                    </MenuItem>
                                )}
                                {subjects.map((s) => (
                                    <MenuItem key={s.id} value={s.id}>
                                        {s.name}
                                    </MenuItem>
                                ))}
                                {!loadingSubjects && subjects.length === 0 && (
                                    <MenuItem disabled>(Sin asignaturas)</MenuItem>
                                )}
                            </Select>
                        </FormControl>
                    </div>


                    <div className="flex gap-2">
                        <Button
                            size="small"
                            variant="contained"
                            startIcon={<SearchIcon fontSize="small" />}
                            onClick={onSearch}
                            disabled={!canSearch || loading}
                            disableElevation
                            sx={{
                                height: 36,
                                borderRadius: 2,
                                px: 2,
                                textTransform: "none",
                                fontWeight: 600,
                            }}
                        >
                            Buscar
                        </Button>
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<FileDownloadOutlinedIcon fontSize="small" />}
                            onClick={onExport}
                            disabled={loading || rows.length === 0}
                            sx={{
                                height: 36,
                                borderRadius: 2,
                                px: 2,
                                textTransform: "none",
                                fontWeight: 600,
                            }}
                        >
                            Exportar datos
                        </Button>
                    </div>
                </div>
            </Paper>

            <TableContainer component={Paper} elevation={0} className="border">
                <Table size="small">
                    <TableHead className="bg-slate-50">
                        <TableRow>
                            <TableCell>Estudiante</TableCell>
                            <TableCell>Sección</TableCell>

                            {reportType === "attendance" ? (
                                <>
                                    <TableCell>Asignatura</TableCell>
                                    <TableCell>Estado</TableCell>
                                </>
                            ) : (
                                <>
                                    <TableCell>Ítem</TableCell>
                                    <TableCell align="right">Calificación</TableCell>
                                    <TableCell align="right">% Ponderación</TableCell>
                                </>
                            )}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {!hasSearched && (
                            <TableRow>
                                <TableCell colSpan={totalCols}>
                                    <div className="text-center text-slate-500 p-3">
                                        Usa los filtros y presioná <b>Buscar</b>.
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}

                        {hasSearched && (loading || loadingRoster) && (
                            <TableRow>
                                <TableCell colSpan={totalCols}>
                                    <div className="flex items-center gap-2 text-sm p-2">
                                        <CircularProgress size={18} /> Cargando…
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}

                        {hasSearched && !loading && !loadingRoster && rows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={totalCols}>
                                    <div className="text-center text-slate-500 p-3">Sin resultados.</div>
                                </TableCell>
                            </TableRow>
                        )}

                        {hasSearched &&
                            rows.map((r, i) => (
                                <TableRow key={`${r.studentId ?? "s"}-${r.evaluationItemId ?? i}`} hover>
                                
                                    <TableCell>{studentNameById[r.studentId] || r.studentName || r.studentId || "-"}</TableCell>

                        
                                    <TableCell>{sectionNameById[r.sectionId] || r.sectionName || r.sectionId || "-"}</TableCell>

                                    {reportType === "attendance" ? (
                                        <>
                                            <TableCell>{subjectNameById[r.subjectId] || r.subjectId || "-"}</TableCell>
                                            <TableCell>{statusChip(r.statusTypeId)}</TableCell>
                                        </>
                                    ) : (
                                        <>
                                            <TableCell>{r.itemName || "-"}</TableCell>
                                            <TableCell align="right">
                                                {Number.isFinite(r.score) ? r.score.toFixed(2) : "-"}
                                            </TableCell>
                                            <TableCell align="right">
                                                {Number.isFinite(r.percentage) ? `${r.percentage}%` : "-"}
                                            </TableCell>
                                        </>
                                    )}
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {err && (
                <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
                    {err}
                </div>
            )}
        </div>
    );
}
