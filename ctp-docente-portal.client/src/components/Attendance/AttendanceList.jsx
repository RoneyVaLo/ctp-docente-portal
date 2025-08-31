import React from "react";

// Componente individual por estudiante
const StudentAttendanceCard = ({ student }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow mb-4 text-white">
      <h3 className="text-lg font-semibold mb-2">{student.name}</h3>
      <div className="grid grid-cols-5 md:grid-cols-6 gap-4 text-sm text-center">
        <div>
          <p className="text-green-500">Ausencias injustificadas</p>
          <p>{student.unjustifiedAbsences}</p>
        </div>
        <div>
          <p className="text-green-500">Ausencias justificadas</p>
          <p>{student.justifiedAbsences}</p>
        </div>
        <div>
          <p className="text-green-500">Tardías injustificadas</p>
          <p>{student.unjustifiedLate}</p>
        </div>
        <div>
          <p className="text-green-500">Tardías justificadas</p>
          <p>{student.justifiedLate}</p>
        </div>
        <div className="col-span-1 md:col-span-2 flex items-center justify-center">
          <span className="text-white text-sm">
            Presente: <strong>{student.presentCount}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};

// Lista completa
const AttendanceList = () => {
  const dummyStudents = [
    {
      name: "ALEMAN MARTÍNEZ CRISTHOFER CAMILO",
      unjustifiedAbsences: 2,
      justifiedAbsences: 1,
      unjustifiedLate: 0,
      justifiedLate: 0,
      presentCount: 6,
    },
    {
      name: "ALVAREZ DUARTE MICHELL VIDETTE",
      unjustifiedAbsences: 0,
      justifiedAbsences: 0,
      unjustifiedLate: 0,
      justifiedLate: 0,
      presentCount: 8,
    },
    {
      name: "ARAUZ LUQUEZ JAMILETH DEL SOCORRO",
      unjustifiedAbsences: 0,
      justifiedAbsences: 0,
      unjustifiedLate: 0,
      justifiedLate: 0,
      presentCount: 8,
    },
  ];

  return (
    <div>
      {dummyStudents.map((student, index) => (
        <StudentAttendanceCard key={index} student={student} />
      ))}
    </div>
  );
};

export default AttendanceList;
