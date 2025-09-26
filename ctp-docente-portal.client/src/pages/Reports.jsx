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
import AssessmentIcon from "@mui/icons-material/Assessment";
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
        } catch { }
    }, [date, sectionId, subjectId, subject, reportType]);


    useEffect(() => {
        setRows([]);
        setRoster([]);
        setHasSearched(false);
        setLastQuery(null);
        setErr("");
    }, [reportType]);

    useEffect(() => {
        const fetchSubjects = async () => {
            setLoadingSubjects(true);
            try {
                const data = await attendanceApi.getSubjects();
                setSubjects(Array.isArray(data) ? data : []);
            } finally {
                setLoadingSubjects(false);
            }
        };
        fetchSubjects();
    }, []);

    useEffect(() => {
        (async () => {
            setLoadingSections(true);
            try {
                const data = await sectionsApi.active();
                setSections(Array.isArray(data) ? data : []);
            } finally {
                setLoadingSections(false);
            }
        })();
    }, []);

    const normalizeAttendanceRow = (r) => ({
        studentId: r.studentId ?? r.StudentId ?? null,
        sectionId: r.sectionId ?? r.SectionId ?? null,
        subjectId: r.subjectId ?? r.SubjectId ?? null,
        statusTypeId: r.statusTypeId ?? r.StatusTypeId ?? null,
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
                setRows((Array.isArray(data) ? data : []).map(normalizeAttendanceRow));
            } else {
                const data = await gradesApi.listReport({ date, sectionId });
                setRows((Array.isArray(data) ? data : []).map(normalizeGradeRow));
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
        return <Chip label={cfg.label} size="small" color={cfg.color} />;
    };

    const totalCols = reportType === "attendance" ? 4 : 5;

    return (
        <div className="p-6 space-y-6">

            <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                <AssessmentIcon fontSize="large" /> Reportes
            </h1>


            <Paper className="p-4 shadow-sm rounded-lg border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                    <div>
                        <label className="text-xs text-slate-600 mb-1 block">Tipo de reporte</label>
                        <FormControl fullWidth size="small">
                            <Select
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                            >
                                <MenuItem value="attendance">Asistencias</MenuItem>
                                <MenuItem value="grades">Calificaciones</MenuItem>
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
                        />
                    </div>

                    <div>
                        <label className="text-xs text-slate-600 mb-1 block">Sección</label>
                        <FormControl fullWidth size="small">
                            <Select
                                value={sectionId || ""}
                                displayEmpty
                                onChange={(e) => setSectionId(Number(e.target.value) || 0)}
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

                    <div className="flex gap-2">
                        <Button
                            size="small"
                            variant="contained"
                            startIcon={<SearchIcon />}
                            onClick={onSearch}
                            disabled={!canSearch || loading}
                        >
                            Buscar
                        </Button>
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<FileDownloadOutlinedIcon />}
                            onClick={onSearch}
                            disabled={loading || rows.length === 0}
                        >
                            Exportar datos
                        </Button>
                    </div>
                </div>
            </Paper>


            <TableContainer component={Paper} className="shadow-sm rounded-lg border">
                <Table size="small">
                    <TableHead className="bg-slate-100">
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
                                <TableCell colSpan={totalCols} className="text-center text-slate-500 py-3">
                                    Usa los filtros y presioná <b>Buscar</b>.
                                </TableCell>
                            </TableRow>
                        )}
                        {hasSearched &&
                            rows.map((r, i) => (
                                <TableRow
                                    key={`${r.studentId ?? "s"}-${r.evaluationItemId ?? i}`}
                                    className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}
                                >
                                    <TableCell>{studentNameById[r.studentId] || r.studentName || "-"}</TableCell>
                                    <TableCell>{sectionNameById[r.sectionId] || r.sectionName || "-"}</TableCell>
                                    {reportType === "attendance" ? (
                                        <>
                                            <TableCell>{subjectNameById[r.subjectId] || "-"}</TableCell>
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
                <div className="mt-3 text-sm bg-red-50 border border-red-200 text-red-700 rounded px-3 py-2">
                    {err}
                </div>
            )}
        </div>
    );
}
