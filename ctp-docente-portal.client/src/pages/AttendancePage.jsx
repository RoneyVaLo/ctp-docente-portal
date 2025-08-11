import React from "react";
import AttendanceForm from "../components/Attendance/AttendanceForm";
import AttendanceList from "../components/Attendance/AttendanceList";
import { useState, useEffect, useCallback } from "react";
import { attendanceApi } from "@/services/attendanceService";


export default function AttendancePage() {
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [sectionId, setSectionId] = useState(0);
    const [rows, setRows] = useState([]);      // lista de asistencia
    const [summary, setSummary] = useState([]); // resumen por estudiante

    // Cargar lista de asistencia
    const loadList = useCallback(async () => {
        if (!sectionId) return;
        const data = await attendanceApi.list({ date, sectionId });
        setRows(
            (data ?? []).map(x => ({
                attendanceId: x.attendanceId,
                studentId: x.studentId,
                name: x.studentName,
                isPresent: !!x.isPresent,
                notes: x.notes ?? "",
            }))
        );
    }, [date, sectionId]);

    // Cargar resumen por estudiante
    const loadSummary = useCallback(async () => {
        if (!sectionId) return;
        const data = await attendanceApi.summary({ date, sectionId });
        setSummary(data ?? []);
    }, [date, sectionId]);

    // Guardar grupo completo
    const saveGroup = async () => {
        if (!sectionId) return;
        await attendanceApi.createGroup({
            date,
            sectionId,
            students: rows.map(r => ({
                studentId: r.studentId,
                isPresent: r.isPresent,
                notes: r.notes,
            })),
        });
        await loadList();
        await loadSummary();
    };

    // Actualizar un estudiante
    const updateOne = async (attendanceId, isPresent, notes) => {
        await attendanceApi.update({ attendanceId, isPresent, notes });
        await loadList();
        await loadSummary();
    };

    // Cargar datos cuando cambian fecha o sección
    useEffect(() => {
        loadList();
        loadSummary();
    }, [loadList, loadSummary]);

    return (
        <div>
            <h1>Registro de asistencia diaria</h1>

            <div>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} />
                <input
                    type="number"
                    placeholder="Sección"
                    value={sectionId}
                    onChange={e => setSectionId(+e.target.value)}
                />
                <button onClick={saveGroup}>Guardar asistencia</button>
            </div>

            <table>
                <tbody>
                    {rows.map(r => (
                        <tr key={r.studentId}>
                            <td>{r.name}</td>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={r.isPresent}
                                    onChange={e =>
                                        setRows(prev =>
                                            prev.map(p =>
                                                p.studentId === r.studentId
                                                    ? { ...p, isPresent: e.target.checked }
                                                    : p
                                            )
                                        )
                                    }
                                />
                            </td>
                            <td>
                                <input
                                    value={r.notes}
                                    onChange={e =>
                                        setRows(prev =>
                                            prev.map(p =>
                                                p.studentId === r.studentId
                                                    ? { ...p, notes: e.target.value }
                                                    : p
                                            )
                                        )
                                    }
                                />
                            </td>
                            <td>
                                <button onClick={() => updateOne(r.attendanceId, r.isPresent, r.notes)}>
                                    Guardar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div>
                {summary.map(s => (
                    <div key={s.studentId}>
                        <h3>{s.name}</h3>
                        <p>Ausencias injustificadas: {s.unjustifiedAbsences}</p>
                        <p>Ausencias justificadas: {s.justifiedAbsences}</p>
                        <p>Tardías injustificadas: {s.unjustifiedLates}</p>
                        <p>Tardías justificadas: {s.justifiedLates}</p>
                        <p>Presente: {s.presentCount}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
