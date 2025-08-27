import React from "react";
import AttendancePage from "./AttendancePage";
export { default } from "./Attendance/AttendancePage";

const Attendance = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Asistencia</h1>
      <p>Control de asistencia de estudiantes</p>
    </div>
  );
};

export default function Attendance() {
  return <AttendancePage />;
}



