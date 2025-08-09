import React from "react";
import AttendanceForm from "../components/Attendance/AttendanceForm";
import AttendanceList from "../components/Attendance/AttendanceList";
import { attendanceApi } from "@/services/attendanceService";
import { useState } from "react";

export default function AttendancePage() {
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [sectionId, setSectionId] = useState < number > (1);

    // registros guardados que vienen del back
    const [items, setItems] = useState < Array < {
        id: number;           // attendanceId
        studentId: number;
        studentName: string;
        isPresent: boolean;
        notes?: string;
    } >> ([]);

    // carga automática cuando cambian filtros
    useEffect(() => {
        if (!sectionId) return;
        load();
    }, [date, sectionId]);

    const load = async () => {
        const data = await attendanceApi.list({ date, sectionId });
        // normaliza por si cambia el contrato
        const mapped = data.map((x: any) => ({
            id: x.id ?? x.attendanceId,
            studentId: x.studentId,
            studentName: x.studentName ?? x.name,
            isPresent: !!x.isPresent,
            notes: x.notes ?? "",
        }));
        setItems(mapped);
    };

    const togglePresent = async (row: any, checked: boolean) => {
        await attendanceApi.update({ attendanceId: row.id, isPresent: checked, notes: row.notes });
        await load();
    };

    const changeNotes = async (row: any, text: string) => {
        await attendanceApi.update({ attendanceId: row.id, isPresent: row.isPresent, notes: text });
        await load();
    };

    return (
        <div className="p-6">
            <h1>Registro de asistencia diaria</h1>

            <div className="flex gap-2 my-4">
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                <input
                    type="number"
                    value={sectionId}
                    onChange={(e) => setSectionId(Number(e.target.value))}
                    placeholder="Sección"
                />
                <button onClick={load}>Buscar</button>
            </div>

            {/* LISTA DE LO GUARDADO */}
            <table className="min-w-full">
                <thead>
                    <tr>
                        <th>Estudiante</th>
                        <th>Presente</th>
                        <th>Notas</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((r) => (
                        <tr key={r.id}>
                            <td>{r.studentName}</td>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={r.isPresent}
                                    onChange={(e) => togglePresent(r, e.target.checked)}
                                />
                            </td>
                            <td>
                                <input
                                    value={r.notes ?? ""}
                                    onChange={(e) => changeNotes(r, e.target.value)}
                                />
                            </td>
                        </tr>
                    ))}
                    {items.length === 0 && (
                        <tr><td colSpan={3}>No hay registros para los filtros.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
Con esto, al cambiar fecha o sección, se hace GET y pintas lo que ya está guardado.Además, puedes editar “Presente” y “Notas” en línea y se actualiza vía PUT.

3) (Opcional) Tarjetas / resumen como tu UI de abajo
Si tienes un endpoint de resumen(p.ej. / api / attendance / summary que devuelva por estudiante: unjustifiedAbsences, justifiedAbsences, lateUnjustified, lateJustified, presentCount), mete otro estado y píntalo:

tsx
Copiar
Editar
type StudentSummary = {
    studentId: number;
    studentName: string;
    unjustifiedAbsences: number;
    justifiedAbsences: number;
    lateUnjustified: number;
    lateJustified: number;
    presentCount: number;
};

const [summary, setSummary] = useState < StudentSummary[] > ([]);

const loadSummary = async () => {
    const data = await attendanceApi.summary({ date, sectionId });
    setSummary(data);
};

// Llama junto con load()
useEffect(() => {
    if (!sectionId) return;
    load();
    loadSummary();
}, [date, sectionId]);

// Render
<div className="mt-10 space-y-4">
    {summary.map(s => (
        <div key={s.studentId} className="rounded-lg bg-slate-800 p-4 text-white">
            <div className="font-semibold text-lg">{s.studentName}</div>
            <div className="grid grid-cols-5 gap-6 mt-2">
                <div>
                    <div>Ausencias injustificadas</div>
                    <div className="text-green-400 text-xl">{s.unjustifiedAbsences}</div>
                </div>
                <div>
                    <div>Ausencias justificadas</div>
                    <div className="text-green-400 text-xl">{s.justifiedAbsences}</div>
                </div>
                <div>
                    <div>Tardías injustificadas</div>
                    <div className="text-green-400 text-xl">{s.lateUnjustified}</div>
                </div>
                <div>
                    <div>Tardías justificadas</div>
                    <div className="text-green-400 text-xl">{s.lateJustified}</div>
                </div>
                <div className="text-right">
                    <div>Presente:</div>
                    <div className="text-green-400 text-xl">{s.presentCount}</div>
                </div>
            </div>
        </div>
    ))}
</div>