import { useState } from "react";
import AttendanceForm from "../../components/Attendance/AttendanceForm";
import AttendanceList from "../../components/Attendance/AttendanceList";

const AttendancePage = () => {
  const [students, setStudents] = useState([]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-green-400">
        Registro de asistencia diaria
      </h1>

      <div className="mb-8">
        <AttendanceForm setStudents={setStudents} />
      </div>

      <div>
        <AttendanceList students={students} />
      </div>
    </div>
  );
};

export default AttendancePage;
