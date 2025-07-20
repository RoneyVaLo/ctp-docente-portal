import React from "react";
import AttendanceForm from "../components/Attendance/AttendanceForm";
import AttendanceList from "../components/Attendance/AttendanceList";

const AttendancePage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Asistencia</h1>
      
      <div className="max-w-6xl mx-auto">
        <AttendanceForm />
        <AttendanceList />
      </div>
    </div>
  );
};

export default AttendancePage;
