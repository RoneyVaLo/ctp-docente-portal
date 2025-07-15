using System.Text;
using ctp_docente_portal.Server.DTOs.Reports;

namespace ctp_docente_portal.Server.Helpers
{
    public static class CsvExportHelper
    {
        public static string ExportAttendanceStats(List<SectionAttendanceStatsDto> data)
        {
            var csv = new StringBuilder();
            csv.AppendLine("Sección,Total Sesiones,Presentes,Ausencias,Porcentaje");

            foreach (var item in data)
            {
                csv.AppendLine($"{item.SectionName},{item.TotalSessions},{item.TotalPresent},{item.TotalAbsences},{item.AttendancePercentage:0.00}%");
            }

            return csv.ToString();
        }

        public static string ExportGrades(List<GradeReportDto> data)
        {
            var csv = new StringBuilder();
            csv.AppendLine("Estudiante,Grupo,Materia,Promedio");

            foreach (var item in data)
            {
                csv.AppendLine($"{item.StudentName},{item.GroupName},{item.Subject},{item.Average}");
            }

            return csv.ToString();
        }
    }
}
