using System.IO;
using System.Text;
using ctp_docente_portal.Server.DTOs.Reports;
using iTextSharp.text;
using iTextSharp.text.pdf;

namespace ctp_docente_portal.Server.Helpers
{
    public static class PdfExportHelper
    {
        public static byte[] ExportGradesPdf(List<GradeReportDto> data)
        {
            using var ms = new MemoryStream();
            var doc = new Document();
            PdfWriter.GetInstance(doc, ms);
            doc.Open();

            var table = new PdfPTable(4);
            table.AddCell("Estudiante");
            table.AddCell("Grupo");
            table.AddCell("Materia");
            table.AddCell("Promedio");

            foreach (var item in data)
            {
                table.AddCell(item.StudentName);
                table.AddCell(item.GroupName);
                table.AddCell(item.Subject);
                table.AddCell(item.Average.ToString("0.00"));
            }

            doc.Add(new Paragraph("Reporte de Calificaciones"));
            doc.Add(new Paragraph(" "));
            doc.Add(table);
            doc.Close();

            return ms.ToArray();
        }

        public static byte[] ExportAttendanceStatsPdf(List<SectionAttendanceStatsDto> data)
        {
            using var ms = new MemoryStream();
            var doc = new Document();
            PdfWriter.GetInstance(doc, ms);
            doc.Open();

            var table = new PdfPTable(5);
            table.AddCell("Sección");
            table.AddCell("Total Sesiones");
            table.AddCell("Presentes");
            table.AddCell("Ausencias");
            table.AddCell("Porcentaje");

            foreach (var item in data)
            {
                table.AddCell(item.SectionName);
                table.AddCell(item.TotalSessions.ToString());
                table.AddCell(item.TotalPresent.ToString());
                table.AddCell(item.TotalAbsences.ToString());
                table.AddCell($"{item.AttendancePercentage:0.00}%");
            }

            doc.Add(new Paragraph("Estadísticas de Asistencia"));
            doc.Add(new Paragraph(" "));
            doc.Add(table);
            doc.Close();

            return ms.ToArray();
        }
    }
}
